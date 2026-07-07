import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { redis, KEYS, addAdminLog, getPendingRecords, removePendingRecord, getChallenge } from "@/lib/redis";

export async function POST(request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  const decoded = verifyToken(token);
  if (!decoded?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await request.json();
  const pending = await getPendingRecords();
  const record = pending.find((r) => r.id === id);
  if (!record) {
    return NextResponse.json({ error: "Record not found" }, { status: 404 });
  }

  // Add record to the challenge
  const challenge = await getChallenge(record.challengeId);
  if (challenge) {
    const newRecord = {
      user: record.playerName,
      link: record.videoLink,
      percent: record.percent,
    };
    if (record.country) newRecord.country = record.country;
    if (record.time) newRecord.time = record.time;

    challenge.records = [...(challenge.records || []), newRecord];
    await redis.set(`${KEYS.challengePrefix}${record.challengeId}`, challenge);
  }

  // Remove from pending
  await removePendingRecord(id);

  await addAdminLog({
    admin: decoded.username,
    action: "Approved record",
    details: { player: record.playerName, challenge: record.challengeId },
  });

  return NextResponse.json({ success: true });
}
