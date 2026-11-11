import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const redirectTarget = new URL("/login", url.origin);
  const isHttps = url.protocol === "https:" || process.env.NODE_ENV === "production";

  const response = NextResponse.redirect(redirectTarget);

  const cookieNames = [
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
    "next-auth.csrf-token",
    "__Host-next-auth.csrf-token",
    "next-auth.callback-url",
    "__Secure-next-auth.callback-url",
  ];

  cookieNames.forEach((name) => {
    const requiresSecure = name.startsWith("__Secure-") || name.startsWith("__Host-");
    response.cookies.set(name, "", {
      path: "/",
      expires: new Date(0),
      maxAge: 0,
      httpOnly: true,
      secure: requiresSecure || isHttps,
      sameSite: "lax",
    });
  });

  return response;
}

export async function POST(req: Request) {
  return GET(req);
}
