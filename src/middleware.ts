// middleware.ts
import createIntlMiddleware from "next-intl/middleware";
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { locales, defaultLocale } from "./i18n";

// Create the intl middleware
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

export default withAuth(
  function middleware(req) {
    // First, handle internationalization to ensure proper locale detection
    const intlResponse = intlMiddleware(req);

    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Extract locale from pathname
    const segments = pathname.split("/");
    const locale =
      segments[1] && locales.includes(segments[1] as (typeof locales)[number])
        ? segments[1]
        : defaultLocale;
    const pathWithoutLocale = "/" + segments.slice(2).join("/");

    // Public routes that don't require authentication
    const publicRoutes = ["/login", "/auth", "/api/auth"];
    const isPublicRoute = publicRoutes.some((route) =>
      pathWithoutLocale.startsWith(route)
    );

    // Also allow root path for debugging
    if (pathWithoutLocale === "/" || pathWithoutLocale === "") {
      return intlResponse || NextResponse.next();
    }

    if (isPublicRoute) {
      return intlResponse || NextResponse.next();
    }

    // If no token and not a public route, redirect to login
    if (!token) {
      return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
    }

    // For authenticated users, continue with intl response
    return intlResponse || NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Extract locale and path
        const segments = pathname.split("/");
        const pathWithoutLocale = "/" + segments.slice(2).join("/");

        // Allow access to public routes
        const publicRoutes = ["/login", "/auth", "/api/auth"];
        if (publicRoutes.some((route) => pathWithoutLocale.startsWith(route))) {
          return true;
        }

        // Require authentication for all other routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
