import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getPendingRecords } from "@/lib/redis";

export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  const decoded = verifyToken(token);
  if (!decoded?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const records = await getPendingRecords();
  return NextResponse.json({ records });
}
