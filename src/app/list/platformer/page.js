import { getPlatformerList } from "@/lib/redis";
import { calculatePoints } from "@/lib/formula";
import ChallengeCard from "@/components/ChallengeCard";

export const runtime = "edge";
export const revalidate = 60; // Cache for 5 minutes

export default async function PlatformerListPage() {
  const challenges = await getPlatformerList();
  const maxPos = challenges.length || 1;

  return (
    <div className="mx-auto max-w-5xl px-3 sm:px-6 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="cg-section-title text-cg-white">Platformer List</h1>
        <p className="mt-2 text-sm text-cg-white-dim">
          {challenges.length > 0
            ? `${challenges.length} platformer challenges ranked by difficulty.`
            : "No platformer challenges yet."}
        </p>
      </div>

      {challenges.length > 0 ? (
        <div className="space-y-2 sm:space-y-3">
          {challenges.map((challenge, index) => {
            const position = index + 1;
            const points = calculatePoints(position, maxPos);
            return (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                position={position}
                points={points}
                type="platformer"
              />
            );
          })}
        </div>
      ) : (
        <div className="cg-card text-center py-12">
          <p className="text-cg-white-dim">Platformer challenges will appear here once added by staff.</p>
        </div>
      )}
    </div>
  );
}
