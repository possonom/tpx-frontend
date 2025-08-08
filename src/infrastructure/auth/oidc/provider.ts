// src/infrastructure/auth/oidc/provider.ts
import { OAuthConfig } from "next-auth/providers/oauth";
import { OIDCProfile } from "./types";

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
  };
}
