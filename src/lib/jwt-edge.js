/**
 * Edge-compatible JWT implementation using jose library.
 * Works in Cloudflare Workers / Pages edge runtime.
 */
import { SignJWT, jwtVerify as joseVerify } from "jose";

const encoder = new TextEncoder();

function getSecretKey(secret) {
  return encoder.encode(secret);
}

/**
 * Sign a JWT token (7 day expiry).
 */
export async function jwtSign(payload, secret) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey(secret));
}

/**
 * Verify a JWT token. Returns decoded payload or throws.
 */
export async function jwtVerify(token, secret) {
  const { payload } = await joseVerify(token, getSecretKey(secret), {
    algorithms: ["HS256"],
  });
  return payload;
}
