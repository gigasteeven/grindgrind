import { NextResponse } from "next/server";
import { loginPlayer } from "@/lib/auth";

export async function POST(request) {
  const body = await request.json();
  const result = await loginPlayer(body);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
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
