"use client";

import Link from "next/link";

/* Country flag SVG */
function CountryFlag({ code, size = 18 }) {
  if (!code || code.length !== 2) {
    return (
      <svg width={size} height={Math.round(size * 0.75)} viewBox="0 0 24 18" className="inline-block shrink-0 rounded-sm">
        <rect width="24" height="18" rx="2" fill="#e0e0e0" stroke="#999" strokeWidth="0.5"/>
        <circle cx="12" cy="9" r="4" fill="none" stroke="#999" strokeWidth="1"/>
        <text x="12" y="12" textAnchor="middle" fontSize="5" fill="#999" fontWeight="bold">INT</text>
      </svg>
    );
  }
  return (
    <img
      src={`https://flagcdn.com/${code.toLowerCase()}.svg`}
      alt={code}
      className="rounded-sm inline-block shrink-0"
      style={{ width: size, height: Math.round(size * 0.75) }}
    />
  );
}

/* Video link button — shows platform name based on URL */
function VideoButton({ url }) {
  if (!url) return <span className="text-xs text-cg-white-dim/20">—</span>;

  let platform = "Video";
  let icon = null;

  if (url.includes("youtu.be") || url.includes("youtube.com")) {
    platform = "YouTube";
    icon = (
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    );
  } else if (url.includes("t.me") || url.includes("telegram")) {
    platform = "Telegram";
    icon = (
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .17.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.173-.18 3.145-2.88 3.207-3.124.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.324-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.387 4.029-1.627 4.484-1.627z" />
      </svg>
    );
  } else if (url.includes("drive.google.com")) {
    platform = "Google Drive";
    icon = (
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.01 1.485c-3.59 0-6.497 2.255-7.62 5.39l3.937 6.788 3.683-6.36h7.42l-2.32-4.01a7.84 7.84 0 0 0-5.1-1.808zM3.94 7.435a8.06 8.06 0 0 0 .82 7.625l7.24-.01-3.69-6.37zm16.27 1.355l-7.23.01 3.69 6.36 5.31-3.07a8.03 8.03 0 0 0-1.77-3.3zM4.76 15.555a8.04 8.04 0 0 0 5.95 3.62l3.69-6.36H4.76zm6.83 3.62h7.42a8.03 8.03 0 0 0 2.95-3.62l-3.69-6.36z" />
      </svg>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs font-medium text-cg-orange hover:text-cg-orange-bright transition-colors"
    >
      {icon}
      {platform}
    </a>
  );
}

export default function LevelDetail({ challenge, position, points, type }) {
  const isPlatformer = type === "platformer";
  const records = challenge.records || [];
  const totalRecords = records.length;
  const fullClears = records.filter(r => r.percent === 100).length;

  const rankClass =
    position === 1 ? "cg-rank-top1" :
    position <= 3 ? "cg-rank-top3" :
    position <= 5 ? "cg-rank-top5" :
    position <= 10 ? "cg-rank-top10" :
    "cg-rank-default";

  return (
    <div className="mx-auto max-w-4xl px-3 sm:px-6 py-6 sm:py-8">
      {/* Breadcrumb */}
      <div className="mb-4 sm:mb-6">
        <Link
          href={isPlatformer ? "/list/platformer" : "/list/challenge"}
          className="text-sm text-cg-white-dim hover:text-cg-orange transition-colors"
        >
          ← Back to {isPlatformer ? "Platformer" : "Challenge"} List
        </Link>
      </div>

      {/* ── Level Header (glass) ── */}
      <div className="cg-glass mb-4 sm:mb-6 overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1" style={{ backgroundImage: "linear-gradient(to right, var(--cg-accent-from), var(--cg-accent-to))" }} />

        <div className="p-4 sm:p-6">
          {/* Title row */}
          <div className="flex items-start gap-3 sm:gap-4">
            <div className={`cg-rank w-12 h-12 sm:w-14 sm:h-14 text-base sm:text-lg ${rankClass}`}>
              #{position}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="cg-level-name text-xl sm:text-3xl text-cg-white">
                {challenge.name}
              </h1>
              <p className="text-xs sm:text-sm text-cg-white-dim mt-1">
                by <span className="text-cg-white">{challenge.author || "Unknown"}</span>
                {challenge.creators?.length > 0 && (
                  <>, <span className="text-cg-white">{challenge.creators.join(", ")}</span></>
                )}
              </p>
              <p className="text-xs sm:text-sm text-cg-white-dim mt-0.5">
                verified by <span className="text-cg-orange-bright font-medium">{challenge.verifier || "—"}</span>
              </p>
            </div>
            <div className="text-right shrink-0 hidden sm:block">
              <p className="text-[10px] text-cg-white-dim uppercase tracking-wider">Score</p>
              <p className="text-2xl font-bold text-cg-yellow">{points}</p>
            </div>
          </div>

          {/* Mobile score */}
          <div className="flex items-center justify-between mt-3 sm:hidden">
            <span className="text-[10px] text-cg-white-dim uppercase tracking-wider">Score</span>
            <span className="text-xl font-bold text-cg-yellow">{points}</span>
          </div>

          {/* Verification video */}
          {challenge.verification && (
            <a
              href={challenge.verification}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 cg-btn cg-btn-primary text-sm"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              Watch Verification
            </a>
          )}
        </div>
      </div>

      {/* ── Level Info Grid (glass) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="cg-glass p-3 sm:p-4">
          <p className="text-[10px] text-cg-white-dim uppercase tracking-wider mb-1">Level ID</p>
          <p className="text-sm font-mono font-medium text-cg-white">{challenge.id}</p>
        </div>
        <div className="cg-glass p-3 sm:p-4">
          <p className="text-[10px] text-cg-white-dim uppercase tracking-wider mb-1">Password</p>
          <p className="text-sm font-medium text-cg-white">{challenge.password || "Not Copyable"}</p>
        </div>
        <div className="cg-glass p-3 sm:p-4">
          <p className="text-[10px] text-cg-white-dim uppercase tracking-wider mb-1">Qualify %</p>
          <p className="text-sm font-medium text-cg-white">{challenge.percentToQualify || 100}%</p>
        </div>
        <div className="cg-glass p-3 sm:p-4">
          <p className="text-[10px] text-cg-white-dim uppercase tracking-wider mb-1">Verifier</p>
          <p className="text-sm font-medium text-cg-orange-bright truncate">{challenge.verifier || "—"}</p>
        </div>
      </div>

      {/* ── Tags ── */}
      {challenge.tags?.length > 0 && (
        <div className="cg-glass p-4 mb-4 sm:mb-6">
          <h3 className="text-xs font-semibold text-cg-orange uppercase tracking-wider mb-2">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {challenge.tags.map((tag) => (
              <span key={tag} className="cg-badge bg-cg-surface-2 border border-cg-border text-cg-white-dim">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Records (glass) ── */}
      <div className="cg-glass overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-5 py-3 sm:py-4 border-b-2 border-cg-border">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-base sm:text-lg font-bold text-cg-white">Records</h3>
            <div className="flex items-center gap-2 sm:gap-3 text-xs">
              <span className="text-cg-white-dim">{totalRecords} registered</span>
              <span className="text-cg-white-dim/40">·</span>
              <span className="text-cg-yellow">{fullClears} are 100%</span>
            </div>
          </div>
          {challenge.percentToQualify && challenge.percentToQualify < 100 && (
            <p className="text-xs text-cg-white-dim mt-1">
              {challenge.percentToQualify}% or better required to qualify
            </p>
          )}
        </div>

        {/* Table */}
        {records.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-cg-border">
                  <th className="text-left px-4 sm:px-5 py-2.5 text-[10px] font-semibold text-cg-orange uppercase tracking-wider w-10">#</th>
                  <th className="text-left px-2 sm:px-3 py-2.5 text-[10px] font-semibold text-cg-orange uppercase tracking-wider">Holder</th>
                  <th className="text-center px-2 sm:px-3 py-2.5 text-[10px] font-semibold text-cg-orange uppercase tracking-wider w-12">✓</th>
                  {isPlatformer && (
                    <th className="text-right px-2 sm:px-3 py-2.5 text-[10px] font-semibold text-cg-orange uppercase tracking-wider">Time</th>
                  )}
                  <th className="text-right px-4 sm:px-5 py-2.5 text-[10px] font-semibold text-cg-orange uppercase tracking-wider">Proof</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record, idx) => (
                  <tr key={`${record.user}-${idx}`} className="border-b border-cg-border/30 transition-colors duration-150 hover:bg-cg-surface-2/40">
                    <td className="px-4 sm:px-5 py-3">
                      <span className="font-bold text-cg-white-dim">{idx + 1}</span>
                    </td>
                    <td className="px-2 sm:px-3 py-3">
                      <div className="flex items-center gap-2">
                        <CountryFlag code={record.country} size={18} />
                        <span className="font-medium text-cg-white">{record.user}</span>
                      </div>
                    </td>
                    <td className="px-2 sm:px-3 py-3 text-center">
                      {record.percent === 100 ? (
                        <span className="text-green-400 text-sm">✓</span>
                      ) : (
                        <span className="text-cg-white-dim text-xs">{record.percent}%</span>
                      )}
                    </td>
                    {isPlatformer && (
                      <td className="px-2 sm:px-3 py-3 text-right">
                        <span className="font-mono text-cg-yellow text-xs">{record.time || "—"}</span>
                      </td>
                    )}
                    <td className="px-4 sm:px-5 py-3 text-right">
                      <VideoButton url={record.link} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-4 sm:px-5 py-8 sm:py-12 text-center">
            <p className="text-cg-white-dim mb-4">No records yet.</p>
            <Link href="/submit" className="cg-btn cg-btn-primary text-sm">
              Submit a Record
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
