import { NextResponse } from "next/server";
import { addPendingRecord } from "@/lib/redis";
import { verifyToken } from "@/lib/auth";

export async function POST(request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  if (!body.challengeId || !body.playerName || !body.videoLink) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  await addPendingRecord({
    challengeId: body.challengeId,
    playerName: body.playerName,
    videoLink: body.videoLink,
    rawFootage: body.rawFootage || null,
    percent: body.percent || 100,
    country: body.country || "",
    listType: body.listType || "challenge",
    time: body.time || null,
    submittedBy: decoded.username,
  });

  return NextResponse.json({ success: true });
}
