import { authkitMiddleware } from "@workos-inc/authkit-nextjs";

export default authkitMiddleware({
  middlewareAuth: {
    enabled: true,
    unauthenticatedPaths: [
      "/login",
      "/signup",
      "/forgot",
      "/forgot/sent",
      "/reset/:path*",
      "/verify-email",
      "/verify-email/:path*",
      "/invite/:path*",
      "/auth/:path*",
      "/demo/:path*",
    ],
  },
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png).*)"],
};
