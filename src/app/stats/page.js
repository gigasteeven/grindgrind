import { getChallengeList, redis, KEYS } from "@/lib/redis";
import { getRankings } from "@/lib/formula";
import StatsViewerClient from "@/components/StatsViewerClient";

export const runtime = "edge";
export const revalidate = 60;

export default async function StatsViewerPage() {
  const challenges = await getChallengeList();
  const rankings = getRankings(challenges);

  // Fetch all player countries in a single pipeline request
  if (rankings.length > 0) {
    const usernames = [...new Set(rankings.map(r => r.username.toLowerCase()))];
    const keys = usernames.map(u => `${KEYS.userPrefix}${u}`);
    const users = await redis.mget(keys);
    
    for (let i = 0; i < usernames.length; i++) {
      const userData = users[i];
      if (userData && userData.country) {
        const player = rankings.find(r => r.username.toLowerCase() === usernames[i]);
        if (player) player.country = userData.country;
      }
    }
  }

  const challengesData = challenges.map(c => ({
    id: c.id,
    name: c.name,
    verifier: c.verifier || "",
  }));

  return <StatsViewerClient rankings={rankings} challenges={challengesData} />;
}
