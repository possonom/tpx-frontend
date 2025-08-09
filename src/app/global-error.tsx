"use client";
// src/app/global-error.tsx
// Global error boundary for App Router (root)
import { Button } from "@fluentui/react-components";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="p-10 font-sans text-center">
          <h1 className="text-2xl font-semibold mb-3">Application Error</h1>
          {error?.message && (
            <pre className="whitespace-pre-wrap break-words bg-gray-100 p-3 rounded text-xs text-left max-w-3xl mx-auto overflow-auto">
              {error.message}
            </pre>
          )}
          <div className="flex gap-3 justify-center mt-4">
            <Button appearance="primary" onClick={() => reset()}>
              Retry
            </Button>
            <Button onClick={() => (window.location.href = "/")}>Home</Button>
          </div>
        </div>
      </body>
    </html>
  );
}
