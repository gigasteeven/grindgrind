import Link from "next/link";

/**
 * Level card for list pages.
 * Clean minimal design: position number, level name, "published by" text.
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
      <div className="flex items-center gap-4 sm:gap-6 p-4 sm:p-5">
        {/* Position number */}
        <div className={`cg-rank w-10 h-10 sm:w-12 sm:h-12 text-base sm:text-lg ${rankClass}`}>
          {position}
        </div>

        {/* Dash separator + Level name */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-cg-white-dim/30 text-lg sm:text-xl font-light hidden sm:inline">—</span>
            <h3 className="cg-level-name text-lg sm:text-xl text-cg-white truncate group-hover:text-cg-orange transition-colors duration-200">
              {challenge.name}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-cg-white-dim mt-0.5 ml-0 sm:ml-5">
            published by <span className="text-cg-white">{challenge.author || "Unknown"}</span>
          </p>
        </div>

        {/* Stats — right side */}
        <div className="hidden sm:flex items-center gap-5 shrink-0">
          <div className="text-right">
            <p className="text-[10px] text-cg-white-dim uppercase tracking-wider">Records</p>
            <p className="text-sm font-bold text-cg-white">{recordCount}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-cg-white-dim uppercase tracking-wider">Score</p>
            <p className="text-lg font-bold text-cg-yellow">{points}</p>
          </div>
        </div>

        {/* Mobile stats */}
        <div className="flex sm:hidden flex-col items-end shrink-0 gap-0.5">
          <span className="text-xs font-bold text-cg-yellow">{points} pts</span>
          <span className="text-[10px] text-cg-white-dim">{recordCount} records</span>
        </div>
      </div>
    </Link>
  );
}
