import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "davao-tours-secret-key-2026"
);

export type SessionPayload = {
  id: number;
  username?: string;
  email?: string;
  name: string;
  role: "admin" | "customer";
};

const ADMIN_COOKIE = "dt_session";
const CUSTOMER_COOKIE = "dt_customer";

async function sign(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(SECRET);
}

async function verify(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionPayload;
  } catch { return null; }
}

// Admin session
export async function setAdminSession(payload: SessionPayload) {
  const token = await sign(payload);
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 8 });
}

export async function getAdminSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  return verify(token);
}

export async function clearAdminSession() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}

// Customer session
export async function setCustomerSession(payload: SessionPayload) {
  const token = await sign(payload);
  const jar = await cookies();
  jar.set(CUSTOMER_COOKIE, token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 8 });
}

export async function getCustomerSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(CUSTOMER_COOKIE)?.value;
  if (!token) return null;
  return verify(token);
}

export async function clearCustomerSession() {
  const jar = await cookies();
  jar.delete(CUSTOMER_COOKIE);
}

// Generic: get any session (admin or customer)
export async function getSession(): Promise<SessionPayload | null> {
  return (await getAdminSession()) ?? (await getCustomerSession());
}

export { ADMIN_COOKIE, CUSTOMER_COOKIE };