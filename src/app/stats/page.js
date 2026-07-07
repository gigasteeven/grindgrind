import { getChallengeList } from "@/lib/redis";
import { getRankings } from "@/lib/formula";
import StatsViewerClient from "@/components/StatsViewerClient";

export const dynamic = "force-dynamic";

export default async function StatsViewerPage() {
  const challenges = await getChallengeList();
  const rankings = getRankings(challenges);

  // Pass serializable data
  const challengesData = challenges.map(c => ({
    id: c.id,
    name: c.name,
    verifier: c.verifier || "",
  }));

  return <StatsViewerClient rankings={rankings} challenges={challengesData} />;
}
