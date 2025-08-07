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

export function useAuth(options: UseAuthOptions = {}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (options.required && status === "unauthenticated") {
      router.push(options.redirectTo || "/login");
    }
  }, [status, options.required, options.redirectTo, router]);

  const hasRole = (role: string): boolean => {
    const roles = (session?.user as any)?.roles || [];
    return roles.includes(role);
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some(hasRole);
  };

  const hasAllRoles = (roles: string[]): boolean => {
    return roles.every(hasRole);
  };

  const hasGroup = (group: string): boolean => {
    const groups = (session?.user as any)?.groups || [];
    return groups.includes(group);
  };

  const checkAccess = (): boolean => {
    if (!session) return false;

    if (options.roles) {
      if (!hasAnyRole(options.roles)) return false;
    }

    if (options.groups) {
      const groups = (session.user as any)?.groups || [];
      if (!options.groups.some((g) => groups.includes(g))) return false;
    }

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
