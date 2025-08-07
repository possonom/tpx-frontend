// src/app/layout.tsx
import type { Metadata } from "next";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "THP AG Dashboard",
  description: "Medical Practice & Pharmacy Brokerage Management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <FluentProvider theme={webLightTheme}>
            <div className="min-h-screen bg-gray-50">{children}</div>
          </FluentProvider>
        </Providers>
      </body>
    </html>
  );
}
