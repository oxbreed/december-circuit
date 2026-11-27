export const NEWSLETTER_DISMISS_KEY = "dd-newsletter-dismissed";
export const NEWSLETTER_SUBSCRIBED_KEY = "dd-newsletter-subscribed";
export const NEWSLETTER_CHANGE_EVENT = "dd-newsletter-change";
export const NEWSLETTER_DISMISS_MS = 14 * 24 * 60 * 60 * 1000;

function emitChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(NEWSLETTER_CHANGE_EVENT));
}

export function isNewsletterDismissed() {
  if (typeof window === "undefined") return false;
  const raw = window.localStorage.getItem(NEWSLETTER_DISMISS_KEY);
  if (!raw) return false;
  try {
    const parsed = JSON.parse(raw) as { at?: unknown };
    if (typeof parsed.at !== "number") return false;
    if (Date.now() - parsed.at > NEWSLETTER_DISMISS_MS) {
      window.localStorage.removeItem(NEWSLETTER_DISMISS_KEY);
      return false;
    }
    return true;
  } catch {
    window.localStorage.removeItem(NEWSLETTER_DISMISS_KEY);
    return false;
  }
}

export function dismissNewsletterCapture() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(NEWSLETTER_DISMISS_KEY, JSON.stringify({ at: Date.now() }));
  emitChange();
}

export function isNewsletterSubscribed() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(NEWSLETTER_SUBSCRIBED_KEY) === "1";
}

export function markNewsletterSubscribed() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(NEWSLETTER_SUBSCRIBED_KEY, "1");
  window.localStorage.removeItem(NEWSLETTER_DISMISS_KEY);
  emitChange();
}

export function subscribeNewsletterStorage(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(NEWSLETTER_CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(NEWSLETTER_CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}
