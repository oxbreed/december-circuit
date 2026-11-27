/** Production Dirty December GA4 web stream (property 566048221). */
export const DEFAULT_GA_MEASUREMENT_ID = "G-WHF2P9X0Y6";

/**
 * Use NEXT_PUBLIC_GA_MEASUREMENT_ID when set.
 * Set it to "off" to disable GA even on production.
 * Otherwise, on Vercel production only, fall back to the Dirty December stream.
 */
export function resolveGaMeasurementId(): string | null {
  const raw = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  if (raw) {
    const lower = raw.toLowerCase();
    if (lower === "off" || lower === "false" || lower === "0" || lower === "none") {
      return null;
    }
    return raw;
  }
  if (process.env.VERCEL_ENV === "production") {
    return DEFAULT_GA_MEASUREMENT_ID;
  }
  return null;
}
