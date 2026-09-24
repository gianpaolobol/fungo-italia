import { env } from "cloudflare:workers";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type ChatGPTUser = {
  userId: string;
  displayName: string;
  email: string;
  fullName: string | null;
  role: "collector" | "mycologist" | "scientific_curator";
};

export const SESSION_COOKIE = "fungo_session";
const SIGN_IN_PATH = "/login";
const SIGN_OUT_PATH = "/api/auth/logout";

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function hashSessionToken(token: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return bytesToHex(new Uint8Array(digest));
}

export function createSessionToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export async function getChatGPTUser(): Promise<ChatGPTUser | null> {
  if (!env.DB) return null;
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const sessionHash = await hashSessionToken(token);
  const row = await env.DB.prepare(
    `SELECT u.id AS userId, u.email, u.display_name AS displayName, u.role,
            s.expires_at AS expiresAt
       FROM sessions s
       JOIN users u ON u.id = s.user_id
      WHERE s.id = ?
        AND s.expires_at > CURRENT_TIMESTAMP
      LIMIT 1`,
  ).bind(sessionHash).first<{
    userId: string;
    email: string;
    displayName: string | null;
    role: string;
    expiresAt: string;
  }>();

  if (!row) return null;
  const role =
    row.role === "mycologist" || row.role === "scientific_curator"
      ? row.role
      : "collector";

  return {
    userId: row.userId,
    email: row.email,
    displayName: row.displayName?.trim() || row.email,
    fullName: row.displayName?.trim() || null,
    role,
  };
}

export async function requireChatGPTUser(returnTo: string): Promise<ChatGPTUser> {
  const user = await getChatGPTUser();
  if (user) return user;
  redirect(chatGPTSignInPath(returnTo));
}

export function chatGPTSignInPath(returnTo: string): string {
  return `${SIGN_IN_PATH}?return_to=${encodeURIComponent(safeRelativeReturnPath(returnTo))}`;
}

export function chatGPTSignOutPath(returnTo = "/"): string {
  return `${SIGN_OUT_PATH}?return_to=${encodeURIComponent(safeRelativeReturnPath(returnTo))}`;
}

export function safeRelativeReturnPath(value: string): string {
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  let url: URL;
  try {
    url = new URL(value, "https://app.local");
  } catch {
    return "/";
  }
  if (url.origin !== "https://app.local") return "/";
  if (url.pathname === SIGN_IN_PATH || url.pathname.startsWith("/api/auth/")) return "/";
  return `${url.pathname}${url.search}${url.hash}`;
}
