import { getChallengeList } from "@/lib/redis";
import { calculatePoints } from "@/lib/formula";
import ChallengeCard from "@/components/ChallengeCard";
import ChallengeListClient from "@/components/ChallengeListClient";

export const runtime = "edge";
export const revalidate = 60; // Cache for 5 minutes

export default async function ChallengeListPage() {
  const challenges = await getChallengeList();
  const maxPos = challenges.length || 1;

  const challengesWithPoints = challenges.map((challenge, index) => {
    const position = index + 1;
    const points = calculatePoints(position, maxPos);
    return { challenge, position, points };
  });

  return <ChallengeListClient challenges={challengesWithPoints} />;
}
