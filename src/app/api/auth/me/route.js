import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getUser } from "@/lib/redis";

/**
 * GET /api/auth/me
 * Verifies the JWT token from Authorization header and returns the real user data.
 * This is the ONLY source of truth for frontend auth state — localStorage is not trusted.
 */
export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ error: "No token" }, { status: 401 });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  // Fetch the REAL user from database — don't trust JWT payload alone
  const user = await getUser(decoded.username);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Return only safe fields — NEVER return password hash
  return NextResponse.json({
    username: user.username,
    country: user.country || "",
    isAdmin: user.isAdmin || false,
    isOwner: user.isOwner || false,
  });
}
