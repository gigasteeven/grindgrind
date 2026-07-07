"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* Country flag SVG from flagcdn */
function CountryFlag({ code, size = 48 }) {
  if (!code || code.length !== 2) {
    return (
      <div
        className="rounded-full bg-cg-brown border-2 border-cg-orange/30 flex items-center justify-center shrink-0"
        style={{ width: size, height: size }}
      >
        <span className="text-xl font-bold text-cg-orange">?</span>
      </div>
    );
  }
  return (
    <img
      src={`https://flagcdn.com/${code.toLowerCase()}.svg`}
      alt={code}
      className="rounded-full border-2 border-cg-orange/30 object-cover shrink-0"
      style={{ width: size, height: size }}
      onError={(e) => {
        e.target.style.display = "none";
        e.target.nextSibling.style.display = "flex";
      }}
    />
  );
}

/* Status badge for record */
function StatusBadge({ status }) {
  const styles = {
    pending: "bg-cg-yellow/10 text-cg-yellow border-cg-yellow/30",
    approved: "bg-green-500/10 text-green-400 border-green-500/30",
    rejected: "bg-red-500/10 text-red-400 border-red-500/30",
  };
  const labels = {
    pending: "⏳ Pending Review",
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
        // Token expired
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/auth/signup");
      }
    } catch {
      // silent
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="inline-block w-8 h-8 border-2 border-cg-orange border-t-transparent rounded-full animate-spin" />
        <p className="text-cg-white-dim mt-3">Loading profile...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
      {/* Profile header card */}
      <div className="cg-card mb-6 overflow-hidden">
        {/* Banner gradient */}
        <div className="h-24 bg-gradient-to-r from-cg-brown via-cg-brown-light to-cg-brown -mx-5 -mt-5 mb-4 border-b border-cg-border" />

        <div className="flex items-start gap-4 -mt-12">
          {/* Flag avatar */}
          <CountryFlag code={user.country} size={80} />

          <div className="flex-1 min-w-0 pt-8">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-cg-white">{user.username}</h1>
              {user.country && (
                <span className="text-sm font-mono text-cg-white-dim uppercase">{user.country}</span>
              )}
              {user.isAdmin && (
                <span className="cg-badge bg-cg-orange/10 text-cg-orange border border-cg-orange/30">
                  {stats?.isOwner ? "👑 Owner" : "🛡️ Admin"}
                </span>
              )}
            </div>
            <p className="text-sm text-cg-white-dim mt-1">
              {stats?.rank ? `Rank #${stats.rank}` : "Unranked"} · {stats?.totalScore || 0} points
            </p>
          </div>

          {user.isAdmin && (
            <Link href="/admin" className="cg-btn cg-btn-ghost text-sm mt-8">
              Admin Panel
            </Link>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="cg-card text-center">
          <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-cg-yellow/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-cg-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <p className="text-xs text-cg-white-dim mb-1">Total Score</p>
          <p className="text-3xl font-extrabold text-cg-yellow">{stats?.totalScore || 0}</p>
        </div>

        <div className="cg-card text-center">
          <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-cg-orange/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-cg-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <p className="text-xs text-cg-white-dim mb-1">Completions</p>
          <p className="text-3xl font-extrabold text-cg-orange">{stats?.completions?.length || 0}</p>
        </div>

        <div className="cg-card text-center">
          <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-cg-orange-bright/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-cg-orange-bright" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-xs text-cg-white-dim mb-1">Hardest</p>
          <p className="text-sm font-bold text-cg-white truncate">
            {stats?.hardest ? `#${stats.hardestPosition}` : "—"}
          </p>
          <p className="text-xs text-cg-white-dim truncate mt-0.5">
            {stats?.hardest || "None yet"}
          </p>
        </div>
      </div>

      {/* Completions list */}
      <div className="cg-card mb-6">
        <h3 className="text-lg font-bold text-cg-white mb-4">Your Completions</h3>
        {stats?.completions?.length ? (
          <div className="space-y-2">
            {stats.completions.map((c, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 rounded-md border border-cg-border bg-cg-brown/50 px-4 py-3 transition-all duration-200 hover:border-cg-orange/30"
              >
                <span className="text-sm font-bold text-cg-orange shrink-0 w-10">#{c.position}</span>
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

      {/* Record Status (only visible to the player themselves) */}
      <div className="cg-card">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-lg font-bold text-cg-white">Record Status</h3>
          <span className="text-xs text-cg-white-dim/50">(only visible to you)</span>
        </div>
        <p className="text-sm text-cg-white-dim mb-4">
          Track the status of your submitted records. See if they've been approved or rejected.
        </p>

        {stats?.recordStatuses?.length ? (
          <div className="space-y-3">
            {stats.recordStatuses.map((r) => (
              <div
                key={r.id}
                className={`rounded-md border px-4 py-3 transition-all duration-200 ${
                  r.status === "approved"
                    ? "border-green-500/20 bg-green-500/5"
                    : r.status === "rejected"
                    ? "border-red-500/20 bg-red-500/5"
                    : "border-cg-border bg-cg-brown/50"
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {r.challengePosition && (
                      <span className="text-xs font-bold text-cg-orange shrink-0">#{r.challengePosition}</span>
                    )}
                    <Link
                      href={`/level/challenge/${r.challengeId}`}
                      className="text-sm font-medium text-cg-white hover:text-cg-orange transition-colors truncate"
                    >
                      {r.challengeName}
                    </Link>
                  </div>
                  <StatusBadge status={r.status} />
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-cg-white-dim">
                  <span>Submitted: {new Date(r.submittedAt).toLocaleDateString()}</span>
                  <span>Percent: {r.percent}%</span>
                  {r.videoLink && (
                    <a href={r.videoLink} target="_blank" rel="noopener noreferrer" className="text-cg-orange hover:underline">
                      Video proof ↗
                    </a>
                  )}
                  {r.reviewedAt && (
                    <span>Reviewed: {new Date(r.reviewedAt).toLocaleDateString()}</span>
                  )}
                </div>

                {r.status === "rejected" && r.reason && (
                  <div className="mt-2 rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2">
                    <p className="text-xs text-red-400">
                      <span className="font-semibold">Reason:</span> {r.reason}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-cg-white-dim text-sm">No record submissions yet.</p>
            <Link href="/submit" className="cg-btn cg-btn-ghost text-sm mt-3 inline-block">
              Submit a Record
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
