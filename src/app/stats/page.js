import { getChallengeList, getPlatformerList } from "@/lib/redis";
import { getRankings } from "@/lib/formula";
import StatsViewerClient from "@/components/StatsViewerClient";

export const dynamic = "force-dynamic";

export default async function StatsViewerPage() {
  const challenges = await getChallengeList();
  const rankings = getRankings(challenges);

  // Add country info to rankings from user records
  // (rankings are built from challenge records, which may have country field)
  const challengesData = challenges.map(c => ({
    id: c.id,
    name: c.name,
    verifier: c.verifier || "",
  }));

  return <StatsViewerClient rankings={rankings} challenges={challengesData} />;
}
