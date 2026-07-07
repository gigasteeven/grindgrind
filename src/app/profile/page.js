"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function countryFlag(code) {
  if (!code || code.length !== 2) return "";
  const A = 0x1f1e6;
  return String.fromCodePoint(A + code.charCodeAt(0) - 65) + String.fromCodePoint(A + code.charCodeAt(1) - 65);
}

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token || !userData) {
      router.push("/auth/signup");
      return;
    }
    setUser(JSON.parse(userData));
    fetchProfile(token);
  }, []);

  const fetchProfile = async (token) => {
    try {
      const res = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // silent
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-cg-white-dim">Loading profile...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
      {/* Profile header */}
      <div className="cg-card mb-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-cg-brown border-2 border-cg-orange/30 flex items-center justify-center shrink-0">
            <span className="text-3xl font-bold text-cg-orange">
              {user.username.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-cg-white">{user.username}</h1>
              {user.country && <span className="text-xl">{countryFlag(user.country)}</span>}
              {user.isAdmin && (
                <span className="cg-badge bg-cg-orange/10 text-cg-orange border border-cg-orange/30">
                  Admin
                </span>
              )}
            </div>
            <p className="text-sm text-cg-white-dim mt-1">
              {stats?.rank ? `Rank #${stats.rank}` : "Unranked"} · {stats?.totalScore || 0} points
            </p>
          </div>
          {user.isAdmin && (
            <Link href="/admin" className="cg-btn cg-btn-ghost text-sm">
              Admin Panel
            </Link>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="cg-card text-center">
          <p className="text-xs text-cg-white-dim mb-1">Total Score</p>
          <p className="text-3xl font-extrabold text-cg-yellow">{stats?.totalScore || 0}</p>
        </div>
        <div className="cg-card text-center">
          <p className="text-xs text-cg-white-dim mb-1">Completions</p>
          <p className="text-3xl font-extrabold text-cg-orange">{stats?.completions?.length || 0}</p>
        </div>
        <div className="cg-card text-center">
          <p className="text-xs text-cg-white-dim mb-1">Hardest</p>
          <p className="text-sm font-bold text-cg-white truncate">
            {stats?.hardest ? `#${stats.hardestPosition} ${stats.hardest}` : "None yet"}
          </p>
        </div>
      </div>

      {/* Completions list */}
      <div className="cg-card">
        <h3 className="text-lg font-bold text-cg-white mb-4">Your Completions</h3>
        {stats?.completions?.length ? (
          <div className="space-y-2">
            {stats.completions.map((c, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 rounded-md border border-cg-border bg-cg-brown/50 px-4 py-3"
              >
                <span className="text-sm font-bold text-cg-orange shrink-0">#{c.position}</span>
                <Link
                  href={`/level/challenge/${c.challengeId}`}
                  className="flex-1 text-sm font-medium text-cg-white hover:text-cg-orange transition-colors truncate"
                >
                  {c.challengeName}
                </Link>
                <span className="text-sm font-bold text-cg-yellow shrink-0">{c.points} pts</span>
                {c.link && (
                  <a
                    href={c.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cg-white-dim hover:text-cg-orange transition-colors shrink-0"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-cg-white-dim mb-4">No completions yet.</p>
            <Link href="/submit" className="cg-btn cg-btn-primary text-sm">
              Submit Your First Record
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
