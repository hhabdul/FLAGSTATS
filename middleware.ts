import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const protectedPrefixes = ["/dashboard", "/leaderboards", "/players", "/matches", "/more", "/live", "/admin", "/settings", "/seasons"];
const authPrefixes = ["/login", "/signup"];
const completionPath = "/complete-account";

function isProtected(pathname: string) {
  return protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function isAuthPage(pathname: string) {
  return authPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function isCompletionPage(pathname: string) {
  return pathname === completionPath || pathname.startsWith(`${completionPath}/`);
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return response;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Unauthenticated users cannot access protected routes or the completion page.
  if (!user && (isProtected(pathname) || isCompletionPage(pathname))) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated users are redirected away from login/signup.
  if (user && isAuthPage(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // For logged-in users, check whether they still need to complete their account.
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("must_change_password")
      .eq("id", user.id)
      .maybeSingle();

    const mustChange = profile?.must_change_password === true;

    // Gate all protected app routes until account completion is done.
    if (mustChange && isProtected(pathname)) {
      return NextResponse.redirect(new URL(completionPath, request.url));
    }

    // Once completed, redirect away from the completion page.
    if (!mustChange && isCompletionPage(pathname)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
