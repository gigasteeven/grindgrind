import { NextResponse } from "next/server";
export const runtime = "edge";
import { verifyToken } from "@/lib/auth";
import { redis, KEYS, addAdminLog, addChangelogEntry } from "@/lib/redis";

export async function POST(request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  const decoded = await verifyToken(token);
  if (!decoded?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, id, author, verifier, verification, password, percentToQualify, listType, tags, position } = body;

  if (!name || !id || !verifier) {
    return NextResponse.json({ error: "Name, ID, and Verifier are required" }, { status: 400 });
  }

  const challenge = {
    id: String(id),
    name,
    author: author || "",
    creators: [],
    verifier,
    verification: verification || "",
    percentToQualify: percentToQualify || 100,
    password: password || "Not Copyable",
    records: [],
    tags: tags || [],
    publishedAt: new Date().toISOString(),
  };

  const listKey = listType === "platformer" ? KEYS.platformerList : KEYS.challengeList;
  const prefix = listType === "platformer" ? KEYS.platformerPrefix : KEYS.challengePrefix;

  // Get current list
  const raw = await redis.get(listKey);
  let list = Array.isArray(raw) ? raw : [];

  // Insert at specified position, or append at end
  const insertPos = position && position > 0 ? Math.min(position - 1, list.length) : list.length;
  list.splice(insertPos, 0, String(id));
  await redis.set(listKey, list);

  // Save challenge data
  await redis.set(`${prefix}${id}`, challenge);

  // Get names of neighbors for changelog
  let aboveName = null;
  let belowName = null;
  if (insertPos > 0 || insertPos < list.length - 1) {
    const neighborKeys = [];
    const neighborIds = [];
    if (insertPos > 0) {
      neighborIds.push(list[insertPos - 1]);
      neighborKeys.push(`${prefix}${list[insertPos - 1]}`);
    }
    if (insertPos < list.length - 1) {
      neighborIds.push(list[insertPos + 1]);
      neighborKeys.push(`${prefix}${list[insertPos + 1]}`);
    }
    const neighbors = await redis.mget(neighborKeys);
    let ni = 0;
    if (insertPos > 0) {
      aboveName = neighbors[ni]?.name || neighborIds[ni];
      ni++;
    }
    if (insertPos < list.length - 1) {
      belowName = neighbors[ni]?.name || neighborIds[ni];
    }
  }

  // Add changelog entry
  await addChangelogEntry({
    type: "added",
    challengeName: name,
    newPos: insertPos + 1,
    aboveName,
    belowName,
  });
  await addAdminLog({
    admin: decoded.username,
    action: "Added challenge",
    details: { name, id, listType: listType || "challenge", position: insertPos + 1 },
  });

  return NextResponse.json({ success: true, position: insertPos + 1 });
}

