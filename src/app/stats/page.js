import { getChallengeList } from "@/lib/redis";
import { getRankings } from "@/lib/formula";

export const dynamic = "force-dynamic";

export default async function StatsViewerPage() {
  const challenges = await getChallengeList();
  const rankings = getRankings(challenges);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="cg-section-title text-cg-white">Stats Viewer</h1>
        <p className="mt-2 text-cg-white-dim">
          Player rankings based on challenge completions. {rankings.length} players ranked.
        </p>
      </div>

      {/* Top 3 podium */}
      {rankings.length >= 3 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8">
          {[1, 0, 2].map((idx) => {
            const player = rankings[idx];
            if (!player) return <div key={idx} />;
            const heights = ["h-28", "h-36", "h-24"];
            const colors = [
              "border-cg-yellow/40 bg-cg-yellow/5",
              "border-cg-orange/40 bg-cg-orange/5",
              "border-cg-orange-bright/30 bg-cg-orange-bright/5",
            ];
            const medals = ["🥇", "🥈", "🥉"];
            const order = [1, 0, 2].indexOf(idx);
            return (
              <div key={player.username} className="flex flex-col items-center">
                <div className="text-3xl mb-2">{medals[order]}</div>
                <p className="text-sm font-semibold text-cg-white text-center truncate max-w-full mb-1">
                  {player.username}
                </p>
                <p className="text-lg font-extrabold text-cg-yellow">{player.score}</p>
                <div className={`w-full ${heights[order]} mt-2 rounded-lg border ${colors[order]} flex items-end justify-center pb-2`}>
                  <span className="text-2xl font-extrabold text-cg-white-dim">#{idx + 1}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full ranking table */}
      <div className="cg-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cg-border bg-cg-brown/50">
                <th className="text-left px-4 py-3 font-semibold text-cg-orange">#</th>
                <th className="text-left px-4 py-3 font-semibold text-cg-orange">Player</th>
                <th className="text-right px-4 py-3 font-semibold text-cg-orange">Score</th>
                <th className="text-right px-4 py-3 font-semibold text-cg-orange hidden sm:table-cell">Completions</th>
                <th className="text-right px-4 py-3 font-semibold text-cg-orange hidden md:table-cell">Hardest</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((player, idx) => (
                <tr
                  key={player.username}
                  className="border-b border-cg-border/50 transition-colors duration-150 hover:bg-cg-brown/30"
                >
                  <td className="px-4 py-3">
                    <span className={`font-bold ${idx < 3 ? "text-cg-yellow" : "text-cg-white-dim"}`}>
                      {idx + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-cg-white">{player.username}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-bold text-cg-yellow">{player.score}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-cg-white-dim hidden sm:table-cell">
                    {player.completions.length}
                  </td>
                  <td className="px-4 py-3 text-right text-cg-white-dim hidden md:table-cell truncate max-w-[200px]">
                    {player.hardest ? `#${player.hardestPosition} ${player.hardest}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {rankings.length === 0 && (
        <div className="cg-card text-center py-12">
          <p className="text-cg-white-dim">No records yet. Be the first to complete a challenge!</p>
        </div>
      )}
    </div>
  );
}
