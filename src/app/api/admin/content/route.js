import { NextResponse } from "next/server";
export const runtime = "edge";
import { verifyToken } from "@/lib/auth";
import { getContent, setContent, addAdminLog } from "@/lib/redis";

export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  const decoded = verifyToken(token);
  if (!decoded?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  if (!key) return NextResponse.json({ error: "Missing key" }, { status: 400 });

  let items = await getContent(key);
  if (typeof items === "string") {
    try { items = JSON.parse(items); } catch { items = [items]; }
  }
  return NextResponse.json({ items: items || [] });
}

export async function POST(request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  const decoded = verifyToken(token);
  if (!decoded?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key, items } = await request.json();
  await setContent(key, JSON.stringify(items));

  await addAdminLog({
    admin: decoded.username,
    action: `Updated content: ${key}`,
    details: {},
  });

  return NextResponse.json({ success: true });
}
