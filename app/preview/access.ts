/**
 * Fixture /preview pages stay available in local development and on Vercel
 * preview deployments. They return 404 on the public production site.
 *
 * VERCEL_ENV is the source of truth on Vercel. NODE_ENV is "production" for
 * both production and preview builds, so it is not used when VERCEL_ENV is set.
 * For a local `next start` build, set ALLOW_PREVIEW_ROUTES=1 to keep them visible.
 */

export function previewRoutesAllowed() {
  const vercelEnv = process.env.VERCEL_ENV?.trim();
  if (vercelEnv === "preview" || vercelEnv === "development") return true;
  if (vercelEnv === "production") return false;

  const flag = process.env.ALLOW_PREVIEW_ROUTES?.trim().toLowerCase();
  if (flag === "1" || flag === "true" || flag === "yes" || flag === "on") return true;

  if (process.env.NODE_ENV === "production") return false;
  return true;
}
