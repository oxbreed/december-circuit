export const ANALYTICS_CONSENT_KEY = "dd-analytics-consent";
export const ANALYTICS_CONSENT_COOKIE = "dd_analytics_consent";
export const ANALYTICS_CONSENT_TTL_MS = 365 * 24 * 60 * 60 * 1000;
export const ANALYTICS_CONSENT_CHANGE_EVENT = "dd-analytics-consent-change";
export const ANALYTICS_CONSENT_OPEN_EVENT = "dd-analytics-consent-open";

export type AnalyticsConsent = "accepted" | "rejected";

type Stored = {
  value: AnalyticsConsent;
  savedAt: number;
};

function isConsent(value: unknown): value is AnalyticsConsent {
  return value === "accepted" || value === "rejected";
}

function parseStored(raw: string | null, treatBareAsFresh = false): Stored | null {
  if (!raw) return null;
  if (isConsent(raw)) {
    if (treatBareAsFresh) return { value: raw, savedAt: Date.now() };
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<Stored>;
    if (!isConsent(parsed.value) || typeof parsed.savedAt !== "number") return null;
    if (Date.now() - parsed.savedAt > ANALYTICS_CONSENT_TTL_MS) return null;
    return { value: parsed.value, savedAt: parsed.savedAt };
  } catch {
    return null;
  }
}

function readCookie(): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${ANALYTICS_CONSENT_COOKIE}=`;
  const row = document.cookie.split("; ").find((part) => part.startsWith(prefix));
  if (!row) return null;
  return decodeURIComponent(row.slice(prefix.length));
}

function clearStoredConsent() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ANALYTICS_CONSENT_KEY);
  document.cookie = `${ANALYTICS_CONSENT_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  document.documentElement.removeAttribute("data-analytics-consent");
}

export function readAnalyticsConsent(): AnalyticsConsent | null {
  if (typeof window === "undefined") return null;
  const fromStorage = parseStored(window.localStorage.getItem(ANALYTICS_CONSENT_KEY));
  if (fromStorage) return fromStorage.value;
  // Cookie Max-Age already enforces the 12-month window.
  const fromCookie = parseStored(readCookie(), true);
  if (fromCookie) return fromCookie.value;
  return null;
}

export function hasAnalyticsConsent(): boolean {
  return readAnalyticsConsent() === "accepted";
}

export function writeAnalyticsConsent(value: AnalyticsConsent): void {
  if (typeof window === "undefined") return;
  const stored: Stored = { value, savedAt: Date.now() };
  window.localStorage.setItem(ANALYTICS_CONSENT_KEY, JSON.stringify(stored));
  const maxAge = Math.floor(ANALYTICS_CONSENT_TTL_MS / 1000);
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${ANALYTICS_CONSENT_COOKIE}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
  document.documentElement.setAttribute("data-analytics-consent", value);
  window.dispatchEvent(new CustomEvent(ANALYTICS_CONSENT_CHANGE_EVENT, { detail: value }));
}

export function expireAnalyticsConsentIfStale(): void {
  if (typeof window === "undefined") return;
  const raw = window.localStorage.getItem(ANALYTICS_CONSENT_KEY);
  if (raw && !parseStored(raw)) clearStoredConsent();
}

export function openCookieSettings(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ANALYTICS_CONSENT_OPEN_EVENT));
}
