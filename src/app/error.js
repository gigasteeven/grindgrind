"use client";

import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="max-w-2xl mx-auto mt-20 px-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
      <div className="text-left text-sm bg-cg-surface p-4 rounded-lg overflow-auto mb-4 text-red-400 space-y-2">
        <p><strong>Message:</strong> {error?.message || "Unknown error"}</p>
        <p><strong>Digest:</strong> {error?.digest || "N/A"}</p>
        {error?.stack && (
          <pre className="whitespace-pre-wrap text-xs mt-2 opacity-70">{error.stack}</pre>
        )}
      </div>
      <button
        onClick={reset}
        className="cg-btn-primary px-6 py-2 rounded-lg"
      >
        Try again
      </button>
    </div>
  );
}
