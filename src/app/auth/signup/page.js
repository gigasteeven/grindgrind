"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Turnstile from "@/components/Turnstile";


export default function AuthPage() {
  const [mode, setMode] = useState("signup");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const body = { username, password, captchaToken: captchaToken || "dev_skip" };
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
        // Store ONLY the token — user data is always fetched from server
        localStorage.setItem("token", data.token);
        // Notify Navbar to refresh immediately
        window.dispatchEvent(new Event("auth-change"));
        router.push("/profile");
      }
    } catch {
      setError("Something went wrong. Try again.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-12 px-4">
      {/* Tabs */}
      <div className="flex gap-2 mb-6 p-1 rounded-lg bg-cg-surface">
        <button
          type="button"
          onClick={() => { setMode("signup"); setError(""); }}
          className={`flex-1 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            mode === "signup" ? "cg-btn-primary" : "text-cg-white-dim hover:text-cg-white"
          }`}
        >
          Sign Up
        </button>
        <button
          type="button"
          onClick={() => { setMode("login"); setError(""); }}
          className={`flex-1 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            mode === "login" ? "cg-btn-primary" : "text-cg-white-dim hover:text-cg-white"
          }`}
        >
          Login
        </button>
      </div>

      <div className="cg-card p-6">
        <h1 className="text-2xl font-bold mb-2">
          {mode === "signup" ? "Create Account" : "Welcome Back"}
        </h1>
        <p className="text-cg-white-dim text-sm mb-6">
          {mode === "signup"
            ? "Join ChallengeGrind and start submitting records."
            : "Login to your account."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
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
            <label className="block text-sm font-medium mb-1">Password</label>
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
              <label className="block text-sm font-medium mb-1">Country (optional)</label>
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

          {/* Cloudflare Turnstile captcha */}
          <div>
            <Turnstile onVerify={setCaptchaToken} />
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="cg-btn-primary w-full py-2.5 rounded-lg font-medium"
          >
            {loading ? "Please wait..." : mode === "signup" ? "Create Account" : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
