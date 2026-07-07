import { NextResponse } from "next/server";
export const runtime = "edge";
import { verifyToken } from "@/lib/auth";
import { addPendingRecord } from "@/lib/redis";

export async function POST(request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  const decoded = await verifyToken(token);
  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized — please log in" }, { status: 401 });
  }

  const body = await request.json();

  if (!body.challengeId || !body.videoLink) {
    return NextResponse.json({ error: "Missing required fields (challenge and video link)" }, { status: 400 });
  }

  // Use the authenticated user's name from token, not from the form
  await addPendingRecord({
    challengeId: body.challengeId,
    playerName: decoded.username, // from JWT, can't be faked
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
