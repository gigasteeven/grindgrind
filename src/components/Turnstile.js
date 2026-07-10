"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export default function Turnstile({ onVerify, theme = "dark" }) {
  const containerRef = useRef(null);
  const widgetId = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [siteKey, setSiteKey] = useState(null);

  useEffect(() => {
    // Hardcoded site key — works without dashboard env vars
    const key = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAADxJ3bq8rhJWsLZZ";
    setSiteKey(key);

    // Load Turnstile script if site key is configured
    if (!key) return;

    if (window.turnstile) {
      setLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    script.onload = () => setLoaded(true);
    document.head.appendChild(script);

    return () => {
      if (window.turnstile && widgetId.current !== null) {
        try {
          window.turnstile.remove(widgetId.current);
        } catch (e) {}
      }
    };
  }, []);

  const handleVerify = useCallback((token) => {
    if (onVerify) onVerify(token);
  }, [onVerify]);

  useEffect(() => {
    if (loaded && containerRef.current && window.turnstile && siteKey) {
      try {
        widgetId.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: handleVerify,
          theme: theme,
        });
      } catch (e) {
        console.error("Turnstile render error:", e);
      }
    }
  }, [loaded, siteKey, theme, handleVerify]);

  // No site key configured — dev mode, skip captcha
  if (!siteKey) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-700 p-4 text-center text-sm text-gray-500">
        Captcha disabled (dev mode)
      </div>
    );
  }

  return <div ref={containerRef} className="min-h-[65px]" />;
}
