// src/i18n.ts
import { getRequestConfig } from "next-intl/server";

// Available locales
export const locales = ["de", "en"] as const;
export const defaultLocale = "de" as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
  // Handle undefined locale by using default
  const validLocale =
    locale && locales.includes(locale as Locale) ? locale : defaultLocale;

  return {
    locale: validLocale,
    messages: (await import(`../messages/${validLocale}.json`)).default,
  };
});
