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

  const { id } = await request.json();

  // Remove from list
  const listRaw = await redis.get(KEYS.challengeList);
  let list = typeof listRaw === "string" ? JSON.parse(listRaw) : (listRaw || []);
  list = list.filter((c) => String(c) !== String(id));
  await redis.set(KEYS.challengeList, JSON.stringify(list));

  // Delete challenge data
  await redis.del(`${KEYS.challengePrefix}${id}`);

  await addAdminLog({
    admin: decoded.username,
    action: "Deleted challenge",
    details: { id },
  });

  return NextResponse.json({ success: true });
}
