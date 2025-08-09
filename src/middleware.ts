// middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth(
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Allow access to public routes
        const publicRoutes = ["/login", "/auth", "/api/auth"];
        const isPublicRoute = publicRoutes.some((route) =>
          pathname.startsWith(route)
        );

        // Allow root path
        if (pathname === "/" || pathname === "") {
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
