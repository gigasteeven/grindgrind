/**
 * Seed script — imports merge data into Upstash Redis.
 * Run: node src/lib/seed.js
 *
 * Removes "hz" field and "360" values from records as requested.
 * Creates default admin user (admin / grind).
 */

import { Redis } from "@upstash/redis";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env.local manually
const envPath = path.join(__dirname, "../../.env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const envVars = {};
envContent.split("\n").forEach((line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim().replace(/^"|"$/g, "");
  }
});

const redis = new Redis({
  url: envVars.UPSTASH_REDIS_REST_URL,
  token: envVars.UPSTASH_REDIS_REST_TOKEN,
});

async function seed() {
  console.log("🌱 Seeding ChallengeGrind database...\n");

  // ── 1. Create default admin user ──
  const adminPassword = await bcrypt.hash("grind", 10);
  const adminUser = {
    username: "admin",
    password: adminPassword,
    country: "",
    isAdmin: true,
    isOwner: true, // only owner can add other admins
    createdAt: new Date().toISOString(),
    records: [],
  };
  await redis.set("user:admin", adminUser);
  console.log("✅ Created admin user (admin / grind)");

  // ── 2. Import challenge data from merge folder ──
  const mergeDir = path.join(__dirname, "../../merge");
  const listFile = path.join(mergeDir, "_list.json");
  const order = JSON.parse(fs.readFileSync(listFile, "utf-8"));

  // Clear existing list
  await redis.set("challenge:list", JSON.stringify([]));

  const challenges = [];
  for (let i = 0; i < order.length; i++) {
    const name = order[i];
    const filePath = path.join(mergeDir, `${name}.json`);
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Skipping ${name} — file not found`);
      continue;
    }

    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    // Clean records: remove hz, remove 360
    const cleanedRecords = (data.records || []).map((r) => ({
      user: r.user,
      link: r.link || "",
      percent: r.percent || 100,
    }));

    const challenge = {
      id: data.id,
      name: data.name,
      author: data.author || "",
      creators: data.creators || [],
      verifier: data.verifier || "",
      verification: data.verification || "",
      percentToQualify: data.percentToQualify || 100,
      password: data.password || "Not Copyable",
      records: cleanedRecords,
      tags: [],
      publishedAt: new Date().toISOString(),
      position: i + 1,
    };

    await redis.set(`challenge:${data.id}`, challenge);
    challenges.push(data.id);
    console.log(`  #${i + 1}: ${data.name} (${cleanedRecords.length} records)`);
  }

  // Store ordered list
  await redis.set("challenge:list", JSON.stringify(challenges));
  console.log(`\n✅ Imported ${challenges.length} challenges`);

  // ── 3. Set default content ──
  await redis.set("content:rules", JSON.stringify([
    "Records must be achieved on the official version of the level.",
    "Video proof is required for all records on the Main List.",
    "Raw footage may be requested by staff for verification.",
    "Cheating, macro usage, or speedhack will result in a permanent ban.",
    "Players must use legitimate copy of the level (no hacks).",
    "Records must be submitted through the Submit Records page.",
    "Staff reserves the right to reject any record without explanation.",
  ]));
  console.log("✅ Set default Rules content");

  await redis.set("content:submission", JSON.stringify([
    "Levels must be original creations, not copies of existing levels.",
    "Levels must have a verifier with video proof of 100% completion.",
    "Levels must be challenging enough to qualify for the list.",
    "Submission must include level ID, name, author, and verification video.",
    "Staff will review submissions and decide placement on the list.",
    "Levels that are nerfed or updated may be re-evaluated.",
  ]));
  console.log("✅ Set default Level Submission content");

  await redis.set("content:staff", JSON.stringify([
    { username: "admin", role: "Owner", avatar: "", socials: {} },
  ]));
  console.log("✅ Set default Staff content");

  await redis.set("content:social", JSON.stringify({
    telegram: "https://t.me/CHALLENGE_GRIND",
    discord: "",
    youtube: "",
  }));
  console.log("✅ Set default Social Media content");

  // ── 4. Init empty platformer list ──
  await redis.set("platformer:list", JSON.stringify([]));
  console.log("✅ Initialized empty Platformer list");

  // ── 5. Init empty admin logs ──
  await redis.set("admin:logs", JSON.stringify([]));
  console.log("✅ Initialized admin logs");

  console.log("\n🎉 Seeding complete!");
}

seed().catch(console.error);
