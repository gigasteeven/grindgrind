import bcrypt from "bcryptjs";
import { jwtSign, jwtVerify } from "./jwt-edge";
import { redis, KEYS, getUser } from "./redis";

const JWT_SECRET = process.env.JWT_SECRET || "challengegrind_secret_key_2026";

/**
 * Verify Cloudflare Turnstile captcha token.
 * Skips verification if site key is not configured (dev mode).
 */
export async function verifyCaptcha(token) {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey || secretKey === "YOUR_CLOUDFLARE_SECRET_KEY") {
    return { success: true };
  }

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret: secretKey,
      response: token,
    }),
  });
  const data = await res.json();
  return { success: data.success };
}

/**
 * Register a new player.
 */
export async function registerPlayer({ username, password, country, captchaToken }) {
  const captcha = await verifyCaptcha(captchaToken);
  if (!captcha.success) {
    return { error: "Captcha verification failed" };
  }

  if (!username || username.length < 3 || username.length > 20) {
    return { error: "Username must be 3-20 characters" };
  }
  if (!password || password.length < 4) {
    return { error: "Password must be at least 4 characters" };
  }

  const existing = await getUser(username);
  if (existing) {
    return { error: "Username already taken" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = {
    username,
    password: hashedPassword,
    country: country || "",
    isAdmin: false,
    createdAt: new Date().toISOString(),
    records: [],
  };

  await redis.set(`${KEYS.userPrefix}${username.toLowerCase()}`, user);

  const token = await jwtSign({ username, isAdmin: false }, JWT_SECRET);
  return { token, user: { username, country: user.country, isAdmin: false } };
}

/**
 * Login a player.
 */
export async function loginPlayer({ username, password, captchaToken }) {
  const captcha = await verifyCaptcha(captchaToken);
  if (!captcha.success) {
    return { error: "Captcha verification failed" };
  }

  const user = await getUser(username);
  if (!user) {
    return { error: "User not found" };
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return { error: "Invalid password" };
  }

  const token = await jwtSign(
    { username: user.username, isAdmin: user.isAdmin || false },
    JWT_SECRET
  );
  return {
    token,
    user: { username: user.username, country: user.country, isAdmin: user.isAdmin || false },
  };
}

/**
 * Verify JWT token from request.
 */
export async function verifyToken(token) {
  try {
    return await jwtVerify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * Get auth context from Next.js request.
 */
export async function getAuthContext(request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return null;
  return await verifyToken(token);
}
