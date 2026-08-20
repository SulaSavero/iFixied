import { NextResponse } from "next/server";
import { db } from "@/db";
import { members } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const data = await db.select().from(members);
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const [newMember] = await db.insert(members).values(body).returning();
  return NextResponse.json(newMember);
}

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const { id, ...rest } = body;

  // Member cuma boleh update datanya sendiri
  if (session.role === 'member' && session.userId !== id) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const [updated] = await db.update(members).set(rest).where(eq(members.id, id)).returning();
  return NextResponse.json(updated);
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await req.json();
  await db.delete(members).where(eq(members.id, id));
  return NextResponse.json({ success: true });
}