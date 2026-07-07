import Link from "next/link";

/**
 * Rectangular level card for list pages.
 * Clean, minimal design with position badge and key stats.
 */
export default function ChallengeCard({ challenge, position, points, type = "challenge" }) {
  const recordCount = challenge.records?.length || 0;
  const href = `/level/${type}/${challenge.id}`;

  const rankClass =
    position === 1 ? "cg-rank-top1" :
    position <= 3 ? "cg-rank-top3" :
    position <= 5 ? "cg-rank-top5" :
    position <= 10 ? "cg-rank-top10" :
    "cg-rank-default";

  return (
    <Link href={href} className="cg-card-hover block group">
      <div className="flex items-center gap-4 p-4">
        {/* Position badge */}
        <div className={`cg-rank w-12 h-12 text-lg ${rankClass}`}>
          #{position}
        </div>

        {/* Level info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-cg-white truncate group-hover:text-cg-orange transition-colors duration-200">
            {challenge.name}
          </h3>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-cg-white-dim">
              {challenge.verifier || "—"}
            </span>
            <span className="text-xs text-cg-white-dim/40">·</span>
            <span className="text-xs text-cg-white-dim">
              {recordCount} records
            </span>
          </div>
        </div>

        {/* Points */}
        <div className="text-right shrink-0">
          <p className="text-lg font-bold text-cg-yellow">{points}</p>
          <p className="text-[10px] text-cg-white-dim uppercase tracking-wider">pts</p>
        </div>

        {/* Arrow */}
        <div className="shrink-0 text-cg-white-dim/30 group-hover:text-cg-orange transition-colors duration-200">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
