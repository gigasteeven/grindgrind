// Direct Upstash Redis REST API client — no SDK, no fetch cache issues.
// Works natively on Cloudflare Workers edge runtime.

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL || "https://busy-macaque-78789.upstash.io";
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || "gQAAAAAAATPFAAIgcDI0MzQ4MGRlZjA1Y2I0Njg4ODY2ZWI0M2MyNDBmODJmYQ";

const HEADERS = {
  Authorization: `Bearer ${REDIS_TOKEN}`,
  "Content-Type": "application/json",
};

// ── Low-level REST commands ──

async function redisGet(key) {
  try {
    const res = await fetch(`${REDIS_URL}/get/${encodeURIComponent(key)}`, {
      headers: HEADERS,
    });
    if (!res.ok) {
      console.error(`[redis] GET ${key} failed: ${res.status}`);
      return null;
    }
    const data = await res.json();
    if (data.result === null || data.result === undefined) return null;
    // Upstash returns strings; try to parse JSON, fall back to raw string
    const raw = data.result;
    if (typeof raw !== "string") return raw;
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  } catch (e) {
    console.error(`[redis] GET ${key} error:`, e.message);
    return null;
  }
}

async function redisSet(key, value) {
  try {
    const body = typeof value === "string" ? value : JSON.stringify(value);
    // Upstash REST /set/{key} takes the raw value as the POST body, NOT wrapped in JSON
    const res = await fetch(`${REDIS_URL}/set/${encodeURIComponent(key)}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REDIS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body,
    });
    if (!res.ok) {
      console.error(`[redis] SET ${key} failed: ${res.status}`);
    }
    return res.ok;
  } catch (e) {
    console.error(`[redis] SET ${key} error:`, e.message);
    return false;
  }
}

// ── Proxy for compatibility with existing code that uses redis.get/set ──
export const redis = {
  get: redisGet,
  set: redisSet,
  del: async (key) => { try { await fetch(`${REDIS_URL}/del/${encodeURIComponent(key)}`, { method: "POST", headers: HEADERS }); } catch (e) { console.error("[redis] DEL error:", e.message); } },
  mget: redisMGet,
};

export function getRedis() {
  return redis;
}

// ── Key helpers ──
export const KEYS = {
  challengeList: "challenge:list",
  challengePrefix: "challenge:",
  platformerList: "platformer:list",
  platformerPrefix: "platformer:",
  users: "users",
  userPrefix: "user:",
  adminLogs: "admin:logs",
  pendingRecords: "records:pending",
  rules: "content:rules",
  submission: "content:submission",
  staff: "content:staff",
  social: "content:social",
<<<<<<< HEAD
=======
  changelog: "changelog:entries",
>>>>>>> 93b1e84 (some changes)
};

// ── Pipeline: batch multiple GET commands in one HTTP request ──
async function redisMGet(keys) {
  if (!keys.length) return [];
  try {
    const commands = keys.map((k) => ["GET", k]);
    const res = await fetch(`${REDIS_URL}/pipeline`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify(commands),
    });
    if (!res.ok) {
      console.error(`[redis] pipeline failed: ${res.status}`);
      return keys.map(() => null);
    }
    const data = await res.json();
    return data.map((entry) => {
      const raw = entry?.result;
      if (raw === null || raw === undefined) return null;
      if (typeof raw !== "string") return raw;
      try {
        return JSON.parse(raw);
      } catch {
        return raw;
      }
    });
  } catch (e) {
    console.error("[redis] pipeline error:", e.message);
    return keys.map(() => null);
  }
}

// ── Challenge operations ──
// Always uses pipeline (1 HTTP request, fast) — no stale cache issues
export async function getChallengeList() {
  const ids = await redisGet(KEYS.challengeList);
  if (!Array.isArray(ids)) return [];
  const keys = ids.map((id) => `${KEYS.challengePrefix}${id}`);
  const results = await redisMGet(keys);
  return results.filter(Boolean);
}

export async function getChallenge(id) {
  return await redisGet(`${KEYS.challengePrefix}${id}`);
}

export async function getPlatformerList() {
  const ids = await redisGet(KEYS.platformerList);
  if (!Array.isArray(ids)) return [];
  const keys = ids.map((id) => `${KEYS.platformerPrefix}${id}`);
  const results = await redisMGet(keys);
  return results.filter(Boolean);
}

export async function getPlatformer(id) {
  return await redisGet(`${KEYS.platformerPrefix}${id}`);
}

// ── User operations ──
export async function getUser(username) {
  return await redisGet(`${KEYS.userPrefix}${username.toLowerCase()}`);
}

export async function createUser(user) {
  await redisSet(`${KEYS.userPrefix}${user.username.toLowerCase()}`, user);
}

// ── Admin logs ──
export async function addAdminLog(entry) {
  const logs = (await redisGet(KEYS.adminLogs)) || [];
  logs.unshift({ ...entry, timestamp: new Date().toISOString() });
  if (logs.length > 500) logs.length = 500;
  await redisSet(KEYS.adminLogs, logs);
}

export async function getAdminLogs(limit = 50) {
  const logs = (await redisGet(KEYS.adminLogs)) || [];
  return logs.slice(0, limit);
}

// ── Pending records ──
export async function addPendingRecord(record) {
  const records = (await redisGet(KEYS.pendingRecords)) || [];
  records.unshift({
    ...record,
    id: `pr_${Date.now()}`,
    submittedAt: new Date().toISOString(),
    status: "pending",
  });
  await redisSet(KEYS.pendingRecords, records);
}

export async function getPendingRecords() {
  const records = (await redisGet(KEYS.pendingRecords)) || [];
  return records;
}

export async function removePendingRecord(id) {
  const records = await getPendingRecords();
  const filtered = records.filter((r) => r.id !== id);
  await redisSet(KEYS.pendingRecords, filtered);
}

export async function getPlayerPendingRecords(username) {
  const records = await getPendingRecords();
  const key = username.toLowerCase();
  return records.filter(
    (r) =>
      (r.playerName && r.playerName.toLowerCase() === key) ||
      (r.submittedBy && r.submittedBy.toLowerCase() === key)
  );
}

export async function updatePendingRecordStatus(id, status, reason = "") {
  const records = await getPendingRecords();
  const idx = records.findIndex((r) => r.id === id);
  if (idx !== -1) {
    records[idx].status = status;
    records[idx].reason = reason;
    records[idx].reviewedAt = new Date().toISOString();
    await redisSet(KEYS.pendingRecords, records);
  }
}

// ── Content (editable from admin panel) ──
export async function getContent(key) {
  return await redisGet(key);
}

export async function setContent(key, value) {
  await redisSet(key, value);
}
<<<<<<< HEAD
=======

// ── Changelog (public feed on home page) ──
export async function addChangelogEntry(entry) {
  const entries = (await redisGet(KEYS.changelog)) || [];
  entries.unshift({ ...entry, timestamp: new Date().toISOString() });
  if (entries.length > 200) entries.length = 200;
  await redisSet(KEYS.changelog, entries);
}

export async function addChangelogEntries(newEntries) {
  const entries = (await redisGet(KEYS.changelog)) || [];
  const timestamped = newEntries.map(e => ({ ...e, timestamp: new Date().toISOString() }));
  entries.unshift(...timestamped);
  if (entries.length > 200) entries.length = 200;
  await redisSet(KEYS.changelog, entries);
}

export async function getChangelog(limit = 50) {
  const entries = (await redisGet(KEYS.changelog)) || [];
  return entries.slice(0, limit);
}
>>>>>>> 93b1e84 (some changes)
