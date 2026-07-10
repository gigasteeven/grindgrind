import { NextResponse } from "next/server";
export const runtime = "edge";
import { getChangelog } from "@/lib/redis";

export async function GET() {
  const entries = await getChangelog(50);
  return NextResponse.json({ entries });
}
