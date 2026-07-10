import { NextResponse } from "next/server";
export const runtime = "edge";
import { verifyToken } from "@/lib/auth";
import { redis, KEYS, addAdminLog, addChangelogEntries } from "@/lib/redis";

export async function POST(request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  const decoded = await verifyToken(token);
  if (!decoded?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { newOrder, listType } = await request.json();
  if (!Array.isArray(newOrder)) {
    return NextResponse.json({ error: "newOrder must be an array" }, { status: 400 });
  }

  const listKey = listType === "platformer" ? KEYS.platformerList : KEYS.challengeList;
  const prefix = listType === "platformer" ? KEYS.platformerPrefix : KEYS.challengePrefix;

  // Get old order
  const oldOrder = (await redis.get(listKey)) || [];

  // Build name map from challenge data
  const keys = [...new Set([...oldOrder, ...newOrder])].map(id => `${prefix}${id}`);
  const challengesData = await redis.mget(keys);
  const nameMap = {};
  [...new Set([...oldOrder, ...newOrder])].forEach((id, i) => {
    if (challengesData[i] && challengesData[i].name) {
      nameMap[id] = challengesData[i].name;
    }
  });

  // Build old position map
  const oldPosMap = {};
  oldOrder.forEach((id, i) => { oldPosMap[id] = i + 1; });

  // Find changes and create changelog entries
  const changelogEntries = [];
  const movedDetails = [];

  newOrder.forEach((id, newIdx) => {
    const newPos = newIdx + 1;
    const oldPos = oldPosMap[id];
    if (oldPos && oldPos !== newPos) {
      const aboveId = newIdx > 0 ? newOrder[newIdx - 1] : null;
      const belowId = newIdx < newOrder.length - 1 ? newOrder[newIdx + 1] : null;

      changelogEntries.push({
        type: newPos < oldPos ? "raised" : "lowered",
        challengeName: nameMap[id] || id,
        oldPos,
        newPos,
        aboveName: aboveId ? (nameMap[aboveId] || aboveId) : null,
        belowName: belowId ? (nameMap[belowId] || belowId) : null,
      });

      movedDetails.push({
        name: nameMap[id] || id,
        from: oldPos,
        to: newPos,
      });
    }
  });

  // Save new order
  await redis.set(listKey, newOrder);

  // Write changelog entries
  if (changelogEntries.length > 0) {
    await addChangelogEntries(changelogEntries);
  }

  // Write admin log (one summary entry)
  if (movedDetails.length > 0) {
    await addAdminLog({
      admin: decoded.username,
      action: `Reordered ${movedDetails.length} challenge(s)`,
      details: { moves: movedDetails },
    });
  }

  return NextResponse.json({ success: true, moved: movedDetails.length });
}
