import { NextResponse } from "next/server";
export const runtime = "edge";
import { verifyToken } from "@/lib/auth";
import { redis, KEYS, addAdminLog, getUser } from "@/lib/redis";

export async function POST(request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  const decoded = verifyToken(token);
  if (!decoded?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const currentUser = await getUser(decoded.username);
  if (!currentUser?.isOwner) {
    return NextResponse.json({ error: "Only the owner can remove admins" }, { status: 403 });
  }

  const { username } = await request.json();
  if (username === "admin" || username === decoded.username) {
    return NextResponse.json({ error: "Cannot remove the owner" }, { status: 400 });
  }

  // Remove admin flag
  const user = await getUser(username);
  if (user) {
    user.isAdmin = false;
    await redis.set(`${KEYS.userPrefix}${username.toLowerCase()}`, user);
  }

  // Remove from admin list
  const adminListRaw = await redis.get("admins:list");
  let adminList = typeof adminListRaw === "string" ? JSON.parse(adminListRaw) : (adminListRaw || ["admin"]);
  adminList = adminList.filter((u) => u !== username.toLowerCase());
  await redis.set("admins:list", JSON.stringify(adminList));

  await addAdminLog({
    admin: decoded.username,
    action: "Removed admin",
    details: { username },
  });

  return NextResponse.json({ success: true });
}
