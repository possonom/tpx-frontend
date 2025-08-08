// src/infrastructure/auth/oidc/index.ts
export * from "./types";
export * from "./client";
export * from "./provider";
export * from "./authorization";
export * from "./middleware";
export * from "./hooks";
export * from "./components";
export * from "./utils";

// Re-export commonly used types and functions
export { AuthorizationService } from "./authorization";
export { OIDCClient } from "./client";
export { createOIDCProvider } from "./provider";
export { useAuth, usePermission, useRole, useAuthGuard } from "./hooks";
export {
  AuthGuard,
  PermissionGate,
  RoleGate,
  AdminOnly,
  ManagerOrHigher,
  AuthenticatedOnly,
  withPermission,
  withRole,
  withAuth,
} from "./components";
export {
  withAuthorization,
  withApiKeyAuth,
  withRateLimit,
  withCors,
  checkAuthorization,
} from "./middleware";

// Common permission and role constants
export { Resource, Action, AppRole, ROLE_PERMISSIONS } from "./types";
