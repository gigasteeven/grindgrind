import { NextResponse } from "next/server";
export const runtime = "edge";
import { verifyToken } from "@/lib/auth";
<<<<<<< HEAD
import { getPendingRecords } from "@/lib/redis";
=======
import { getPendingRecords, getChallengeList, getPlatformerList } from "@/lib/redis";
>>>>>>> 93b1e84 (some changes)

export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  const decoded = await verifyToken(token);
  if (!decoded?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const records = await getPendingRecords();
<<<<<<< HEAD
  return NextResponse.json({ records });
=======
  
  const challenges = await getChallengeList();
  const platformers = await getPlatformerList();
  const allLevels = [...challenges, ...platformers];
  const nameMap = {};
  for (const level of allLevels) {
    if (level && level.id && level.name) {
      nameMap[level.id] = level.name;
    }
  }

  const enrichedRecords = records.map(record => ({
    ...record,
    challengeName: nameMap[record.challengeId] || record.challengeId
  }));

  return NextResponse.json({ records: enrichedRecords });
>>>>>>> 93b1e84 (some changes)
}
