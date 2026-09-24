import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { SESSION_COOKIE, safeRelativeReturnPath } from "@/app/chatgpt-auth";
import { clearCurrentSession } from "@/lib/auth-session";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const returnTo = safeRelativeReturnPath(new URL(request.url).searchParams.get("return_to") ?? "/");
  const response = NextResponse.redirect(new URL(returnTo, request.url));
  await clearCurrentSession(response, token);
  return response;
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const response = NextResponse.json({ ok: true });
  await clearCurrentSession(response, token);
  return response;
}
