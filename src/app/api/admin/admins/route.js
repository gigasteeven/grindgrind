import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { redis, KEYS, addAdminLog, getUser } from "@/lib/redis";
import bcrypt from "bcryptjs";

export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  const decoded = verifyToken(token);
  if (!decoded?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // List all users with isAdmin
  // Upstash doesn't support SCAN easily, so we track admin list
  const adminListRaw = await redis.get("admins:list");
  let adminList = typeof adminListRaw === "string" ? JSON.parse(adminListRaw) : (adminListRaw || ["admin"]);
  const admins = [];
  for (const username of adminList) {
    const user = await getUser(username);
    if (user) {
      admins.push({ username: user.username, isOwner: user.isOwner || false });
    }
  }
  return NextResponse.json({ admins });
}

export async function POST(request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  const decoded = verifyToken(token);
  if (!decoded?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only owner can add admins
  const currentUser = await getUser(decoded.username);
  if (!currentUser?.isOwner) {
    return NextResponse.json({ error: "Only the owner can add admins" }, { status: 403 });
  }

  const { username, password } = await request.json();
  if (!username || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Check if user exists
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

  // Track admin list
  const adminListRaw = await redis.get("admins:list");
  let adminList = typeof adminListRaw === "string" ? JSON.parse(adminListRaw) : (adminListRaw || ["admin"]);
  if (!adminList.includes(username.toLowerCase())) {
    adminList.push(username.toLowerCase());
  }
  await redis.set("admins:list", JSON.stringify(adminList));

  await addAdminLog({
    admin: decoded.username,
    action: "Added admin",
    details: { username },
  });

  return NextResponse.json({ success: true });
}
