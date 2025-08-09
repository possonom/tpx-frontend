"use client";
// src/app/[locale]/error.tsx
// Route-level error boundary for localized segment
import { useEffect } from "react";
import { Button } from "@fluentui/react-components";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Locale route error boundary caught:", error);
  }, [error]);

  return (
    <div className="p-10 max-w-xl mx-auto text-center">
      <h1 className="text-2xl font-semibold mb-4">Something went wrong</h1>
      {error?.message && (
        <p className="text-sm text-gray-600 mb-4 break-all">{error.message}</p>
      )}
      <div className="flex gap-4 justify-center">
        <Button appearance="primary" onClick={() => reset()}>
          Retry
        </Button>
        <Button onClick={() => (window.location.href = "/")}>Home</Button>
      </div>
    </div>
  );
}
