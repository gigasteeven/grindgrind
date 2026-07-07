"use client";

import Link from "next/link";

/* Country flag SVG */
function CountryFlag({ code, size = 20 }) {
  if (!code || code.length !== 2) return null;
  return (
    <img
      src={`https://flagcdn.com/${code.toLowerCase()}.svg`}
      alt={code}
      className="rounded-sm inline-block"
      style={{ width: size, height: size * 0.75 }}
    />
  );
}

/* Video link button */
function VideoButton({ url }) {
  if (!url) {
    return <span className="text-xs text-cg-white-dim/30 italic">No video</span>;
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 cg-btn cg-btn-ghost text-xs px-2.5 py-1"
    >
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
      Watch
    </a>
  );
}

export default function LevelDetail({ challenge, position, points, type }) {
  const isPlatformer = type === "platformer";
  const records = challenge.records || [];
  const totalRecords = records.length;
  const fullClears = records.filter(r => r.percent === 100).length;

  // Tier styling
  const tierColor =
    position <= 5 ? "from-cg-yellow to-cg-orange-bright" :
    position <= 15 ? "from-cg-orange-bright to-cg-orange" :
    position <= 50 ? "from-cg-orange to-cg-orange-bright" :
    "from-cg-brown-light to-cg-brown";

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href={isPlatformer ? "/list/platformer" : "/list/challenge"}
          className="text-sm text-cg-white-dim hover:text-cg-orange transition-colors"
        >
          ← Back to {isPlatformer ? "Platformer" : "Challenge"} List
        </Link>
      </div>

      {/* ── Level Header Card ── */}
      <div className="cg-card mb-6 overflow-hidden p-0">
        {/* Top gradient bar with position */}
        <div className={`h-2 bg-gradient-to-r ${tierColor}`} />

        <div className="p-5 sm:p-6">
          {/* Title row */}
          <div className="flex items-start gap-4 mb-4">
            <div className="shrink-0">
              <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${tierColor} flex items-center justify-center`}>
                <span className="text-2xl font-extrabold text-cg-black">#{position}</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-cg-white">{challenge.name}</h1>
              <p className="text-sm text-cg-white-dim mt-1">
                by <span className="text-cg-white">{challenge.author || "Unknown"}</span>
                {challenge.creators?.length > 0 && (
                  <span> and <span className="text-cg-white">{challenge.creators.join(", ")}</span></span>
                )}
              </p>
              <p className="text-sm text-cg-white-dim mt-0.5">
                verified by <span className="text-cg-orange-bright font-medium">{challenge.verifier || "—"}</span>
              </p>
            </div>
            <div className="text-right shrink-0 hidden sm:block">
              <p className="text-xs text-cg-white-dim uppercase tracking-wider">Points</p>
              <p className="text-3xl font-extrabold text-cg-yellow">{points}</p>
            </div>
          </div>

          {/* Mobile points */}
          <div className="flex items-center justify-between mb-4 sm:hidden">
            <span className="text-xs text-cg-white-dim uppercase tracking-wider">Points</span>
            <span className="text-2xl font-extrabold text-cg-yellow">{points}</span>
          </div>

          {/* Verification video */}
          {challenge.verification && (
            <a
              href={challenge.verification}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 cg-btn cg-btn-primary text-sm"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              Watch Verification Video
            </a>
          )}
        </div>
      </div>

      {/* ── Level Info Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="cg-card p-4">
          <p className="text-xs text-cg-white-dim uppercase tracking-wider mb-1">Level ID</p>
          <p className="text-sm font-mono font-medium text-cg-white">{challenge.id}</p>
        </div>
        <div className="cg-card p-4">
          <p className="text-xs text-cg-white-dim uppercase tracking-wider mb-1">Password</p>
          <p className="text-sm font-medium text-cg-white">{challenge.password || "Not Copyable"}</p>
        </div>
        <div className="cg-card p-4">
          <p className="text-xs text-cg-white-dim uppercase tracking-wider mb-1">Qualify %</p>
          <p className="text-sm font-medium text-cg-white">{challenge.percentToQualify || 100}%</p>
        </div>
        <div className="cg-card p-4">
          <p className="text-xs text-cg-white-dim uppercase tracking-wider mb-1">Verifier</p>
          <p className="text-sm font-medium text-cg-orange-bright truncate">{challenge.verifier || "—"}</p>
        </div>
      </div>

      {/* ── Tags ── */}
      {challenge.tags?.length > 0 && (
        <div className="cg-card mb-6">
          <h3 className="text-sm font-semibold text-cg-orange mb-3">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {challenge.tags.map((tag) => (
              <span key={tag} className="cg-badge bg-cg-brown border border-cg-border text-cg-white-dim">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Records Section ── */}
      <div className="cg-card overflow-hidden p-0">
        {/* Records header */}
        <div className="px-5 py-4 border-b border-cg-border bg-cg-brown/30">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-cg-white">
              Records
              {isPlatformer && <span className="text-sm font-normal text-cg-white-dim ml-2">(by time)</span>}
            </h3>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-cg-white-dim">
                {totalRecords} registered
              </span>
              <span className="text-cg-yellow">
                {fullClears} are 100%
              </span>
            </div>
          </div>
          {challenge.percentToQualify && challenge.percentToQualify < 100 && (
            <p className="text-xs text-cg-white-dim mt-1">
              {challenge.percentToQualify}% or better required to qualify
            </p>
          )}
        </div>

        {/* Records table */}
        {records.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cg-border">
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-cg-orange uppercase tracking-wider">#</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-cg-orange uppercase tracking-wider">Holder</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-cg-orange uppercase tracking-wider">Flag</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-cg-orange uppercase tracking-wider">Pre</th>
                  <th className="text-center px-3 py-2.5 text-xs font-semibold text-cg-orange uppercase tracking-wider">100%</th>
                  {isPlatformer && (
                    <th className="text-right px-3 py-2.5 text-xs font-semibold text-cg-orange uppercase tracking-wider">Time</th>
                  )}
                  <th className="text-right px-5 py-2.5 text-xs font-semibold text-cg-orange uppercase tracking-wider">Proof</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record, idx) => (
                  <tr
                    key={`${record.user}-${idx}`}
                    className="border-b border-cg-border/40 transition-colors duration-150 hover:bg-cg-brown/30"
                  >
                    <td className="px-5 py-3">
                      <span className="font-bold text-cg-white-dim">{idx + 1}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="font-medium text-cg-white">{record.user}</span>
                    </td>
                    <td className="px-3 py-3">
                      <CountryFlag code={record.country} />
                    </td>
                    <td className="px-3 py-3">
                      {record.percent < 100 ? (
                        <span className="text-cg-white-dim">{record.percent}%</span>
                      ) : (
                        <span className="text-cg-white-dim/30">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {record.percent === 100 ? (
                        <span className="text-green-400">✓</span>
                      ) : (
                        <span className="text-cg-white-dim/30">—</span>
                      )}
                    </td>
                    {isPlatformer && (
                      <td className="px-3 py-3 text-right">
                        <span className="font-mono text-cg-yellow">{record.time || "—"}</span>
                      </td>
                    )}
                    <td className="px-5 py-3 text-right">
                      <VideoButton url={record.link} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 py-12 text-center">
            <p className="text-cg-white-dim">No records yet. Be the first!</p>
            <Link href="/submit" className="cg-btn cg-btn-primary text-sm mt-4 inline-block">
              Submit a Record
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
