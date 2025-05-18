import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
// const isProtectedRoute = createRouteMatcher(["/interview(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionId } = await auth();
  const isSignedIn = userId !== null && sessionId !== null;

  if (isAdminRoute(req)) {
    if (!isSignedIn) {
      const returnUrl = new URL("/login", req.url);
      returnUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(returnUrl);
    }

    // Check if user has admin role
    const session = await auth();
    const userRole = session.sessionClaims?.metadata?.role;
    if (userRole !== "admin") {
      // User is signed in but not an admin, redirect to home
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
