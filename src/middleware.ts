// middleware.ts
import createIntlMiddleware from "next-intl/middleware";
import { withAuth } from "next-auth/middleware";
import { locales, defaultLocale } from "./i18n";

// Create the intl middleware
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
  localeDetection: false, // Disable automatic locale detection from headers
});

export default withAuth(
  function middleware(req) {
    // Always run the intl middleware first to ensure proper locale handling
    return intlMiddleware(req);
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
        const isPublicRoute = publicRoutes.some((route) =>
          pathWithoutLocale.startsWith(route)
        );

        // Allow root path
        if (pathWithoutLocale === "/" || pathWithoutLocale === "") {
          return true;
        }

        if (isPublicRoute) {
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
