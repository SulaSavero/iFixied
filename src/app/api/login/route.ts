import { NextResponse } from "next/server";
import { db } from "@/db";
import { members } from "@/db/schema";
import { createSession } from "@/lib/auth";

export async function POST(req: Request) {
  const { username, password } = await req.json();

  const adminPassword = process.env.ADMIN_PASSWORD || 'sula7852';
  if (username === 'admin' && password === adminPassword) {
    await createSession({ userId: 'admin', role: 'admin' });
    return NextResponse.json({ success: true, role: 'admin' });
  }

  const allMembers = await db.select().from(members);
  const member = allMembers.find(
    (m) => m.phone === username && (m.password === password || (!m.password && m.phone === password))
  );

  if (member) {
    await createSession({ userId: member.id, role: 'member' });
    return NextResponse.json({ success: true, role: 'member', memberId: member.id });
  }

  return NextResponse.json({ success: false, message: 'Username atau password salah' }, { status: 401 });
}