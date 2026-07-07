import { getChallengeList } from "@/lib/redis";
import { calculatePoints } from "@/lib/formula";
import ChallengeCard from "@/components/ChallengeCard";

export const dynamic = "force-dynamic";

export default async function ChallengeListPage() {
  const challenges = await getChallengeList();
  const maxPos = challenges.length || 1;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="cg-section-title text-cg-white">Challenge List</h1>
        <p className="mt-2 text-cg-white-dim">
          {challenges.length} challenges ranked by difficulty. Click a level to see full details and records.
        </p>
      </div>

      <div className="space-y-3">
        {challenges.map((challenge, index) => {
          const position = index + 1;
          const points = calculatePoints(position, maxPos);
          return (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              position={position}
              points={points}
              type="challenge"
            />
          );
        })}
      </div>
    </div>
  );
}
