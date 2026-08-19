import { NextResponse } from "next/server";
import { db } from "@/db";
import { members } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const data = await db.select().from(members);
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const [newMember] = await db.insert(members).values(body).returning();
  return NextResponse.json(newMember);
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { id, ...rest } = body;
  const [updated] = await db.update(members).set(rest).where(eq(members.id, id)).returning();
  return NextResponse.json(updated);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await db.delete(members).where(eq(members.id, id));
  return NextResponse.json({ success: true });
}