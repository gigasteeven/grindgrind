import { NextResponse } from "next/server";
export const runtime = "edge";
import { verifyToken } from "@/lib/auth";
import { addAdminLog, getPendingRecords, updatePendingRecordStatus } from "@/lib/redis";

export async function POST(request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  const decoded = await verifyToken(token);
  if (!decoded?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, reason } = await request.json();
  const pending = await getPendingRecords();
  const record = pending.find((r) => r.id === id);
  if (!record) {
    return NextResponse.json({ error: "Record not found" }, { status: 404 });
  }

  // Mark as rejected with reason (keep in list so player can see status)
  await updatePendingRecordStatus(id, "rejected", reason || "No reason provided");

  await addAdminLog({
    admin: decoded.username,
    action: "Rejected record",
    details: { player: record.playerName, challenge: record.challengeId, reason },
  });

  return NextResponse.json({ success: true });
}
