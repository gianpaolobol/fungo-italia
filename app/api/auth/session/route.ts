import { NextResponse } from "next/server";

import { getChatGPTUser } from "@/app/chatgpt-auth";

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({ user }, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
