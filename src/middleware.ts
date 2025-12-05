import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  // First, update the session (refresh tokens)
  const response = await updateSession(request);

  // Create supabase client to check auth
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  // Protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/onboarding", "/update-password"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Auth routes (signin/signup) - redirect to dashboard if already logged in
  const authRoutes = ["/signin", "/signup"];
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !user) {
    // Not logged in, redirect to login
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && user) {
    // Already logged in, check onboarding status and redirect
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", user.id)
      .single();

    const url = request.nextUrl.clone();
    url.pathname = profile?.onboarding_completed ? "/dashboard" : "/onboarding";
    return NextResponse.redirect(url);
  }

  // Dashboard requires completed onboarding
  if (pathname.startsWith("/dashboard") && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", user.id)
      .single();

    if (!profile?.onboarding_completed) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
