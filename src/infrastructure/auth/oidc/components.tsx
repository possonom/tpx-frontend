// src/infrastructure/auth/oidc/components.tsx
"use client";

import React, { ReactNode } from "react";
import { useAuthGuard, usePermission, useRole } from "./hooks";
import { Resource, Action, AppRole } from "./types";
import {
  Spinner,
  MessageBar,
  Button,
  Card,
  CardHeader,
  CardPreview,
  Text,
  Body1,
} from "@fluentui/react-components";
import { LockClosedRegular, WarningRegular } from "@fluentui/react-icons";

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
  unauthorizedFallback?: ReactNode;
  resource?: Resource;
  action?: Action;
  roles?: (AppRole | string)[];
  requireAllRoles?: boolean;
  redirectTo?: string;
}

/**
 * AuthGuard component for protecting routes and components
 */
export function AuthGuard({
  children,
  fallback,
  loadingFallback,
  unauthorizedFallback,
  resource,
  action,
  roles,
  redirectTo,
}: AuthGuardProps) {
  const { isAuthenticated, isAuthorized, isCheckingAuth } = useAuthGuard({
    required: true,
    redirectTo,
    resource,
    action,
    roles,
  });

  // Show loading state
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        {loadingFallback || (
          <div className="flex flex-col items-center gap-4">
            <Spinner size="large" />
            <Text>Checking authentication...</Text>
          </div>
        )}
      </div>
    );
  }

  // Show unauthorized state
  if (!isAuthenticated || !isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        {unauthorizedFallback || fallback || (
          <Card className="max-w-md">
            <CardPreview className="flex justify-center py-8">
              <LockClosedRegular className="text-6xl text-gray-400" />
            </CardPreview>
            <CardHeader
              header={<Text weight="semibold">Access Denied</Text>}
              description={
                <Body1>
                  {!isAuthenticated
                    ? "You need to sign in to access this content."
                    : "You don't have permission to view this content."}
                </Body1>
              }
            />
            {!isAuthenticated && (
              <div className="p-4">
                <Button
                  appearance="primary"
                  onClick={() =>
                    (window.location.href = redirectTo || "/login")
                  }
                >
                  Sign In
                </Button>
              </div>
            )}
          </Card>
        )}
      </div>
    );
  }

  return <>{children}</>;
}

interface PermissionGateProps {
  children: ReactNode;
  resource: Resource | string;
  action: Action | string;
  context?: Record<string, string | number | boolean>;
  fallback?: ReactNode;
  showMessage?: boolean;
}

/**
 * PermissionGate component for fine-grained permission control
 */
export function PermissionGate({
  children,
  resource,
  action,
  context,
  fallback,
  showMessage = false,
}: PermissionGateProps) {
  const { isAllowed, isLoading } = usePermission(resource, action, context);

  if (isLoading) {
    return <Spinner size="tiny" />;
  }

  if (!isAllowed) {
    if (showMessage) {
      return (
        <MessageBar intent="warning" icon={<WarningRegular />}>
          Insufficient permissions for {resource}.{action}
        </MessageBar>
      );
    }
    return <>{fallback || null}</>;
  }

  return <>{children}</>;
}

interface RoleGateProps {
  children: ReactNode;
  roles: (AppRole | string)[];
  requireAll?: boolean;
  fallback?: ReactNode;
  showMessage?: boolean;
}

/**
 * RoleGate component for role-based access control
 */
export function RoleGate({
  children,
  roles,
  requireAll = false,
  fallback,
  showMessage = false,
}: RoleGateProps) {
  const { hasAccess, isLoading } = useRole(roles, requireAll);

  if (isLoading) {
    return <Spinner size="tiny" />;
  }

  if (!hasAccess) {
    if (showMessage) {
      return (
        <MessageBar intent="warning" icon={<WarningRegular />}>
          Required {requireAll ? "all" : "one"} of the following roles:{" "}
          {roles.join(", ")}
        </MessageBar>
      );
    }
    return <>{fallback || null}</>;
  }

  return <>{children}</>;
}

interface ConditionalRenderProps {
  children: ReactNode;
  condition: boolean;
  fallback?: ReactNode;
}

/**
 * ConditionalRender component for simple conditional rendering
 */
export function ConditionalRender({
  children,
  condition,
  fallback,
}: ConditionalRenderProps) {
  return condition ? <>{children}</> : <>{fallback || null}</>;
}

interface AdminOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * AdminOnly component - shortcut for admin-only content
 */
export function AdminOnly({ children, fallback }: AdminOnlyProps) {
  return (
    <RoleGate roles={[AppRole.ADMIN]} fallback={fallback}>
      {children}
    </RoleGate>
  );
}

interface ManagerOrHigherProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * ManagerOrHigher component - shortcut for manager+ content
 */
export function ManagerOrHigher({ children, fallback }: ManagerOrHigherProps) {
  return (
    <RoleGate roles={[AppRole.ADMIN, AppRole.MANAGER]} fallback={fallback}>
      {children}
    </RoleGate>
  );
}

interface AuthenticatedOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * AuthenticatedOnly component - require any authentication
 */
export function AuthenticatedOnly({
  children,
  fallback,
}: AuthenticatedOnlyProps) {
  return <AuthGuard fallback={fallback}>{children}</AuthGuard>;
}

// Utility function to create higher-order components for permission checking
export function withPermission(
  resource: Resource | string,
  action: Action | string,
  context?: Record<string, string | number | boolean>
) {
  return function <P extends Record<string, unknown>>(
    Component: React.ComponentType<P>
  ): React.ComponentType<P> {
    return function PermissionWrapper(props: P) {
      return (
        <PermissionGate resource={resource} action={action} context={context}>
          <Component {...props} />
        </PermissionGate>
      );
    };
  };
}

// Utility function to create higher-order components for role checking
export function withRole(
  roles: (AppRole | string)[],
  requireAll: boolean = false
) {
  return function <P extends Record<string, unknown>>(
    Component: React.ComponentType<P>
  ): React.ComponentType<P> {
    return function RoleWrapper(props: P) {
      return (
        <RoleGate roles={roles} requireAll={requireAll}>
          <Component {...props} />
        </RoleGate>
      );
    };
  };
}

// Utility function to create higher-order components for authentication
export function withAuth(options: Omit<AuthGuardProps, "children"> = {}) {
  return function <P extends Record<string, unknown>>(
    Component: React.ComponentType<P>
  ): React.ComponentType<P> {
    return function AuthWrapper(props: P) {
      return (
        <AuthGuard {...options}>
          <Component {...props} />
        </AuthGuard>
      );
    };
  };
}
