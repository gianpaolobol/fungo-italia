import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";

import { attachNewSession } from "@/lib/auth-session";
import { verifyPassword } from "@/lib/auth-password";

export async function POST(request: Request) {
  if (!env.DB) return NextResponse.json({ error: "Database non disponibile." }, { status: 503 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Richiesta non valida." }, { status: 400 });
  }

  const { email, password } = (body ?? {}) as Record<string, unknown>;
  const normalizedEmail = typeof email === "string" ? email.trim().toLocaleLowerCase("en") : "";
  if (!normalizedEmail || typeof password !== "string") {
    return NextResponse.json({ error: "Credenziali non valide." }, { status: 400 });
  }

  const row = await env.DB.prepare(
    `SELECT u.id, u.email, u.display_name AS displayName, u.role,
            p.password_hash AS passwordHash
       FROM users u
       JOIN user_passwords p ON p.user_id = u.id
      WHERE lower(u.email) = ?
      LIMIT 1`,
  ).bind(normalizedEmail).first<{
    id: string;
    email: string;
    displayName: string | null;
    role: string;
    passwordHash: string;
  }>();

  const valid = row ? await verifyPassword(password, row.passwordHash) : false;
  if (!row || !valid) {
    return NextResponse.json({ error: "Email o password non corrette." }, { status: 401 });
  }

  const response = NextResponse.json({
    user: {
      id: row.id,
      email: row.email,
      displayName: row.displayName ?? row.email,
      role: row.role,
    },
  });
  await attachNewSession(response, row.id);
  return response;
}
