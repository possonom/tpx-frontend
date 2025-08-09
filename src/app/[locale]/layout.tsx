// src/app/[locale]/layout.tsx
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales, Locale } from "../../i18n";
import { Providers } from "../providers";

export const metadata: Metadata = {
  title: "THP AG Dashboard",
  description: "Medical Practice & Pharmacy Brokerage Management",
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Await the params to fix Next.js 15 requirement
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider messages={messages}>
      <Providers>
        <div className="min-h-screen bg-gray-50">{children}</div>
      </Providers>
    </NextIntlClientProvider>
  );
}
