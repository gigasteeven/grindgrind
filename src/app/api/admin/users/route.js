import { NextResponse } from "next/server";
export const runtime = "edge";
import { verifyToken } from "@/lib/auth";
import { redis, KEYS, getUser, addAdminLog } from "@/lib/redis";
import bcrypt from "bcryptjs";

/* GET — list all users (admin only) */
export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  const decoded = await verifyToken(token);
  if (!decoded?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get all user keys
  // Upstash doesn't support SCAN, so we track a user list
  const userListRaw = await redis.get("users:list");
  let userList = typeof userListRaw === "string" ? JSON.parse(userListRaw) : (userListRaw || []);

  // Also check admin list
  const adminListRaw = await redis.get("admins:list");
  let adminList = typeof adminListRaw === "string" ? JSON.parse(adminListRaw) : (adminListRaw || []);
  
  // Merge lists
  const allUsers = [...new Set([...userList, ...adminList, "admin"])];

  const users = [];
  for (const username of allUsers) {
    const user = await getUser(username);
    if (user) {
      users.push({
        username: user.username,
        country: user.country || "",
        isAdmin: user.isAdmin || false,
        isOwner: user.isOwner || false,
        createdAt: user.createdAt || "",
      });
    }
  }

  return NextResponse.json({ users });
}

/* POST — update a user's data (admin only) */
export async function POST(request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  const decoded = await verifyToken(token);
  if (!decoded?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { username, newPassword, newCountry } = await request.json();
  if (!username) {
    return NextResponse.json({ error: "Username required" }, { status: 400 });
  }

  const user = await getUser(username);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const changes = {};

  // Update password if provided
  if (newPassword && newPassword.length >= 4) {
    user.password = await bcrypt.hash(newPassword, 10);
    changes.password = "updated";
  }

  // Update country if provided
  if (newCountry !== undefined) {
    user.country = newCountry.toUpperCase().slice(0, 2);
    changes.country = user.country;
  }

  await redis.set(`${KEYS.userPrefix}${username.toLowerCase()}`, user);

  // Track user in users list
  const userListRaw = await redis.get("users:list");
  let userList = typeof userListRaw === "string" ? JSON.parse(userListRaw) : (userListRaw || []);
  if (!userList.includes(username.toLowerCase())) {
    userList.push(username.toLowerCase());
    await redis.set("users:list", JSON.stringify(userList));
  }

  await addAdminLog({
    admin: decoded.username,
    action: "Updated user data",
    details: { username, ...changes },
  });

  return NextResponse.json({ success: true });
}
