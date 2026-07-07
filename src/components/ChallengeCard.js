import Link from "next/link";

/**
 * Level card for list pages.
 * Horizontal card with big position number, level name, and key info.
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
      <div className="flex items-center gap-3 sm:gap-5 p-4 sm:p-5">
        {/* Position number */}
        <div className={`cg-rank w-12 h-12 sm:w-14 sm:h-14 text-lg sm:text-xl ${rankClass}`}>
          {position}
        </div>

        {/* Level name + info */}
        <div className="flex-1 min-w-0">
          <h3 className="cg-level-name text-lg sm:text-xl text-cg-white truncate group-hover:text-cg-orange transition-colors duration-200">
            {challenge.name}
          </h3>
          <div className="flex items-center gap-2 sm:gap-3 mt-1">
            <span className="text-xs sm:text-sm text-cg-white-dim">
              published by <span className="text-cg-white">{challenge.author || "Unknown"}</span>
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 sm:hidden">
            <span className="text-xs text-cg-white-dim">{recordCount} records</span>
            <span className="text-xs text-cg-yellow font-bold">{points} pts</span>
          </div>
        </div>

        {/* Desktop stats */}
        <div className="hidden sm:flex items-center gap-6 shrink-0">
          <div className="text-center">
            <p className="text-[10px] text-cg-white-dim uppercase tracking-wider">Records</p>
            <p className="text-sm font-bold text-cg-white">{recordCount}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-cg-white-dim uppercase tracking-wider">Score</p>
            <p className="text-lg font-bold text-cg-yellow">{points}</p>
          </div>
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
