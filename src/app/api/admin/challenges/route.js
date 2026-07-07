import { NextResponse } from "next/server";
export const runtime = "edge";
import { verifyToken } from "@/lib/auth";
import { getChallengeList, getPlatformerList } from "@/lib/redis";

async function checkAdmin(request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  const decoded = verifyToken(token);
  if (!decoded?.isAdmin) return null;
  return decoded;
}

export async function GET(request) {
  const decoded = await checkAdmin(request);
  if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const challenges = await getChallengeList();
  return NextResponse.json({ challenges });
}
