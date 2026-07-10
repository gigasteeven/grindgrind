import { NextResponse } from "next/server";
export const runtime = "edge";
import { registerPlayer } from "@/lib/auth";
import { redis, KEYS } from "@/lib/redis";

export async function POST(request) {
  const body = await request.json();
  const result = await registerPlayer(body);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  // Track user in users list
  const userListRaw = await redis.get("users:list");
  let userList = Array.isArray(userListRaw) ? userListRaw : [];
  const usernameLower = result.user.username.toLowerCase();
  if (!userList.includes(usernameLower)) {
    userList.push(usernameLower);
    await redis.set("users:list", userList);
  }

  const response = NextResponse.json(result);
  response.cookies.set("token", result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return response;
}
