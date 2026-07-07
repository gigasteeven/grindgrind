import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getChallengeList, getUser } from "@/lib/redis";
import { getRankings } from "@/lib/formula";

export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUser(decoded.username);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const challenges = await getChallengeList();
  const rankings = getRankings(challenges);

  // Find this user in rankings
  const rankEntry = rankings.find(r => r.username === user.username);
  const rank = rankEntry ? rankings.indexOf(rankEntry) + 1 : null;

  return NextResponse.json({
    username: user.username,
    country: user.country,
    isAdmin: user.isAdmin,
    totalScore: rankEntry?.score || 0,
    rank,
    completions: rankEntry?.completions || [],
    hardest: rankEntry?.hardest || null,
    hardestPosition: rankEntry?.hardestPosition || null,
  });
}
