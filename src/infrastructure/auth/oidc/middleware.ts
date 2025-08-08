// src/infrastructure/auth/oidc/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { AuthorizationService } from "./authorization";
import { User, Resource, Action, AppRole } from "./types";

export interface AuthorizationRule {
  path: string;
  roles?: string[];
  groups?: string[];
  method?: string | string[];
  resource?: Resource;
  action?: Action;
  allowPublic?: boolean;
}

// Comprehensive authorization rules for the application
const authorizationRules: AuthorizationRule[] = [
  // Public routes
  { path: "/login", allowPublic: true },
  { path: "/api/auth", allowPublic: true },
  { path: "/api/health", allowPublic: true },

  // Dashboard access
  { path: "/dashboard", resource: Resource.DASHBOARD, action: Action.READ },

  // Practice management
  { path: "/practices", resource: Resource.PRACTICE, action: Action.LIST },
  {
    path: "/practices/new",
    resource: Resource.PRACTICE,
    action: Action.CREATE,
  },
  {
    path: "/api/v1/practices",
    resource: Resource.PRACTICE,
    action: Action.LIST,
    method: "GET",
  },
  {
    path: "/api/v1/practices",
    resource: Resource.PRACTICE,
    action: Action.CREATE,
    method: "POST",
  },
  {
    path: "/api/v1/practices",
    resource: Resource.PRACTICE,
    action: Action.UPDATE,
    method: ["PUT", "PATCH"],
  },
  {
    path: "/api/v1/practices",
    resource: Resource.PRACTICE,
    action: Action.DELETE,
    method: "DELETE",
  },

  // Pharmacy management
  { path: "/pharmacies", resource: Resource.PHARMACY, action: Action.LIST },
  {
    path: "/pharmacies/new",
    resource: Resource.PHARMACY,
    action: Action.CREATE,
  },
  {
    path: "/api/v1/pharmacies",
    resource: Resource.PHARMACY,
    action: Action.LIST,
    method: "GET",
  },
  {
    path: "/api/v1/pharmacies",
    resource: Resource.PHARMACY,
    action: Action.CREATE,
    method: "POST",
  },
  {
    path: "/api/v1/pharmacies",
    resource: Resource.PHARMACY,
    action: Action.UPDATE,
    method: ["PUT", "PATCH"],
  },
  {
    path: "/api/v1/pharmacies",
    resource: Resource.PHARMACY,
    action: Action.DELETE,
    method: "DELETE",
  },

  // Transaction management
  {
    path: "/transactions",
    resource: Resource.TRANSACTION,
    action: Action.LIST,
  },
  {
    path: "/transactions/new",
    resource: Resource.TRANSACTION,
    action: Action.CREATE,
  },
  {
    path: "/api/v1/transactions",
    resource: Resource.TRANSACTION,
    action: Action.LIST,
    method: "GET",
  },
  {
    path: "/api/v1/transactions",
    resource: Resource.TRANSACTION,
    action: Action.CREATE,
    method: "POST",
  },
  {
    path: "/api/v1/transactions",
    resource: Resource.TRANSACTION,
    action: Action.UPDATE,
    method: ["PUT", "PATCH"],
  },
  {
    path: "/api/v1/transactions",
    resource: Resource.TRANSACTION,
    action: Action.DELETE,
    method: "DELETE",
  },

  // Admin routes
  { path: "/users", resource: Resource.USER_MANAGEMENT, action: Action.READ },
  { path: "/settings", resource: Resource.SETTINGS, action: Action.READ },
  { path: "/reports", resource: Resource.REPORTS, action: Action.READ },

  // API Admin routes
  { path: "/api/v1/admin", roles: [AppRole.ADMIN] },
  {
    path: "/api/v1/users",
    resource: Resource.USER_MANAGEMENT,
    action: Action.READ,
    method: "GET",
  },
  {
    path: "/api/v1/users",
    resource: Resource.USER_MANAGEMENT,
    action: Action.CREATE,
    method: "POST",
  },
  {
    path: "/api/v1/reports",
    resource: Resource.REPORTS,
    action: Action.READ,
    method: "GET",
  },
  {
    path: "/api/v1/reports/export",
    resource: Resource.REPORTS,
    action: Action.EXPORT,
    method: "POST",
  },
];

interface AuthToken {
  sub: string;
  name: string;
  email: string;
  roles?: string[];
  groups?: string[];
  [key: string]: unknown;
}

export async function checkAuthorization(
  request: NextRequest
): Promise<{ authorized: boolean; reason?: string; user?: User }> {
  const token = (await getToken({ req: request })) as AuthToken | null;
  const path = request.nextUrl.pathname;
  const method = request.method;

  // Find matching rule
  const rule = findMatchingRule(path, method, authorizationRules);

  // Allow public routes
  if (rule?.allowPublic) {
    return { authorized: true };
  }

  // Require authentication for protected routes
  if (!token) {
    return { authorized: false, reason: "Authentication required" };
  }

  // Create user object from token
  const user: User = {
    id: token.sub,
    name: token.name,
    email: token.email,
    roles: token.roles || [],
    groups: token.groups || [],
    permissions: AuthorizationService.getUserPermissions({
      id: token.sub,
      name: token.name,
      email: token.email,
      roles: token.roles || [],
      groups: token.groups || [],
      permissions: [],
    }),
  };

  // If no specific rule found, allow access (fallback behavior)
  if (!rule) {
    return { authorized: true, user };
  }

  // Check resource-based permissions
  if (rule.resource && rule.action) {
    const hasPermission = AuthorizationService.hasPermission(
      user,
      rule.resource,
      rule.action
    );
    if (!hasPermission) {
      AuthorizationService.auditPermissionCheck(
        user,
        rule.resource,
        rule.action,
        { path, method },
        false
      );
      return {
        authorized: false,
        reason: `Insufficient permissions: ${rule.resource}.${rule.action}`,
        user,
      };
    }

    AuthorizationService.auditPermissionCheck(
      user,
      rule.resource,
      rule.action,
      { path, method },
      true
    );
    return { authorized: true, user };
  }

  // Check role-based access (legacy support)
  if (rule.roles) {
    const hasRole = AuthorizationService.hasRole(user, rule.roles);
    if (!hasRole) {
      return {
        authorized: false,
        reason: `Required roles: ${rule.roles.join(", ")}`,
        user,
      };
    }
  }

  // Check group-based access
  if (rule.groups) {
    const userGroups = user.groups || [];
    const hasGroup = rule.groups.some((group: string) =>
      userGroups.includes(group)
    );
    if (!hasGroup) {
      return {
        authorized: false,
        reason: `Required groups: ${rule.groups.join(", ")}`,
        user,
      };
    }
  }

  return { authorized: true, user };
}

function findMatchingRule(
  path: string,
  method: string,
  rules: AuthorizationRule[]
): AuthorizationRule | undefined {
  return rules.find((rule) => {
    // Check path match (exact or prefix)
    if (!path.startsWith(rule.path) && path !== rule.path) {
      return false;
    }

    // Check method match
    if (rule.method) {
      const methods = Array.isArray(rule.method) ? rule.method : [rule.method];
      if (!methods.includes(method)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Enhanced middleware for Next.js API routes
 */
export function withAuthorization(
  handler: (
    req: NextRequest,
    context?: Record<string, unknown>
  ) => Promise<NextResponse>
) {
  return async (
    req: NextRequest,
    context?: Record<string, unknown>
  ): Promise<NextResponse> => {
    const authResult = await checkAuthorization(req);

    if (!authResult.authorized) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: authResult.reason || "Access denied",
          code: "AUTHORIZATION_FAILED",
        },
        { status: 401 }
      );
    }

    // Add user to request context if available
    if (authResult.user) {
      (req as unknown as { user: User }).user = authResult.user;
    }

    return handler(req, context);
  };
}

/**
 * Middleware for checking API key authentication (for MCP backend access)
 */
export function withApiKeyAuth(
  handler: (
    req: NextRequest,
    context?: Record<string, unknown>
  ) => Promise<NextResponse>
) {
  return async (
    req: NextRequest,
    context?: Record<string, unknown>
  ): Promise<NextResponse> => {
    const apiKey =
      req.headers.get("x-api-key") ||
      req.headers.get("authorization")?.replace("Bearer ", "");

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key required", code: "API_KEY_MISSING" },
        { status: 401 }
      );
    }

    // Validate API key (in production, this would check against a database)
    const validApiKeys = process.env.VALID_API_KEYS?.split(",") || [];
    if (!validApiKeys.includes(apiKey)) {
      return NextResponse.json(
        { error: "Invalid API key", code: "API_KEY_INVALID" },
        { status: 401 }
      );
    }

    // Add API key user context
    (req as unknown as { apiUser: Record<string, unknown> }).apiUser = {
      type: "api_key",
      id: "api_user",
      name: "API Access",
      permissions: ["read", "write"], // Define based on API key level
    };

    return handler(req, context);
  };
}

/**
 * Rate limiting middleware
 */
export function withRateLimit(
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
) {
  const requestCounts = new Map<string, { count: number; resetTime: number }>();

  return function (
    handler: (
      req: NextRequest,
      context?: Record<string, unknown>
    ) => Promise<NextResponse>
  ) {
    return async (
      req: NextRequest,
      context?: Record<string, unknown>
    ): Promise<NextResponse> => {
      const clientIp =
        req.headers.get("x-forwarded-for") ||
        req.headers.get("x-real-ip") ||
        "unknown";
      const now = Date.now();

      const clientData = requestCounts.get(clientIp);

      if (!clientData || now > clientData.resetTime) {
        // Reset or initialize
        requestCounts.set(clientIp, {
          count: 1,
          resetTime: now + windowMs,
        });
      } else {
        // Increment count
        clientData.count++;

        if (clientData.count > maxRequests) {
          return NextResponse.json(
            {
              error: "Rate limit exceeded",
              message: `Too many requests. Limit: ${maxRequests} per ${
                windowMs / 1000
              }s`,
              code: "RATE_LIMIT_EXCEEDED",
            },
            {
              status: 429,
              headers: {
                "Retry-After": String(
                  Math.ceil((clientData.resetTime - now) / 1000)
                ),
              },
            }
          );
        }
      }

      return handler(req, context);
    };
  };
}

/**
 * CORS middleware
 */
export function withCors(
  handler: (
    req: NextRequest,
    context?: Record<string, unknown>
  ) => Promise<NextResponse>
) {
  return async (
    req: NextRequest,
    context?: Record<string, unknown>
  ): Promise<NextResponse> => {
    // Handle preflight requests
    if (req.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGINS || "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers":
            "Content-Type, Authorization, x-api-key",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    const response = await handler(req, context);

    // Add CORS headers to response
    response.headers.set(
      "Access-Control-Allow-Origin",
      process.env.ALLOWED_ORIGINS || "*"
    );
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, x-api-key"
    );

    return response;
  };
}
