import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Catch WordPress scanner probes on this Next.js app.
 * DirtyDecember is not WordPress — these paths do not exist.
 * Structured logs go to stdout (Vercel Runtime Logs).
 */

const PREFIXES = [
  "/wp-admin",
  "/wp-includes",
  "/wp-content",
  "/wordpress",
  "/blog/wp-admin",
] as const;

const EXACT = new Set([
  "/wp-login.php",
  "/xmlrpc.php",
  "/index.php",
  "/wp-cron.php",
  "/wp-config.php",
  "/blog/wp-login.php",
]);

function isWordPressProbe(pathname: string): boolean {
  const path = pathname.toLowerCase().replace(/\/+$/, "") || "/";

  if (path.endsWith(".php")) return true;
  if (EXACT.has(path)) return true;

  for (const prefix of PREFIXES) {
    if (path === prefix || path.startsWith(`${prefix}/`)) return true;
  }

  return false;
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (!isWordPressProbe(pathname)) {
    return NextResponse.next();
  }

  const forwarded = request.headers.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    null;

  console.info(
    JSON.stringify({
      type: "wp_probe",
      ts: new Date().toISOString(),
      method: request.method,
      path: `${pathname}${request.nextUrl.search}`,
      ua: request.headers.get("user-agent"),
      ip,
      xff: forwarded,
      referer: request.headers.get("referer"),
      host: request.headers.get("host"),
    }),
  );

  return new NextResponse(null, {
    status: 404,
    headers: {
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}

export const config = {
  matcher: [
    "/wp-admin",
    "/wp-admin/:path*",
    "/wp-includes/:path*",
    "/wp-content/:path*",
    "/wordpress",
    "/wordpress/:path*",
    "/blog/wp-admin",
    "/blog/wp-admin/:path*",
    "/blog/wp-login.php",
    "/wp-login.php",
    "/xmlrpc.php",
    "/index.php",
    "/wp-cron.php",
    "/wp-config.php",
    "/((?!_next(?:/|$)|favicon\\.ico$).*\\.php)",
  ],
};
