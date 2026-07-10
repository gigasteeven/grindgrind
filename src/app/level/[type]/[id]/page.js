import { getChallenge, getPlatformer, getChallengeList, getPlatformerList, redis, KEYS } from "@/lib/redis";
import { calculatePoints } from "@/lib/formula";
import LevelDetail from "@/components/LevelDetail";

export const runtime = "edge";
export const revalidate = 60; // Cache for 1 minute (level data changes less often)

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

  if (challenge.records && challenge.records.length > 0) {
    const uniqueUsernames = [...new Set(challenge.records.map(r => r.user.toLowerCase()))];
    const userKeys = uniqueUsernames.map(u => `${KEYS.userPrefix}${u}`);
    const usersData = await redis.mget(userKeys);
    
    const userCountryMap = {};
    uniqueUsernames.forEach((u, i) => {
      if (usersData[i] && usersData[i].country) {
        userCountryMap[u] = usersData[i].country;
      }
    });

    challenge.records = challenge.records.map(r => ({
      ...r,
      country: userCountryMap[r.user.toLowerCase()] || r.country
    }));
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
