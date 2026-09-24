import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";

import { attachNewSession } from "@/lib/auth-session";
import { hashPassword } from "@/lib/auth-password";

export async function POST(request: Request) {
  if (!env.DB) return NextResponse.json({ error: "Database non disponibile." }, { status: 503 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Richiesta non valida." }, { status: 400 });
  }

  const { email, password, displayName } = (body ?? {}) as Record<string, unknown>;
  const normalizedEmail = typeof email === "string" ? email.trim().toLocaleLowerCase("en") : "";
  const normalizedName = typeof displayName === "string" ? displayName.trim() : "";
  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
    return NextResponse.json({ error: "Inserisci un indirizzo email valido." }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 10) {
    return NextResponse.json({ error: "La password deve contenere almeno 10 caratteri." }, { status: 400 });
  }
  if (normalizedName.length < 2 || normalizedName.length > 120) {
    return NextResponse.json({ error: "Inserisci un nome visualizzato valido." }, { status: 400 });
  }

  const existing = await env.DB.prepare("SELECT id FROM users WHERE lower(email) = ? LIMIT 1")
    .bind(normalizedEmail)
    .first();
  if (existing) return NextResponse.json({ error: "Email già registrata." }, { status: 409 });

  const userId = crypto.randomUUID();
  const passwordHash = await hashPassword(password);

  try {
    await env.DB.batch([
      env.DB.prepare(
        "INSERT INTO users (id, email, display_name, role) VALUES (?, ?, ?, 'collector')",
      ).bind(userId, normalizedEmail, normalizedName),
      env.DB.prepare(
        "INSERT INTO user_passwords (user_id, password_hash) VALUES (?, ?)",
      ).bind(userId, passwordHash),
    ]);

    const response = NextResponse.json({
      user: {
        id: userId,
        email: normalizedEmail,
        displayName: normalizedName,
        role: "collector",
      },
    }, { status: 201 });
    await attachNewSession(response, userId);
    return response;
  } catch (error) {
    console.error("registration_failed", error);
    return NextResponse.json({ error: "Registrazione non riuscita." }, { status: 500 });
  }
}
