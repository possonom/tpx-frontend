// src/infrastructure/auth/oidc/client.ts
import * as client from "openid-client";
import { randomBytes } from "crypto";

export class OIDCClient {
  private config: client.Configuration | null = null;
  private issuerUrl: URL | null = null;

  async initialize(): Promise<void> {
    if (!process.env.OIDC_ISSUER) {
      throw new Error("OIDC_ISSUER environment variable is not set");
    }

    this.issuerUrl = new URL(process.env.OIDC_ISSUER);

    // Discover OIDC provider configuration
    this.config = await client.discovery(
      this.issuerUrl,
      process.env.OIDC_CLIENT_ID!,
      process.env.OIDC_CLIENT_SECRET!
    );
  }

  getConfig(): client.Configuration {
    if (!this.config) {
      throw new Error("OIDC Client not initialized");
    }
    return this.config;
  }

  // Generate random strings for OAuth2/OIDC
  generateRandomString(length: number = 32): string {
    return randomBytes(length).toString("base64url");
  }

  generateState(): string {
    return this.generateRandomString(32);
  }

  generateNonce(): string {
    return this.generateRandomString(32);
  }

  generatePKCE(): {
    codeVerifier: string;
    codeChallenge: string;
    method: string;
  } {
    const codeVerifier = this.generateRandomString(43); // 43 chars for 256 bits
    const codeChallenge = client.calculatePKCECodeChallenge(codeVerifier);
    return {
      codeVerifier,
      codeChallenge,
      method: "S256",
    };
  }

  buildAuthorizationUrl(
    options: {
      state?: string;
      nonce?: string;
      codeChallenge?: string;
      codeChallengeMethod?: string;
      scope?: string;
    } = {}
  ): URL {
    const config = this.getConfig();

    const parameters = new URLSearchParams({
      client_id: process.env.OIDC_CLIENT_ID!,
      redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/oidc`,
      response_type: "code",
      scope: options.scope || "openid profile email",
    });

    if (options.state) parameters.set("state", options.state);
    if (options.nonce) parameters.set("nonce", options.nonce);
    if (options.codeChallenge) {
      parameters.set("code_challenge", options.codeChallenge);
      parameters.set(
        "code_challenge_method",
        options.codeChallengeMethod || "S256"
      );
    }

    const authorizationEndpoint =
      config.serverMetadata().authorization_endpoint!;
    const url = new URL(authorizationEndpoint);
    url.search = parameters.toString();

    return url;
  }

  async exchangeAuthorizationCode(
    callbackUrl: URL | string,
    options: {
      expectedState?: string;
      expectedNonce?: string;
      codeVerifier?: string;
    } = {}
  ): Promise<client.TokenEndpointResponse> {
    const config = this.getConfig();
    const currentUrl =
      typeof callbackUrl === "string" ? new URL(callbackUrl) : callbackUrl;

    const tokens = await client.authorizationCodeGrant(config, currentUrl, {
      expectedState: options.expectedState,
      expectedNonce: options.expectedNonce,
      pkceCodeVerifier: options.codeVerifier,
    });

    return tokens;
  }

  async refreshAccessToken(
    refreshToken: string
  ): Promise<client.TokenEndpointResponse> {
    const config = this.getConfig();
    return await client.refreshTokenGrant(config, refreshToken);
  }

  async getUserInfo(accessToken: string): Promise<client.UserInfoResponse> {
    const config = this.getConfig();
    return await client.fetchUserInfo(config, accessToken);
  }

  // Helper to get ID token claims
  getIdTokenClaims(
    tokens: client.TokenEndpointResponse
  ): client.IDToken | undefined {
    return tokens.claims();
  }
}
