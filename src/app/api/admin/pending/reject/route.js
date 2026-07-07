import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { addAdminLog, getPendingRecords, removePendingRecord } from "@/lib/redis";

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

  await removePendingRecord(id);

  await addAdminLog({
    admin: decoded.username,
    action: "Rejected record",
    details: { player: record.playerName, challenge: record.challengeId },
  });

  return NextResponse.json({ success: true });
}
