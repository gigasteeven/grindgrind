import { NextResponse } from "next/server";
export const runtime = "edge";
import { verifyToken } from "@/lib/auth";
import { redis, KEYS, addAdminLog, getUser } from "@/lib/redis";
import bcrypt from "bcryptjs";

export async function POST(request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  const decoded = await verifyToken(token);
  if (!decoded?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const currentUser = await getUser(decoded.username);
  if (!currentUser?.isOwner) {
    return NextResponse.json({ error: "Only the owner can add admins" }, { status: 403 });
  }

  const { username, password } = await request.json();
  if (!username || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const existing = await getUser(username);
  if (existing) {
    return NextResponse.json({ error: "User already exists" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    username,
    password: hashedPassword,
    country: "",
    isAdmin: true,
    isOwner: false,
    createdAt: new Date().toISOString(),
    records: [],
  };
  await redis.set(`${KEYS.userPrefix}${username.toLowerCase()}`, newUser);

  // Track in admin list
  const adminListRaw = await redis.get("admins:list");
  let adminList = typeof adminListRaw === "string" ? JSON.parse(adminListRaw) : (adminListRaw || ["admin"]);
  if (!adminList.includes(username.toLowerCase())) {
    adminList.push(username.toLowerCase());
  }
  await redis.set("admins:list", JSON.stringify(adminList));

  // Track in users list
  const userListRaw = await redis.get("users:list");
  let userList = typeof userListRaw === "string" ? JSON.parse(userListRaw) : (userListRaw || []);
  if (!userList.includes(username.toLowerCase())) {
    userList.push(username.toLowerCase());
    await redis.set("users:list", JSON.stringify(userList));
  }

  await addAdminLog({
    admin: decoded.username,
    action: "Added admin",
    details: { username },
  });

  return NextResponse.json({ success: true });
}
