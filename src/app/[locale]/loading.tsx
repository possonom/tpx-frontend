"use client";
// src/app/[locale]/loading.tsx
// Loading UI for locale routes
import { Spinner } from "@fluentui/react-components";

export default function LocaleLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="large" label="Loading..." />
    </div>
  );
}
