// src/infrastructure/auth/oidc/index.ts
export { default as oidcClient, OIDCClient } from "./client";
export { createOIDCProvider } from "./provider";
export type { OIDCProfile } from "./provider";
export { checkAuthorization } from "./middleware";
export type { AuthorizationRule } from "./middleware";
export { useAuth } from "./hooks";
export type { UseAuthOptions } from "./hooks";
export * from "./utils";
