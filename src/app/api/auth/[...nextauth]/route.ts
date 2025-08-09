// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createOIDCProvider } from "@domain/infrastructure/auth/oidc/provider";
import { AuthorizationService } from "@domain/infrastructure/auth/oidc/authorization";
import {
  User,
  OIDCProfile,
  Permission,
} from "@domain/infrastructure/auth/oidc/types";

interface ExtendedSession extends Session {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
    roles: string[];
    groups: string[];
    department?: string;
    employeeId?: string;
    permissions: Permission[];
    accessToken?: string;
  };
  error?: string;
}

interface CredentialsUser {
  id: string;
  email: string;
  name: string;
  roles: string[];
  groups: string[];
  department?: string;
  employeeId?: string;
}

export const authOptions: NextAuthOptions = {
  providers: process.env.OIDC_ISSUER
    ? [createOIDCProvider()]
    : [
        CredentialsProvider({
          name: "Development Login",
          credentials: {
            email: {
              label: "Email",
              type: "email",
              placeholder: "admin@thp-ag.com",
            },
            password: { label: "Password", type: "password" },
          },
          async authorize(credentials) {
            // Development-only login
            if (
              credentials?.email === "admin@thp-ag.com" &&
              credentials?.password === "admin"
            ) {
              return {
                id: "1",
                email: "admin@thp-ag.com",
                name: "Admin User",
                roles: ["admin"],
                groups: ["administrators"],
                department: "IT",
                employeeId: "EMP001",
              };
            }
            return null;
          },
        }),
      ],
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },
  callbacks: {
    async jwt({ token, account, profile, user }) {
      // Initial sign in
      if (account) {
        if (account.provider === "oidc" && profile) {
          // OIDC provider
          const oidcProfile = profile as OIDCProfile;
          token.accessToken = account.access_token;
          token.refreshToken = account.refresh_token;
          token.idToken = account.id_token;
          token.expiresAt = account.expires_at;
          token.roles = oidcProfile.roles || [];
          token.groups = oidcProfile.groups || [];
          token.department = oidcProfile.department;
          token.employeeId = oidcProfile.employee_id;
        } else if (account.provider === "credentials" && user) {
          // Development credentials provider
          const credUser = user as CredentialsUser;
          token.roles = credUser.roles || [];
          token.groups = credUser.groups || [];
          token.department = credUser.department;
          token.employeeId = credUser.employeeId;
          token.expiresAt = Math.floor(Date.now() / 1000) + 8 * 60 * 60; // 8 hours
        }
      }

      // Return previous token if the access token has not expired yet
      if (token.expiresAt && Date.now() < (token.expiresAt as number) * 1000) {
        return token;
      }

      // Access token has expired, try to update it
      try {
        if (token.refreshToken) {
          // Here you would refresh the token using your OIDC client
          // For now, we'll just return the existing token
          console.log("Token refresh needed but not implemented");
        }
      } catch (error) {
        console.error("Error refreshing access token", error);
        // Return error so user is forced to sign in again
        return { ...token, error: "RefreshAccessTokenError" };
      }

      return token;
    },
    async session({ session, token }): Promise<Session> {
      if (session.user) {
        // Create enhanced session with proper typing
        const enhancedSession: ExtendedSession = {
          ...session,
          user: {
            id: token.sub!,
            name: session.user.name!,
            email: session.user.email!,
            image: session.user.image || undefined,
            roles: (token.roles as string[]) || [],
            groups: (token.groups as string[]) || [],
            department: token.department as string,
            employeeId: token.employeeId as string,
            accessToken: token.accessToken as string,
            permissions: [],
          },
        };

        // Add permissions based on roles
        const userForPermissions: User = {
          id: token.sub!,
          name: session.user.name!,
          email: session.user.email!,
          roles: (token.roles as string[]) || [],
          groups: (token.groups as string[]) || [],
          department: token.department as string,
          employeeId: token.employeeId as string,
          permissions: [],
        };

        enhancedSession.user.permissions =
          AuthorizationService.getUserPermissions(userForPermissions);

        // Handle token errors
        if (token.error) {
          enhancedSession.error = token.error as string;
        }

        return enhancedSession;
      }

      return session;
    },
    async signIn({ user, account, profile }) {
      // You can implement additional sign-in logic here
      // For example, check if user is allowed to sign in based on their roles

      if (account?.provider === "oidc") {
        const oidcProfile = profile as OIDCProfile;
        const userRoles = oidcProfile.roles || [];

        // Example: Block users without any roles
        if (userRoles.length === 0) {
          console.warn(`User ${user.email} has no roles assigned`);
          return false;
        }

        // Example: Only allow specific roles
        const allowedRoles = [
          "admin",
          "broker",
          "senior_broker",
          "manager",
          "viewer",
          "auditor",
        ];
        const hasAllowedRole = userRoles.some((role: string) =>
          allowedRoles.includes(role)
        );

        if (!hasAllowedRole) {
          console.warn(`User ${user.email} does not have required roles`);
          return false;
        }

        // Audit successful sign-in
        console.log(
          `Successful sign-in: ${user.email} with roles: ${userRoles.join(
            ", "
          )}`
        );
      }

      return true;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log(`User signed in: ${user.email}`, {
        account: account?.provider,
        isNewUser,
        roles: (profile as OIDCProfile)?.roles,
      });
    },
    async signOut({ session, token }) {
      console.log(`User signed out: ${session?.user?.email || token?.email}`);
    },
    async session() {
      // This fires whenever a session is checked
      // Useful for updating last activity time
    },
  },
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
