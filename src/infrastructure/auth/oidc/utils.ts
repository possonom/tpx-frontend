// src/infrastructure/auth/oidc/utils.ts
import { JWT } from "next-auth/jwt";
import jwt from "jsonwebtoken";

export function decodeIdToken(idToken: string): unknown {
  try {
    return jwt.decode(idToken);
  } catch (error) {
    console.error("Failed to decode ID token:", error);
    return null;
  }
}

export function isTokenExpired(token: JWT): boolean {
  if (!token.expiresAt) return false;
  return Date.now() > (token.expiresAt as number) * 1000;
}

export function getRolesFromToken(token: JWT): string[] {
  return (token as JWT & { roles?: string[] }).roles || [];
}

export function getGroupsFromToken(token: JWT): string[] {
  return (token as JWT & { groups?: string[] }).groups || [];
}

export function hasRequiredRole(token: JWT, requiredRoles: string[]): boolean {
  const userRoles = getRolesFromToken(token);
  return requiredRoles.some((role) => userRoles.includes(role));
}

export function hasRequiredGroup(
  token: JWT,
  requiredGroups: string[]
): boolean {
  const userGroups = getGroupsFromToken(token);
  return requiredGroups.some((group) => userGroups.includes(group));
}

// Format user display name
export function formatUserName(user: { name?: string; email?: string }): string {
  if (user.name) return user.name;
  if (user.email) return user.email.split("@")[0];
  return "User";
}

// Get user initials for avatar
export function getUserInitials(user: { name?: string; email?: string }): string {
  const name = user.name || user.email || "";
  const parts = name.split(/[\s@]+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}
