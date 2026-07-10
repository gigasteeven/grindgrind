import { NextResponse } from "next/server";
import { redis, KEYS } from "@/lib/redis";

export const runtime = "edge";

export async function GET() {
  const debug = {
    timestamp: new Date().toISOString(),
    steps: [],
  };

  try {
    const challengeList = await redis.get("challenge:list");
    debug.steps.push({
      step: "get challenge:list",
      status: "ok",
      type: typeof challengeList,
      isArray: Array.isArray(challengeList),
      count: Array.isArray(challengeList) ? challengeList.length : 0,
      value: JSON.stringify(challengeList)?.substring(0, 300),
    });

    if (Array.isArray(challengeList) && challengeList.length > 0) {
      const first = await redis.get(`challenge:${challengeList[0]}`);
      debug.steps.push({
        step: `get challenge:${challengeList[0]}`,
        status: "ok",
        name: first?.name || "N/A",
      });
    }
  } catch (e) {
    debug.steps.push({ step: "error", status: "error", message: e.message });
  }

  return NextResponse.json(debug, { status: 200 });
}
