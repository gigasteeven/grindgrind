import { NextResponse } from "next/server";
export const runtime = "edge";
import { verifyToken } from "@/lib/auth";
<<<<<<< HEAD
import { redis, KEYS, addAdminLog, getChallenge } from "@/lib/redis";
=======
import { redis, KEYS } from "@/lib/redis";
>>>>>>> 93b1e84 (some changes)

export async function POST(request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  const decoded = await verifyToken(token);
  if (!decoded?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, direction } = await request.json();

  // Get current list order
  const listRaw = await redis.get(KEYS.challengeList);
  let list = Array.isArray(listRaw) ? listRaw : [];
  const idx = list.indexOf(String(id));
  if (idx === -1) return NextResponse.json({ error: "Challenge not found" }, { status: 404 });

  const newIdx = idx + direction;
  if (newIdx < 0 || newIdx >= list.length) {
    return NextResponse.json({ error: "Cannot move further" }, { status: 400 });
  }

  // Swap
  [list[idx], list[newIdx]] = [list[newIdx], list[idx]];
  await redis.set(KEYS.challengeList, list);

<<<<<<< HEAD
  await addAdminLog({
    admin: decoded.username,
    action: "Moved challenge position",
    details: { id, direction, from: idx + 1, to: newIdx + 1 },
  });

  return NextResponse.json({ success: true });
}
=======
  return NextResponse.json({ success: true });
}

>>>>>>> 93b1e84 (some changes)
