import { env } from "cloudflare:workers";
import type { NextResponse } from "next/server";

import {
  SESSION_COOKIE,
  createSessionToken,
  hashSessionToken,
} from "@/app/chatgpt-auth";

const SESSION_DAYS = 30;

export async function attachNewSession(response: NextResponse, userId: string) {
  if (!env.DB) throw new Error("Database non disponibile.");
  const token = createSessionToken();
  const id = await hashSessionToken(token);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await env.DB.prepare(
    "INSERT INTO sessions (id, user_id, expires_at, created_at, last_accessed) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
  ).bind(id, userId, expiresAt.toISOString()).run();

  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearCurrentSession(response: NextResponse, token: string | undefined) {
  if (token && env.DB) {
    const id = await hashSessionToken(token);
    await env.DB.prepare("DELETE FROM sessions WHERE id = ?").bind(id).run();
  }
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
}
