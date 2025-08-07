// src/infrastructure/auth/oidc/provider.ts
import { OAuthConfig } from "next-auth/providers";
import oidcClient from "./client";

export interface OIDCProfile {
  sub: string;
  name: string;
  email: string;
  email_verified?: boolean;
  picture?: string;
  roles?: string[];
  groups?: string[];
  department?: string;
  employee_id?: string;
}

export function createOIDCProvider(): OAuthConfig<OIDCProfile> {
  return {
    id: "oidc",
    name: "Corporate SSO",
    type: "oauth",
    wellKnown: `${process.env.OIDC_ISSUER}/.well-known/openid-configuration`,
    authorization: {
      params: {
        scope: "openid profile email roles groups",
        prompt: "select_account",
      },
    },
    idToken: true,
    checks: ["pkce", "state", "nonce"],
    clientId: process.env.OIDC_CLIENT_ID!,
    clientSecret: process.env.OIDC_CLIENT_SECRET!,

    profile(profile: OIDCProfile) {
      return {
        id: profile.sub,
        name: profile.name,
        email: profile.email,
        image: profile.picture,
        roles: profile.roles || [],
        groups: profile.groups || [],
        department: profile.department,
        employeeId: profile.employee_id,
      };
    },

    // Custom token handling
    async token({ token, account, profile }) {
      if (account && profile) {
        const oidcProfile = profile as OIDCProfile;
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.idToken = account.id_token;
        token.expiresAt = account.expires_at;
        token.roles = oidcProfile.roles || [];
        token.groups = oidcProfile.groups || [];
      }

      // Refresh token if expired
      if (token.expiresAt && Date.now() > (token.expiresAt as number) * 1000) {
        try {
          const refreshed = await oidcClient.refresh(
            token.refreshToken as string
          );
          return {
            ...token,
            accessToken: refreshed.access_token,
            refreshToken: refreshed.refresh_token,
            idToken: refreshed.id_token,
            expiresAt: refreshed.expires_at,
          };
        } catch (error) {
          console.error("Token refresh failed:", error);
          return { ...token, error: "RefreshTokenError" };
        }
      }

      return token;
    },
  };
}
