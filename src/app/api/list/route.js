import { NextResponse } from "next/server";
import { getChallengeList, getPlatformerList } from "@/lib/redis";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "challenge";

  const list = type === "platformer" ? await getPlatformerList() : await getChallengeList();
  const challenges = list.map((c, i) => ({
    id: c.id,
    name: c.name,
    position: i + 1,
  }));

  return NextResponse.json({ challenges });
}
