"use client";

import Link from "next/link";

/* Country flag emoji from country code */
function countryFlag(code) {
  if (!code || code.length !== 2) return "";
  const A = 0x1f1e6;
  return String.fromCodePoint(A + code.charCodeAt(0) - 65) + String.fromCodePoint(A + code.charCodeAt(1) - 65);
}

/* Video link icon */
function VideoLink({ url }) {
  if (!url) {
    return <span className="text-xs text-cg-white-dim/40 italic">no video</span>;
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

      {/* Header */}
      <div className="cg-card mb-6">
        <div className="flex items-start gap-4">
          <div className="shrink-0 w-16 h-16 rounded-lg border border-cg-border bg-cg-brown flex items-center justify-center">
            <span className="text-2xl font-extrabold text-cg-orange">#{position}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-cg-white">{challenge.name}</h1>
            <p className="text-sm text-cg-white-dim mt-1">By {challenge.author || "Unknown"}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-cg-white-dim">Points</p>
            <p className="text-2xl font-extrabold text-cg-yellow">{points}</p>
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="cg-card">
          <h3 className="text-sm font-semibold text-cg-orange mb-3">Level Info</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-cg-white-dim">Verifier</dt>
              <dd className="text-cg-white font-medium">{challenge.verifier || "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-cg-white-dim">Level ID</dt>
              <dd className="text-cg-white font-mono">{challenge.id}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-cg-white-dim">Password</dt>
              <dd className="text-cg-white font-medium">{challenge.password || "Not Copyable"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-cg-white-dim">Qualify %</dt>
              <dd className="text-cg-white font-medium">{challenge.percentToQualify || 100}%</dd>
            </div>
          </dl>
        </div>

        <div className="cg-card">
          <h3 className="text-sm font-semibold text-cg-orange mb-3">Tags & Verification</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-cg-white-dim mb-1.5">Tags</p>
              <div className="flex flex-wrap gap-2">
                {challenge.tags?.length ? (
                  challenge.tags.map((tag) => (
                    <span key={tag} className="cg-badge bg-cg-brown border border-cg-border text-cg-white-dim">
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-cg-white-dim/50 italic">No tags</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs text-cg-white-dim mb-1.5">Verification Video</p>
              <VideoLink url={challenge.verification} />
            </div>
          </div>
        </div>
      </div>

      {/* Creators */}
      {challenge.creators?.length > 0 && (
        <div className="cg-card mb-6">
          <h3 className="text-sm font-semibold text-cg-orange mb-3">Creators</h3>
          <div className="flex flex-wrap gap-2">
            {challenge.creators.map((creator) => (
              <span key={creator} className="cg-badge bg-cg-brown border border-cg-border text-cg-white">
                {creator}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Records */}
      <div className="cg-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-cg-white">
            Records {isPlatformer && <span className="text-sm font-normal text-cg-white-dim">(by time)</span>}
          </h3>
          <span className="cg-badge bg-cg-orange/10 text-cg-orange border border-cg-orange/30">
            {challenge.records?.length || 0} players
          </span>
        </div>

        {challenge.records?.length ? (
          <div className="space-y-2">
            {challenge.records.map((record, idx) => (
              <div
                key={`${record.user}-${idx}`}
                className="flex items-center gap-3 rounded-md border border-cg-border bg-cg-brown/50 px-4 py-3 transition-all duration-200 hover:border-cg-orange/30"
              >
                {/* Rank number */}
                <span className="shrink-0 w-7 text-sm font-bold text-cg-white-dim">
                  {idx + 1}.
                </span>

                {/* Flag */}
                {record.country && (
                  <span className="text-lg shrink-0">{countryFlag(record.country)}</span>
                )}

                {/* Player name */}
                <span className="flex-1 text-sm font-medium text-cg-white truncate">
                  {record.user}
                </span>

                {/* Time (platformer only) */}
                {isPlatformer && record.time && (
                  <span className="text-sm font-mono text-cg-yellow">{record.time}</span>
                )}

                {/* Percent (if not 100) */}
                {record.percent && record.percent < 100 && (
                  <span className="text-xs text-cg-white-dim">{record.percent}%</span>
                )}

                {/* Video link */}
                <VideoLink url={record.link} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-cg-white-dim italic">No records yet. Be the first!</p>
        )}
      </div>
    </div>
  );
}
