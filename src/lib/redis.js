import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

/* ── Key helpers ── */
export const KEYS = {
  challengeList: "challenge:list",        // ordered array of level IDs
  challengePrefix: "challenge:",          // challenge:{id} → JSON
  platformerList: "platformer:list",
  platformerPrefix: "platformer:",
  users: "users",                          // hash: username → JSON
  userPrefix: "user:",                     // user:{username} → JSON
  adminLogs: "admin:logs",                 // list of log entries
  pendingRecords: "records:pending",      // list of submitted records
  rules: "content:rules",
  submission: "content:submission",
  staff: "content:staff",
  social: "content:social",
};

/* ── Challenge operations ── */
export async function getChallengeList() {
  const raw = await redis.get(KEYS.challengeList);
  let ids = [];
  if (typeof raw === "string") {
    try { ids = JSON.parse(raw); } catch { ids = []; }
  } else if (Array.isArray(raw)) {
    ids = raw;
  }
  const challenges = [];
  for (const id of ids) {
    const data = await redis.get(`${KEYS.challengePrefix}${id}`);
    if (data) challenges.push(data);
  }
  return challenges;
}

export async function getChallenge(id) {
  return await redis.get(`${KEYS.challengePrefix}${id}`);
}

export async function getPlatformerList() {
  const raw = await redis.get(KEYS.platformerList);
  let ids = [];
  if (typeof raw === "string") {
    try { ids = JSON.parse(raw); } catch { ids = []; }
  } else if (Array.isArray(raw)) {
    ids = raw;
  }
  const list = [];
  for (const id of ids) {
    const data = await redis.get(`${KEYS.platformerPrefix}${id}`);
    if (data) list.push(data);
  }
  return list;
}

export async function getPlatformer(id) {
  return await redis.get(`${KEYS.platformerPrefix}${id}`);
}

/* ── User operations ── */
export async function getUser(username) {
  return await redis.get(`${KEYS.userPrefix}${username.toLowerCase()}`);
}

export async function createUser(user) {
  await redis.set(`${KEYS.userPrefix}${user.username.toLowerCase()}`, user);
}

/* ── Admin logs ── */
export async function addAdminLog(entry) {
  const raw = await redis.get(KEYS.adminLogs);
  let logs = [];
  if (typeof raw === "string") {
    try { logs = JSON.parse(raw); } catch { logs = []; }
  } else if (Array.isArray(raw)) {
    logs = raw;
  }
  logs.unshift({
    ...entry,
    timestamp: new Date().toISOString(),
  });
  // Keep last 500 logs
  if (logs.length > 500) logs = logs.slice(0, 500);
  await redis.set(KEYS.adminLogs, JSON.stringify(logs));
}

export async function getAdminLogs(limit = 50) {
  const raw = await redis.get(KEYS.adminLogs);
  let logs = [];
  if (typeof raw === "string") {
    try { logs = JSON.parse(raw); } catch { logs = []; }
  } else if (Array.isArray(raw)) {
    logs = raw;
  }
  return logs.slice(0, limit);
}

/* ── Pending records ── */
export async function addPendingRecord(record) {
  const raw = await redis.get(KEYS.pendingRecords);
  let records = [];
  if (typeof raw === "string") {
    try { records = JSON.parse(raw); } catch { records = []; }
  } else if (Array.isArray(raw)) {
    records = raw;
  }
  records.unshift({
    ...record,
    id: `pr_${Date.now()}`,
    submittedAt: new Date().toISOString(),
    status: "pending",
  });
  await redis.set(KEYS.pendingRecords, JSON.stringify(records));
}

export async function getPendingRecords() {
  const raw = await redis.get(KEYS.pendingRecords);
  let records = [];
  if (typeof raw === "string") {
    try { records = JSON.parse(raw); } catch { records = []; }
  } else if (Array.isArray(raw)) {
    records = raw;
  }
  return records;
}

export async function removePendingRecord(id) {
  const records = await getPendingRecords();
  const filtered = records.filter(r => r.id !== id);
  await redis.set(KEYS.pendingRecords, JSON.stringify(filtered));
}

/* ── Pending record status for player ── */
export async function getPlayerPendingRecords(username) {
  const records = await getPendingRecords();
  return records.filter(r => r.playerName === username || r.submittedBy === username);
}

/* ── Update pending record status (for rejection with reason) ── */
export async function updatePendingRecordStatus(id, status, reason = "") {
  const records = await getPendingRecords();
  const idx = records.findIndex(r => r.id === id);
  if (idx !== -1) {
    records[idx].status = status;
    records[idx].reason = reason;
    records[idx].reviewedAt = new Date().toISOString();
    await redis.set(KEYS.pendingRecords, JSON.stringify(records));
  }
}

/* ── Content (editable from admin panel) ── */
export async function getContent(key) {
  return await redis.get(key);
}

export async function setContent(key, value) {
  await redis.set(key, value);
}
