"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [mode, setMode] = useState("signup");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const body = { username, password, captchaToken: "dev_skip" };
      if (mode === "signup") body.country = country;

      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/profile");
      }
    } catch {
      setError("Something went wrong. Try again.");
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-md px-3 sm:px-6 py-8 sm:py-12">
      <div className="cg-card p-5 sm:p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 p-1 rounded-lg" style={{ backgroundColor: "var(--cg-surface-2)" }}>
          <button
            onClick={() => { setMode("signup"); setError(""); }}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              mode === "signup" ? "cg-btn-primary" : "text-cg-white-dim hover:text-cg-white"
            }`}
          >
            Sign Up
          </button>
          <button
            onClick={() => { setMode("login"); setError(""); }}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              mode === "login" ? "cg-btn-primary" : "text-cg-white-dim hover:text-cg-white"
            }`}
          >
            Login
          </button>
        </div>

        <h1 className="text-xl font-bold text-cg-white mb-1">
          {mode === "signup" ? "Create Account" : "Welcome Back"}
        </h1>
        <p className="text-sm text-cg-white-dim mb-6">
          {mode === "signup" ? "Join ChallengeGrind and start submitting records." : "Login to your account."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-cg-white-dim mb-1.5">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="cg-input"
              placeholder="3-20 characters"
              required
              minLength={3}
              maxLength={20}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-cg-white-dim mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="cg-input"
              placeholder="At least 4 characters"
              required
              minLength={4}
            />
          </div>

          {mode === "signup" && (
            <div>
              <label className="block text-xs font-medium text-cg-white-dim mb-1.5">Country (optional)</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value.toUpperCase().slice(0, 2))}
                className="cg-input"
                placeholder="2-letter code (e.g. RU, US)"
                maxLength={2}
              />
            </div>
          )}

          {/* Cloudflare Turnstile placeholder */}
          <div className="rounded-md border border-cg-border p-3 text-center" style={{ backgroundColor: "color-mix(in srgb, var(--cg-surface-2) 50%, transparent)" }}>
            <p className="text-xs text-cg-white-dim">
              🛡️ Cloudflare Turnstile captcha will appear here in production
            </p>
          </div>

          {error && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="cg-btn cg-btn-primary w-full text-base py-3 disabled:opacity-50"
          >
            {loading ? "Please wait..." : mode === "signup" ? "Create Account" : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
