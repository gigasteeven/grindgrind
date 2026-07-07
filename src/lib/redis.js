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
  const ids = await redis.lrange(KEYS.challengeList, 0, -1);
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
  const ids = await redis.lrange(KEYS.platformerList, 0, -1);
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
  await redis.lpush(KEYS.adminLogs, JSON.stringify({
    ...entry,
    timestamp: new Date().toISOString(),
  }));
}

export async function getAdminLogs(limit = 50) {
  const logs = await redis.lrange(KEYS.adminLogs, 0, limit - 1);
  return logs.map(l => typeof l === "string" ? JSON.parse(l) : l);
}

/* ── Pending records ── */
export async function addPendingRecord(record) {
  await redis.lpush(KEYS.pendingRecords, JSON.stringify({
    ...record,
    id: `pr_${Date.now()}`,
    submittedAt: new Date().toISOString(),
    status: "pending",
  }));
}

export async function getPendingRecords() {
  const records = await redis.lrange(KEYS.pendingRecords, 0, -1);
  return records.map(r => typeof r === "string" ? JSON.parse(r) : r);
}

export async function removePendingRecord(id) {
  const records = await getPendingRecords();
  const filtered = records.filter(r => r.id !== id);
  await redis.set(KEYS.pendingRecords, JSON.stringify(filtered));
}

/* ── Content (editable from admin panel) ── */
export async function getContent(key) {
  return await redis.get(key);
}

export async function setContent(key, value) {
  await redis.set(key, value);
}
