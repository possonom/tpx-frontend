// src/infrastructure/auth/oidc/hooks.ts
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export interface UseAuthOptions {
  required?: boolean;
  redirectTo?: string;
  roles?: string[];
  groups?: string[];
}

interface AuthUser {
  roles?: string[];
  groups?: string[];
  [key: string]: unknown;
}

export function useAuth(options: UseAuthOptions = {}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (options.required && status === "unauthenticated") {
      router.push(options.redirectTo || "/login");
    }
  }, [status, options.required, options.redirectTo, router]);

  const hasRole = (role: string): boolean => {
    const roles = (session?.user as AuthUser)?.roles || [];
    return roles.includes(role);
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some(hasRole);
  };

  const hasAllRoles = (roles: string[]): boolean => {
    const userRoles = (session?.user as AuthUser)?.roles || [];
    return roles.every(role => userRoles.includes(role));
  };

  const hasGroup = (group: string): boolean => {
    const groups = (session?.user as AuthUser)?.groups || [];
    return groups.includes(group);
  };

  const checkAccess = (): boolean => {
    if (options.groups) {
      const groups = (session?.user as AuthUser)?.groups || [];
      if (!options.groups.some((g) => groups.includes(g))) return false;
    }

    // Add other access checks here if needed

    return true;
  };

  return {
    session,
    status,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    hasRole,
    hasAnyRole,
    hasAllRoles,
    hasGroup,
    checkAccess,
    user: session?.user,
  };
}
