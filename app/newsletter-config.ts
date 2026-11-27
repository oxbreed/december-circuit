import "server-only";

import { siteUrl } from "./site";

export type BrevoConfig = {
  apiKey: string;
  listId: number;
  templateId: number;
  redirectUrl: string;
};

function readNumber(name: string) {
  const value = process.env[name]?.trim();
  if (!value || !/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

function defaultRedirectUrl() {
  const override = process.env.BREVO_DOI_REDIRECT_URL?.trim();
  if (override && /^https:\/\/\S+$/i.test(override)) return override;
  return `${siteUrl}/newsletter/confirmed`;
}

/** Live signup needs the API key, list ID, and double opt-in template ID. */
export function readBrevoConfig(): BrevoConfig | null {
  const apiKey = process.env.BREVO_API_KEY?.trim() || null;
  const listId = readNumber("BREVO_LIST_ID");
  const templateId = readNumber("BREVO_DOI_TEMPLATE_ID");
  if (!apiKey || !listId || !templateId) return null;
  return {
    apiKey,
    listId,
    templateId,
    redirectUrl: defaultRedirectUrl(),
  };
}

export function isNewsletterLive() {
  return readBrevoConfig() !== null;
}
