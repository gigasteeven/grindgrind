"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* Country flag SVG */
function CountryFlag({ code, size = 64 }) {
  if (!code || code.length !== 2) {
    return (
      <div
        className="rounded-full bg-cg-brown border-2 border-cg-orange/30 flex items-center justify-center shrink-0"
        style={{ width: size, height: size }}
      >
        <span className="text-2xl font-bold text-cg-orange">?</span>
      </div>
    );
  }
  return (
    <img
      src={`https://flagcdn.com/${code.toLowerCase()}.svg`}
      alt={code}
      className="rounded-full border-2 border-cg-orange/30 object-cover shrink-0"
      style={{ width: size, height: size }}
    />
  );
}

/* Status badge */
function StatusBadge({ status }) {
  const styles = {
    pending: "bg-cg-yellow/10 text-cg-yellow border-cg-yellow/30",
    approved: "bg-green-500/10 text-green-400 border-green-500/30",
    rejected: "bg-red-500/10 text-red-400 border-red-500/30",
  };
  const labels = {
    pending: "⏳ Pending",
    approved: "✅ Approved",
    rejected: "❌ Rejected",
  };
  return (
    <span className={`cg-badge border ${styles[status] || styles.pending}`}>
      {labels[status] || labels.pending}
    </span>
  );
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
      } else if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/auth/signup");
      }
    } catch {}
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="inline-block w-8 h-8 border-2 border-cg-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
      {/* ── Profile Header ── */}
      <div className="cg-card mb-6 overflow-hidden">
        {/* Banner */}
        <div className="h-20 bg-gradient-to-r from-cg-brown via-cg-brown-light to-cg-brown border-b border-cg-border" />

        <div className="px-5 pb-5">
          <div className="flex items-end gap-4 -mt-10">
            <CountryFlag code={user.country} size={80} />
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-cg-white">{user.username}</h1>
                {user.country && (
                  <span className="text-xs font-mono text-cg-white-dim uppercase">{user.country}</span>
                )}
                {user.isAdmin && (
                  <span className="cg-badge bg-cg-orange/10 text-cg-orange border border-cg-orange/30">
                    {stats?.isOwner ? "👑 Owner" : "🛡️ Admin"}
                  </span>
                )}
              </div>
              <p className="text-sm text-cg-white-dim mt-0.5">
                {stats?.rank ? `Rank #${stats.rank}` : "Unranked"} · {stats?.totalScore || 0} pts
              </p>
            </div>
            {user.isAdmin && (
              <Link href="/admin" className="cg-btn cg-btn-ghost text-sm mb-1">
                Admin
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="cg-card p-4 text-center">
          <p className="text-[10px] text-cg-white-dim uppercase tracking-wider mb-1">Score</p>
          <p className="text-2xl font-bold text-cg-yellow">{stats?.totalScore || 0}</p>
        </div>
        <div className="cg-card p-4 text-center">
          <p className="text-[10px] text-cg-white-dim uppercase tracking-wider mb-1">Completions</p>
          <p className="text-2xl font-bold text-cg-orange">{stats?.completions?.length || 0}</p>
        </div>
        <div className="cg-card p-4 text-center">
          <p className="text-[10px] text-cg-white-dim uppercase tracking-wider mb-1">Hardest</p>
          <p className="text-lg font-bold text-cg-white">
            {stats?.hardest ? `#${stats.hardestPosition}` : "—"}
          </p>
          <p className="text-[10px] text-cg-white-dim truncate mt-0.5">
            {stats?.hardest || "None"}
          </p>
        </div>
      </div>

      {/* ── Completions ── */}
      <div className="cg-card mb-6 overflow-hidden">
        <div className="px-5 py-3 border-b border-cg-border">
          <h3 className="text-sm font-bold text-cg-white">Completions</h3>
        </div>
        {stats?.completions?.length ? (
          <div className="divide-y divide-cg-border/30">
            {stats.completions
              .sort((a, b) => a.position - b.position)
              .map((c, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 px-5 py-2.5 transition-colors duration-150 hover:bg-cg-brown/30"
                >
                  <span className="text-xs font-bold text-cg-orange w-8 shrink-0">#{c.position}</span>
                  <Link
                    href={`/level/challenge/${c.challengeId}`}
                    className="flex-1 text-sm text-cg-white hover:text-cg-orange transition-colors truncate"
                  >
                    {c.challengeName}
                  </Link>
                  <span className="text-xs font-bold text-cg-yellow shrink-0">{c.points} pts</span>
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
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-cg-white-dim mb-3">No completions yet.</p>
            <Link href="/submit" className="cg-btn cg-btn-primary text-sm">
              Submit Record
            </Link>
          </div>
        )}
      </div>

      {/* ── Record Status (private) ── */}
      <div className="cg-card overflow-hidden">
        <div className="px-5 py-3 border-b border-cg-border">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-cg-white">Record Status</h3>
            <span className="text-[10px] text-cg-white-dim/40">visible only to you</span>
          </div>
        </div>

        {stats?.recordStatuses?.length ? (
          <div className="divide-y divide-cg-border/30">
            {stats.recordStatuses.map((r) => (
              <div key={r.id} className="px-5 py-3">
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    {r.challengePosition && (
                      <span className="text-xs font-bold text-cg-orange shrink-0">#{r.challengePosition}</span>
                    )}
                    <Link
                      href={`/level/challenge/${r.challengeId}`}
                      className="text-sm text-cg-white hover:text-cg-orange transition-colors truncate"
                    >
                      {r.challengeName}
                    </Link>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-cg-white-dim">
                  <span>{new Date(r.submittedAt).toLocaleDateString()}</span>
                  <span>{r.percent}%</span>
                  {r.videoLink && (
                    <a href={r.videoLink} target="_blank" rel="noopener noreferrer" className="text-cg-orange hover:underline">
                      Video ↗
                    </a>
                  )}
                </div>
                {r.status === "rejected" && r.reason && (
                  <div className="mt-2 text-[11px] text-red-400 bg-red-500/5 border border-red-500/20 rounded-md px-2.5 py-1.5">
                    <span className="font-semibold">Reason:</span> {r.reason}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-6 text-center">
            <p className="text-sm text-cg-white-dim">No submissions yet.</p>
            <Link href="/submit" className="cg-btn cg-btn-ghost text-sm mt-3 inline-block">
              Submit a Record
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
