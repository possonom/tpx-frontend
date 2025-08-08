"use client";

// src/infrastructure/auth/oidc/hooks.ts
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useCallback } from "react";
import { AuthorizationService } from "./authorization";
import { User, Resource, Action, AppRole } from "./types";

export interface UseAuthOptions {
  required?: boolean;
  redirectTo?: string;
  roles?: string[];
  groups?: string[];
  resource?: Resource;
  action?: Action;
}

interface AuthSession {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
    roles?: string[];
    groups?: string[];
    department?: string;
    employeeId?: string;
  };
}

export function useAuth(options: UseAuthOptions = {}) {
  const { data: session, status } = useSession() as {
    data: AuthSession | null;
    status: string;
  };
  const router = useRouter();

  // Enhanced user object with permissions
  const user: User | null = useMemo(() => {
    if (!session?.user) return null;

    const baseUser: User = {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
      roles: session.user.roles || [],
      groups: session.user.groups || [],
      department: session.user.department,
      employeeId: session.user.employeeId,
      permissions: [],
    };

    // Add permissions based on roles
    baseUser.permissions = AuthorizationService.getUserPermissions(baseUser);

    return baseUser;
  }, [session]);

  useEffect(() => {
    if (options.required && status === "unauthenticated") {
      router.push(options.redirectTo || "/login");
    }
  }, [status, options.required, options.redirectTo, router]);

  // Permission checking functions
  const hasPermission = useCallback(
    (
      resource: Resource | string,
      action: Action | string,
      context?: Record<string, string | number | boolean>
    ): boolean => {
      if (!user) return false;
      return AuthorizationService.hasPermission(
        user,
        resource,
        action,
        context
      );
    },
    [user]
  );

  const hasRole = useCallback(
    (role: AppRole | string): boolean => {
      if (!user) return false;
      return AuthorizationService.hasRole(user, [role]);
    },
    [user]
  );

  const hasAnyRole = useCallback(
    (roles: (AppRole | string)[]): boolean => {
      if (!user) return false;
      return AuthorizationService.hasRole(user, roles);
    },
    [user]
  );

  const hasAllRoles = useCallback(
    (roles: (AppRole | string)[]): boolean => {
      if (!user) return false;
      return AuthorizationService.hasAllRoles(user, roles);
    },
    [user]
  );

  const hasGroup = useCallback(
    (group: string): boolean => {
      if (!user) return false;
      return user.groups.includes(group);
    },
    [user]
  );

  const canAccessRoute = useCallback(
    (route: string): boolean => {
      if (!user) return false;
      return AuthorizationService.canAccessRoute(user, route);
    },
    [user]
  );

  const isAdmin = useCallback((): boolean => {
    if (!user) return false;
    return AuthorizationService.isAdmin(user);
  }, [user]);

  const isManagerOrHigher = useCallback((): boolean => {
    if (!user) return false;
    return AuthorizationService.isManagerOrHigher(user);
  }, [user]);

  const canApproveTransactions = useCallback((): boolean => {
    if (!user) return false;
    return AuthorizationService.canApproveTransactions(user);
  }, [user]);

  const checkAccess = useCallback((): boolean => {
    if (!user) return false;

    // Check role requirements
    if (options.roles && !hasAnyRole(options.roles)) {
      return false;
    }

    // Check group requirements
    if (options.groups && !options.groups.some((group) => hasGroup(group))) {
      return false;
    }

    // Check resource/action requirements
    if (options.resource && options.action) {
      return hasPermission(options.resource, options.action);
    }

    return true;
  }, [user, options, hasAnyRole, hasGroup, hasPermission]);

  const getAccessibleResources = useCallback(() => {
    if (!user) return [];
    return AuthorizationService.getAccessibleResources(user);
  }, [user]);

  return {
    session,
    status,
    user,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    hasPermission,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    hasGroup,
    canAccessRoute,
    isAdmin,
    isManagerOrHigher,
    canApproveTransactions,
    checkAccess,
    getAccessibleResources,
  };
}

/**
 * Hook for checking specific permissions
 */
export function usePermission(
  resource: Resource | string,
  action: Action | string,
  context?: Record<string, string | number | boolean>
) {
  const { hasPermission, user, isLoading } = useAuth();

  const isAllowed = useMemo(() => {
    if (isLoading || !user) return false;
    return hasPermission(resource, action, context);
  }, [hasPermission, resource, action, context, user, isLoading]);

  return {
    isAllowed,
    isLoading,
    user,
  };
}

/**
 * Hook for role-based access control
 */
export function useRole(
  roles: (AppRole | string)[],
  requireAll: boolean = false
) {
  const { hasAnyRole, hasAllRoles, user, isLoading } = useAuth();

  const hasAccess = useMemo(() => {
    if (isLoading || !user) return false;
    return requireAll ? hasAllRoles(roles) : hasAnyRole(roles);
  }, [hasAnyRole, hasAllRoles, roles, requireAll, user, isLoading]);

  return {
    hasAccess,
    isLoading,
    user,
  };
}

/**
 * Hook for protecting routes with authentication
 */
export function useAuthGuard(options: UseAuthOptions = {}) {
  const auth = useAuth({ required: true, ...options });
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (auth.isLoading) {
      setIsAuthorized(null);
      return;
    }

    if (!auth.isAuthenticated) {
      setIsAuthorized(false);
      return;
    }

    setIsAuthorized(auth.checkAccess());
  }, [auth]);

  return {
    ...auth,
    isAuthorized,
    isCheckingAuth: isAuthorized === null,
  };
}

/**
 * Hook for filtering data based on permissions
 */
export function usePermissionFilter<T extends Record<string, unknown>>(
  data: T[],
  resource: Resource,
  action: Action,
  getContext: (item: T) => Record<string, string | number | boolean>
) {
  const { user } = useAuth();

  const filteredData = useMemo(() => {
    if (!user || !data.length) return [];
    return AuthorizationService.filterByPermissions(
      user,
      data,
      resource,
      action,
      getContext
    );
  }, [user, data, resource, action, getContext]);

  return filteredData;
}

/**
 * Hook for getting user's accessible menu items
 */
export function useAccessibleMenu() {
  const { user, canAccessRoute } = useAuth();

  const menuItems = useMemo(() => {
    if (!user) return [];

    const allMenuItems = [
      { path: "/dashboard", label: "Dashboard", icon: "Dashboard" },
      {
        path: "/practices",
        label: "Medical Practices",
        icon: "MedicalServices",
      },
      { path: "/pharmacies", label: "Pharmacies", icon: "LocalPharmacy" },
      { path: "/transactions", label: "Transactions", icon: "SwapHoriz" },
      { path: "/reports", label: "Reports", icon: "Assessment" },
      { path: "/settings", label: "Settings", icon: "Settings" },
      { path: "/users", label: "User Management", icon: "People" },
    ];

    return allMenuItems.filter((item) => canAccessRoute(item.path));
  }, [user, canAccessRoute]);

  return menuItems;
}

/**
 * Hook for getting current user context
 */
export function useCurrentUser() {
  const { user, isAuthenticated, isLoading } = useAuth();

  return {
    user,
    isAuthenticated,
    isLoading,
    userId: user?.id,
    userEmail: user?.email,
    userName: user?.name,
    userRoles: user?.roles || [],
    userGroups: user?.groups || [],
    userDepartment: user?.department,
    userEmployeeId: user?.employeeId,
  };
}
