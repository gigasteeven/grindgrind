import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getChallengeList, getUser, getPlayerPendingRecords } from "@/lib/redis";
import { getRankings } from "@/lib/formula";

export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find user case-insensitively
  const user = await getUser(decoded.username);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const challenges = await getChallengeList();
  const rankings = getRankings(challenges);

  // Find this user in rankings (case-insensitive match)
  const userKey = user.username.toLowerCase();
  const rankEntry = rankings.find(r => r.username.toLowerCase() === userKey);
  const rank = rankEntry ? rankings.indexOf(rankEntry) + 1 : null;

  // Get player's pending records (case-insensitive)
  const pendingRecords = await getPlayerPendingRecords(user.username);

  // Map pending records with challenge names
  const challengeMap = {};
  challenges.forEach((c, i) => {
    challengeMap[c.id] = { name: c.name, position: i + 1 };
  });

  const recordStatuses = pendingRecords.map(r => ({
    id: r.id,
    challengeId: r.challengeId,
    challengeName: challengeMap[r.challengeId]?.name || r.challengeId,
    challengePosition: challengeMap[r.challengeId]?.position || null,
    status: r.status || "pending",
    reason: r.reason || "",
    submittedAt: r.submittedAt,
    reviewedAt: r.reviewedAt || null,
    videoLink: r.videoLink,
    percent: r.percent,
  }));

  return NextResponse.json({
    username: user.username,
    country: user.country,
    isAdmin: user.isAdmin,
    isOwner: user.isOwner || false,
    totalScore: rankEntry?.score || 0,
    rank,
    completions: rankEntry?.completions || [],
    hardest: rankEntry?.hardest || null,
    hardestPosition: rankEntry?.hardestPosition || null,
    recordStatuses,
  });
}
