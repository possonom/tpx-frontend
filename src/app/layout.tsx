// src/app/layout.tsx
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "THP AG Dashboard",
  description: "Medical Practice & Pharmacy Brokerage Management",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Always use German locale
  const messages = await getMessages({ locale: "de" });

  return (
    <html lang="de">
      <body>
        <NextIntlClientProvider messages={messages} locale="de">
          <Providers>
            <div className="min-h-screen bg-gray-50">{children}</div>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
