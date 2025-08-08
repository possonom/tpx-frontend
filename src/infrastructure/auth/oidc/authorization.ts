// src/infrastructure/auth/oidc/authorization.ts
import {
  User,
  Permission,
  Resource,
  Action,
  AppRole,
  ROLE_PERMISSIONS,
} from "./types";

export class AuthorizationService {
  /**
   * Check if user has permission to perform action on resource
   */
  static hasPermission(
    user: User,
    resource: Resource | string,
    action: Action | string,
    context?: Record<string, string | number | boolean>
  ): boolean {
    if (!user || !user.permissions) {
      return false;
    }

    // Check if user has the specific permission
    const hasDirectPermission = user.permissions.some((permission) => {
      if (permission.resource !== resource || permission.action !== action) {
        return false;
      }

      // If permission has conditions, check them against context
      if (permission.conditions && context) {
        return this.checkConditions(permission.conditions, context, user);
      }

      return true;
    });

    return hasDirectPermission;
  }

  /**
   * Check if user has any of the specified roles
   */
  static hasRole(user: User, roles: AppRole[] | string[]): boolean {
    if (!user || !user.roles) {
      return false;
    }

    return roles.some((role) => user.roles.includes(role));
  }

  /**
   * Check if user has all of the specified roles
   */
  static hasAllRoles(user: User, roles: AppRole[] | string[]): boolean {
    if (!user || !user.roles) {
      return false;
    }

    return roles.every((role) => user.roles.includes(role));
  }

  /**
   * Get all permissions for a user based on their roles
   */
  static getUserPermissions(user: User): Permission[] {
    if (!user || !user.roles) {
      return [];
    }

    const permissions: Permission[] = [];

    user.roles.forEach((role) => {
      const rolePermissions = ROLE_PERMISSIONS[role as AppRole];
      if (rolePermissions) {
        permissions.push(...rolePermissions);
      }
    });

    // Remove duplicates based on resource and action
    const uniquePermissions = permissions.filter((permission, index, array) => {
      return (
        index ===
        array.findIndex(
          (p) =>
            p.resource === permission.resource &&
            p.action === permission.action &&
            JSON.stringify(p.conditions) ===
              JSON.stringify(permission.conditions)
        )
      );
    });

    return uniquePermissions;
  }

  /**
   * Check if user can access a specific route
   */
  static canAccessRoute(user: User, route: string): boolean {
    if (!user) return false;

    // Define route access rules
    const routePermissions: Record<
      string,
      { resource: Resource; action: Action }
    > = {
      "/dashboard": { resource: Resource.DASHBOARD, action: Action.READ },
      "/practices": { resource: Resource.PRACTICE, action: Action.LIST },
      "/practices/new": { resource: Resource.PRACTICE, action: Action.CREATE },
      "/pharmacies": { resource: Resource.PHARMACY, action: Action.LIST },
      "/pharmacies/new": { resource: Resource.PHARMACY, action: Action.CREATE },
      "/transactions": { resource: Resource.TRANSACTION, action: Action.LIST },
      "/transactions/new": {
        resource: Resource.TRANSACTION,
        action: Action.CREATE,
      },
      "/settings": { resource: Resource.SETTINGS, action: Action.READ },
      "/reports": { resource: Resource.REPORTS, action: Action.READ },
      "/users": { resource: Resource.USER_MANAGEMENT, action: Action.READ },
    };

    const requiredPermission = routePermissions[route];
    if (!requiredPermission) {
      // If route is not defined, allow access (could be public or handled elsewhere)
      return true;
    }

    return this.hasPermission(
      user,
      requiredPermission.resource,
      requiredPermission.action
    );
  }

  /**
   * Filter data based on user permissions and context
   */
  static filterByPermissions<T extends Record<string, unknown>>(
    user: User,
    data: T[],
    resource: Resource,
    action: Action,
    getContext: (item: T) => Record<string, string | number | boolean>
  ): T[] {
    if (!user) return [];

    return data.filter((item) => {
      const context = getContext(item);
      return this.hasPermission(user, resource, action, context);
    });
  }

  /**
   * Check if user is admin
   */
  static isAdmin(user: User): boolean {
    return this.hasRole(user, [AppRole.ADMIN]);
  }

  /**
   * Check if user is manager or higher
   */
  static isManagerOrHigher(user: User): boolean {
    return this.hasRole(user, [AppRole.ADMIN, AppRole.MANAGER]);
  }

  /**
   * Check if user can approve transactions
   */
  static canApproveTransactions(user: User): boolean {
    return this.hasPermission(user, Resource.TRANSACTION, Action.APPROVE);
  }

  /**
   * Get accessible resources for user
   */
  static getAccessibleResources(
    user: User
  ): { resource: Resource; actions: Action[] }[] {
    if (!user) return [];

    const permissions = this.getUserPermissions(user);
    const resourceMap = new Map<Resource, Set<Action>>();

    permissions.forEach((permission) => {
      const resource = permission.resource as Resource;
      const action = permission.action as Action;

      if (!resourceMap.has(resource)) {
        resourceMap.set(resource, new Set());
      }
      resourceMap.get(resource)!.add(action);
    });

    return Array.from(resourceMap.entries()).map(([resource, actions]) => ({
      resource,
      actions: Array.from(actions),
    }));
  }

  /**
   * Check conditions against context and user
   */
  private static checkConditions(
    conditions: Record<string, string | number | boolean>,
    context: Record<string, string | number | boolean>,
    user: User
  ): boolean {
    return Object.entries(conditions).every(([key, value]) => {
      // Special condition handling
      if (key === "ownedBy" && value === "user") {
        return context.userId === user.id || context.ownerId === user.id;
      }

      if (key === "assignedTo" && value === "user") {
        return (
          context.assignedUserId === user.id || context.brokerId === user.id
        );
      }

      if (key === "department") {
        return user.department === value;
      }

      if (key === "group") {
        return user.groups.includes(value as string);
      }

      // Direct comparison
      return context[key] === value;
    });
  }

  /**
   * Audit permission check (for logging purposes)
   */
  static auditPermissionCheck(
    user: User,
    resource: Resource | string,
    action: Action | string,
    context?: Record<string, string | number | boolean>,
    granted: boolean = false
  ): void {
    const auditLog = {
      timestamp: new Date().toISOString(),
      userId: user.id,
      userEmail: user.email,
      userRoles: user.roles,
      resource,
      action,
      context,
      granted,
    };

    // In production, this would go to a proper audit logging service
    console.log("[AUDIT] Permission Check:", auditLog);
  }
}

/**
 * Decorator for method-level authorization
 */
export function RequirePermission(resource: Resource, action: Action) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (
      this: { getCurrentUser?: () => User; user?: User },
      ...args: unknown[]
    ) {
      const user = this.getCurrentUser?.() || this.user;

      if (!user) {
        throw new Error("Authentication required");
      }

      if (!AuthorizationService.hasPermission(user, resource, action)) {
        throw new Error(`Insufficient permissions: ${resource}.${action}`);
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * Decorator for role-based authorization
 */
export function RequireRole(...roles: AppRole[]) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (
      this: { getCurrentUser?: () => User; user?: User },
      ...args: unknown[]
    ) {
      const user = this.getCurrentUser?.() || this.user;

      if (!user) {
        throw new Error("Authentication required");
      }

      if (!AuthorizationService.hasRole(user, roles)) {
        throw new Error(
          `Insufficient role: requires one of ${roles.join(", ")}`
        );
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
