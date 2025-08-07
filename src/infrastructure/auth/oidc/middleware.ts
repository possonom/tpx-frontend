// src/infrastructure/auth/oidc/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export interface AuthorizationRule {
  path: string;
  roles?: string[];
  groups?: string[];
  method?: string | string[];
}

const authorizationRules: AuthorizationRule[] = [
  {
    path: "/api/v1/practices",
    roles: ["broker", "admin"],
    method: ["POST", "PUT", "DELETE"],
  },
  {
    path: "/api/v1/pharmacies",
    roles: ["broker", "admin"],
    method: ["POST", "PUT", "DELETE"],
  },
  { path: "/api/v1/transactions", roles: ["broker", "admin"] },
  { path: "/api/v1/admin", roles: ["admin"] },
  { path: "/dashboard/admin", roles: ["admin"] },
];

export async function checkAuthorization(
  request: NextRequest
): Promise<{ authorized: boolean; reason?: string }> {
  const token = await getToken({ req: request });

  if (!token) {
    return { authorized: false, reason: "No authentication token" };
  }

  const path = request.nextUrl.pathname;
  const method = request.method;

  // Find matching rule
  const rule = authorizationRules.find((r) => {
    if (!path.startsWith(r.path)) return false;
    if (r.method) {
      const methods = Array.isArray(r.method) ? r.method : [r.method];
      if (!methods.includes(method)) return false;
    }
    return true;
  });

  if (!rule) {
    return { authorized: true }; // No rule means public access
  }

  // Check roles
  if (rule.roles) {
    const userRoles = (token as any).roles || [];
    const hasRole = rule.roles.some((role) => userRoles.includes(role));
    if (!hasRole) {
      return {
        authorized: false,
        reason: `Required roles: ${rule.roles.join(", ")}`,
      };
    }
  }

  // Check groups
  if (rule.groups) {
    const userGroups = (token as any).groups || [];
    const hasGroup = rule.groups.some((group) => userGroups.includes(group));
    if (!hasGroup) {
      return {
        authorized: false,
        reason: `Required groups: ${rule.groups.join(", ")}`,
      };
    }
  }

  return { authorized: true };
}
