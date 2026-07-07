import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { redis, KEYS, addAdminLog } from "@/lib/redis";

export async function POST(request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  const decoded = verifyToken(token);
  if (!decoded?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, id, author, verifier, verification, password, percentToQualify, listType, tags } = body;

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

  // Add to list
  const raw = await redis.get(listKey);
  let list = typeof raw === "string" ? JSON.parse(raw) : (raw || []);
  list.push(String(id));
  await redis.set(listKey, JSON.stringify(list));

  // Save challenge data
  await redis.set(`${prefix}${id}`, challenge);

  await addAdminLog({
    admin: decoded.username,
    action: "Added challenge",
    details: { name, id, listType: listType || "challenge" },
  });

  return NextResponse.json({ success: true });
}
