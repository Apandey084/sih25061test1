// import { NextResponse } from "next/server";
// import { getToken } from "next-auth/jwt";

// const ADMIN_ONLY = "/admin";
// const CHECKER_ONLY = "/checker";

// export async function middleware(req) {
//   const { pathname } = req.nextUrl;

//   const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

//   // ADMIN AREA
//   if (pathname.startsWith(ADMIN_ONLY)) {
//     if (!token || token.role !== "admin") {
//       const url = req.nextUrl.clone();
//       url.pathname = "/admin/signin";
//       url.search = `?from=${pathname}`;
//       return NextResponse.redirect(url);
//     }
//   }

//   // CHECKER AREA
//   if (pathname.startsWith(CHECKER_ONLY)) {
//     if (!token || token.role !== "checker") {
//       const url = req.nextUrl.clone();
//       url.pathname = "/checker/signin";
//       url.search = `?from=${pathname}`;
//       return NextResponse.redirect(url);
//     }
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/admin/:path*", "/checker/:path*"],
// };

// // middleware.js (project root)
// import { NextResponse } from "next/server";
// import { getToken } from "next-auth/jwt";

// const ADMIN_PREFIX = "/admin";
// const CHECKER_PREFIX = "/checker";

// // Public pages that should be reachable without auth
// const PUBLIC_ADMIN = ["/admin/signin", "/admin/signout"];
// const PUBLIC_CHECKER = ["/checker/signin", "/checker/request"];

// export default async function middleware(req) {
//   try {
//     const url = req.nextUrl.clone();
//     const { pathname } = req.nextUrl;

//     // allow next internals and auth endpoints
//     if (
//       pathname.startsWith("/_next") ||
//       pathname.startsWith("/static") ||
//       pathname === "/favicon.ico" ||
//       pathname.startsWith("/api/auth") ||
//       pathname.startsWith("/api/public")
//     ) {
//       return NextResponse.next();
//     }

//     // ADMIN area
//     if (pathname.startsWith(ADMIN_PREFIX)) {
//       // allow public admin pages
//       if (PUBLIC_ADMIN.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
//         return NextResponse.next();
//       }

//       const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
//       // debug: remove these logs after fixing
//       console.log("[middleware] admin path:", pathname, " token:", token && { role: token.role, sub: token.sub });

//       if (!token || token.role !== "admin") {
//         const dest = req.nextUrl.clone();
//         dest.pathname = "/admin/signin";
//         dest.search = `?from=${encodeURIComponent(req.nextUrl.pathname)}`;
//         return NextResponse.redirect(dest);
//       }
//       return NextResponse.next();
//     }

//     // CHECKER area
//     if (pathname.startsWith(CHECKER_PREFIX)) {
//       if (PUBLIC_CHECKER.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
//         return NextResponse.next();
//       }
//       const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
//       console.log("[middleware] checker path:", pathname, " token:", token && { role: token.role, sub: token.sub });

//       if (!token || token.role !== "checker" || !token.sub) {
//         const dest = req.nextUrl.clone();
//         dest.pathname = "/checker/signin";
//         dest.search = `?from=${encodeURIComponent(req.nextUrl.pathname)}`;
//         return NextResponse.redirect(dest);
//       }
//       return NextResponse.next();
//     }

//     return NextResponse.next();
//   } catch (err) {
//     console.error("Middleware unexpected error:", err);
//     // fail closed -> redirect to signin
//     const fallback = req.nextUrl.clone();
//     fallback.pathname = "/admin/signin";
//     return NextResponse.redirect(fallback);
//   }
// }

// export const config = {
//   matcher: ["/admin/:path*", "/api/admin/:path*", "/checker/:path*", "/api/checker/:path*"],
// };


// middleware.js
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Route prefixes
 */
const ADMIN_PREFIX = "/admin";
const CHECKER_PREFIX = "/checker";

/**
 * Public routes that don't require auth
 */
const PUBLIC_ADMIN = ["/admin/signin", "/admin/signout"];
const PUBLIC_CHECKER = ["/checker/signin", "/checker/request"];

/**
 * Helper: is a path allowed without auth (exact or nested)
 */
function isPublic(pathname, list) {
  return list.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

/**
 * Helper: redirect to signin with a `from` query param
 */
function redirectToSignIn(req, targetSignInPath) {
  const dest = new URL(req.nextUrl.origin);
  dest.pathname = targetSignInPath;
  dest.searchParams.set("from", req.nextUrl.pathname || "/");
  return NextResponse.redirect(dest);
}

/**
 * Middleware entrypoint
 */
export default async function middleware(req) {
  try {
    const { pathname } = req.nextUrl;

    // Allow internal and static requests — do not intercept them
    if (
      pathname.startsWith("/_next") ||
      pathname.startsWith("/static") ||
      pathname === "/favicon.ico" ||
      pathname.startsWith("/api/public")
    ) {
      return NextResponse.next();
    }

    // Protect ADMIN routes
    if (pathname.startsWith(ADMIN_PREFIX)) {
      if (isPublic(pathname, PUBLIC_ADMIN)) return NextResponse.next();

      // Safe-guard: check env for secret
      if (!process.env.NEXTAUTH_SECRET) {
        console.error("[middleware] NEXTAUTH_SECRET is not set — blocking admin access");
        return redirectToSignIn(req, "/admin/signin");
      }

      const token = await safeGetToken(req);
      // If no valid admin token, redirect to admin signin
      if (!token || token.role !== "admin") {
        return redirectToSignIn(req, "/admin/signin");
      }
      return NextResponse.next();
    }

    // Protect CHECKER routes
    if (pathname.startsWith(CHECKER_PREFIX)) {
      if (isPublic(pathname, PUBLIC_CHECKER)) return NextResponse.next();

      if (!process.env.NEXTAUTH_SECRET) {
        console.error("[middleware] NEXTAUTH_SECRET is not set — blocking checker access");
        return redirectToSignIn(req, "/checker/signin");
      }

      const token = await safeGetToken(req);
      if (!token || token.role !== "checker" || !token.sub) {
        return redirectToSignIn(req, "/checker/signin");
      }
      return NextResponse.next();
    }

    // default allow
    return NextResponse.next();
  } catch (err) {
    // Failsafe: Don't leak error details to the user — redirect to signin
    console.error("[middleware] unexpected error:", err);
    return redirectToSignIn(req, "/admin/signin");
  }
}

/**
 * Safe wrapper around next-auth getToken
 * - Catches and logs errors
 * - Ensures we don't crash the middleware on malformed cookies
 */
async function safeGetToken(req) {
  try {
    // `getToken` accepts the NextRequest-like object in middleware
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    return token || null;
  } catch (err) {
    console.error("[middleware] getToken error:", err?.message || err);
    return null;
  }
}

/**
 * Keep the matcher explicit. Adjust as needed.
 */
export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/checker/:path*", "/api/checker/:path*"],
};
