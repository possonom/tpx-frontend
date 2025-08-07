// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import { OAuthConfig } from "next-auth/providers";

const oidcProvider: OAuthConfig<any> = {
  id: "oidc",
  name: "Corporate OIDC",
  type: "oauth",
  wellKnown: `${process.env.OIDC_ISSUER}/.well-known/openid-configuration`,
  authorization: { params: { scope: "openid profile email" } },
  idToken: true,
  checks: ["pkce", "state"],
  clientId: process.env.OIDC_CLIENT_ID!,
  clientSecret: process.env.OIDC_CLIENT_SECRET!,
  profile(profile) {
    return {
      id: profile.sub,
      name: profile.name,
      email: profile.email,
      image: profile.picture,
      roles: profile.roles || [],
    };
  },
};

export const authOptions: NextAuthOptions = {
  providers: [oidcProvider],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.roles = (profile as any).roles || [];
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).roles = token.roles;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
