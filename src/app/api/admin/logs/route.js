import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getAdminLogs, addAdminLog } from "@/lib/redis";

export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  const decoded = verifyToken(token);
  if (!decoded?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const logs = await getAdminLogs(100);
  return NextResponse.json({ logs });
}

export async function POST(request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  const decoded = verifyToken(token);
  if (!decoded?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { action, details } = await request.json();
  await addAdminLog({
    admin: decoded.username,
    action,
    details: details || {},
  });

  return NextResponse.json({ success: true });
}
