// src/infrastructure/auth/oidc/types.ts
export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  roles: string[];
  groups: string[];
  department?: string;
  employeeId?: string;
  permissions: Permission[];
}

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

export interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, string | number | boolean>;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isActive: boolean;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiresAt: number;
  error?: string;
}

export interface AuthError {
  code: string;
  message: string;
  details?: Record<string, string | number | boolean>;
}

// Resource definitions for the application
export enum Resource {
  PRACTICE = "practice",
  PHARMACY = "pharmacy",
  TRANSACTION = "transaction",
  DASHBOARD = "dashboard",
  USER_MANAGEMENT = "user_management",
  SETTINGS = "settings",
  REPORTS = "reports",
}

// Action definitions
export enum Action {
  CREATE = "create",
  READ = "read",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  EXPORT = "export",
  APPROVE = "approve",
  REJECT = "reject",
}

// Predefined application roles
export enum AppRole {
  ADMIN = "admin",
  BROKER = "broker",
  SENIOR_BROKER = "senior_broker",
  MANAGER = "manager",
  VIEWER = "viewer",
  AUDITOR = "auditor",
}

// Role permissions mapping
export const ROLE_PERMISSIONS: Record<AppRole, Permission[]> = {
  [AppRole.ADMIN]: [
    // Admin has all permissions
    { resource: Resource.PRACTICE, action: Action.CREATE },
    { resource: Resource.PRACTICE, action: Action.READ },
    { resource: Resource.PRACTICE, action: Action.UPDATE },
    { resource: Resource.PRACTICE, action: Action.DELETE },
    { resource: Resource.PRACTICE, action: Action.LIST },
    { resource: Resource.PHARMACY, action: Action.CREATE },
    { resource: Resource.PHARMACY, action: Action.READ },
    { resource: Resource.PHARMACY, action: Action.UPDATE },
    { resource: Resource.PHARMACY, action: Action.DELETE },
    { resource: Resource.PHARMACY, action: Action.LIST },
    { resource: Resource.TRANSACTION, action: Action.CREATE },
    { resource: Resource.TRANSACTION, action: Action.READ },
    { resource: Resource.TRANSACTION, action: Action.UPDATE },
    { resource: Resource.TRANSACTION, action: Action.DELETE },
    { resource: Resource.TRANSACTION, action: Action.LIST },
    { resource: Resource.TRANSACTION, action: Action.APPROVE },
    { resource: Resource.DASHBOARD, action: Action.READ },
    { resource: Resource.USER_MANAGEMENT, action: Action.CREATE },
    { resource: Resource.USER_MANAGEMENT, action: Action.READ },
    { resource: Resource.USER_MANAGEMENT, action: Action.UPDATE },
    { resource: Resource.USER_MANAGEMENT, action: Action.DELETE },
    { resource: Resource.SETTINGS, action: Action.READ },
    { resource: Resource.SETTINGS, action: Action.UPDATE },
    { resource: Resource.REPORTS, action: Action.READ },
    { resource: Resource.REPORTS, action: Action.EXPORT },
  ],
  [AppRole.MANAGER]: [
    { resource: Resource.PRACTICE, action: Action.READ },
    { resource: Resource.PRACTICE, action: Action.UPDATE },
    { resource: Resource.PRACTICE, action: Action.LIST },
    { resource: Resource.PHARMACY, action: Action.READ },
    { resource: Resource.PHARMACY, action: Action.UPDATE },
    { resource: Resource.PHARMACY, action: Action.LIST },
    { resource: Resource.TRANSACTION, action: Action.CREATE },
    { resource: Resource.TRANSACTION, action: Action.READ },
    { resource: Resource.TRANSACTION, action: Action.UPDATE },
    { resource: Resource.TRANSACTION, action: Action.LIST },
    { resource: Resource.TRANSACTION, action: Action.APPROVE },
    { resource: Resource.DASHBOARD, action: Action.READ },
    { resource: Resource.REPORTS, action: Action.READ },
    { resource: Resource.REPORTS, action: Action.EXPORT },
  ],
  [AppRole.SENIOR_BROKER]: [
    { resource: Resource.PRACTICE, action: Action.CREATE },
    { resource: Resource.PRACTICE, action: Action.READ },
    { resource: Resource.PRACTICE, action: Action.UPDATE },
    { resource: Resource.PRACTICE, action: Action.LIST },
    { resource: Resource.PHARMACY, action: Action.CREATE },
    { resource: Resource.PHARMACY, action: Action.READ },
    { resource: Resource.PHARMACY, action: Action.UPDATE },
    { resource: Resource.PHARMACY, action: Action.LIST },
    { resource: Resource.TRANSACTION, action: Action.CREATE },
    { resource: Resource.TRANSACTION, action: Action.READ },
    { resource: Resource.TRANSACTION, action: Action.UPDATE },
    { resource: Resource.TRANSACTION, action: Action.LIST },
    { resource: Resource.DASHBOARD, action: Action.READ },
    { resource: Resource.REPORTS, action: Action.READ },
  ],
  [AppRole.BROKER]: [
    { resource: Resource.PRACTICE, action: Action.READ },
    {
      resource: Resource.PRACTICE,
      action: Action.UPDATE,
      conditions: { ownedBy: "user" },
    },
    { resource: Resource.PRACTICE, action: Action.LIST },
    { resource: Resource.PHARMACY, action: Action.READ },
    {
      resource: Resource.PHARMACY,
      action: Action.UPDATE,
      conditions: { ownedBy: "user" },
    },
    { resource: Resource.PHARMACY, action: Action.LIST },
    { resource: Resource.TRANSACTION, action: Action.CREATE },
    { resource: Resource.TRANSACTION, action: Action.READ },
    {
      resource: Resource.TRANSACTION,
      action: Action.UPDATE,
      conditions: { assignedTo: "user" },
    },
    { resource: Resource.TRANSACTION, action: Action.LIST },
    { resource: Resource.DASHBOARD, action: Action.READ },
  ],
  [AppRole.VIEWER]: [
    { resource: Resource.PRACTICE, action: Action.READ },
    { resource: Resource.PRACTICE, action: Action.LIST },
    { resource: Resource.PHARMACY, action: Action.READ },
    { resource: Resource.PHARMACY, action: Action.LIST },
    { resource: Resource.TRANSACTION, action: Action.READ },
    { resource: Resource.TRANSACTION, action: Action.LIST },
    { resource: Resource.DASHBOARD, action: Action.READ },
  ],
  [AppRole.AUDITOR]: [
    { resource: Resource.PRACTICE, action: Action.READ },
    { resource: Resource.PRACTICE, action: Action.LIST },
    { resource: Resource.PHARMACY, action: Action.READ },
    { resource: Resource.PHARMACY, action: Action.LIST },
    { resource: Resource.TRANSACTION, action: Action.READ },
    { resource: Resource.TRANSACTION, action: Action.LIST },
    { resource: Resource.DASHBOARD, action: Action.READ },
    { resource: Resource.REPORTS, action: Action.READ },
    { resource: Resource.REPORTS, action: Action.EXPORT },
  ],
};
