import { getChallenge, getPlatformer } from "@/lib/redis";
import { calculatePoints } from "@/lib/formula";
import { getChallengeList } from "@/lib/redis";
import LevelDetail from "@/components/LevelDetail";

export const dynamic = "force-dynamic";

export default async function LevelPage({ params }) {
  const { type, id } = params;
  const list = type === "platformer" ? await getPlatformerList() : await getChallengeList();
  const position = list.findIndex((c) => String(c.id) === String(id)) + 1;
  const challenge = type === "platformer" ? await getPlatformer(id) : await getChallenge(id);

  if (!challenge) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-cg-white">Level not found</h1>
        <p className="mt-2 text-cg-white-dim">This level may have been removed.</p>
      </div>
    );
  }

  const points = calculatePoints(position, list.length || 1);

  return (
    <LevelDetail
      challenge={challenge}
      position={position}
      points={points}
      type={type}
    />
  );
}
