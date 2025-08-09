// src/i18n.ts
import { getRequestConfig } from "next-intl/server";

// Single German locale only
export const locales = ["de"] as const;
export const defaultLocale = "de" as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
  // Since we only support German, always use "de"
  const validLocale = "de";

  return {
    locale: validLocale,
    messages: (await import(`../messages/${validLocale}.json`)).default,
  };
});