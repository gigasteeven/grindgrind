import Link from "next/link";

/**
 * Rectangular level card for list pages.
 * Shows #position, Published date, Points, and record count.
 */
export default function ChallengeCard({ challenge, position, points, type = "challenge" }) {
  const recordCount = challenge.records?.length || 0;
  const href = `/level/${type}/${challenge.id}`;

  // Tier color based on position
  const tierColor =
    position <= 5 ? "text-cg-yellow" :
    position <= 15 ? "text-cg-orange-bright" :
    position <= 50 ? "text-cg-orange" :
    "text-cg-white-dim";

  const tierBg =
    position <= 5 ? "bg-cg-yellow/10 border-cg-yellow/30" :
    position <= 15 ? "bg-cg-orange-bright/10 border-cg-orange-bright/30" :
    position <= 50 ? "bg-cg-orange/10 border-cg-orange/30" :
    "bg-cg-brown border-cg-border";

  return (
    <Link
      href={href}
      className="cg-card block group"
    >
      <div className="flex items-center gap-4">
        {/* Position badge */}
        <div className={`shrink-0 w-14 h-14 rounded-lg border flex items-center justify-center ${tierBg}`}>
          <span className={`text-xl font-extrabold ${tierColor}`}>
            #{position}
          </span>
        </div>

        {/* Level info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-cg-white truncate group-hover:text-cg-orange transition-colors duration-200">
            {challenge.name}
          </h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
            <span className="text-xs text-cg-white-dim">
              By {challenge.author || "Unknown"}
            </span>
            <span className="text-xs text-cg-white-dim">
              Verifier: <span className="text-cg-orange-bright">{challenge.verifier || "—"}</span>
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-cg-white-dim">Points:</span>
            <span className="text-sm font-bold text-cg-yellow">{points}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-cg-white-dim">Records:</span>
            <span className="text-sm font-medium text-cg-white">{recordCount}</span>
          </div>
        </div>

        {/* Arrow */}
        <div className="shrink-0 text-cg-white-dim group-hover:text-cg-orange transition-colors duration-200">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Mobile stats */}
      <div className="flex sm:hidden items-center gap-4 mt-3 pt-3 border-t border-cg-border">
        <span className="text-xs text-cg-white-dim">Points: <span className="text-cg-yellow font-bold">{points}</span></span>
        <span className="text-xs text-cg-white-dim">Records: <span className="text-cg-white font-medium">{recordCount}</span></span>
      </div>
    </Link>
  );
}
