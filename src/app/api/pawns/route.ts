import { NextResponse } from "next/server";
import { db } from "@/db";
import { pawns } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const data = await db.select().from(pawns);
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const [newPawn] = await db.insert(pawns).values(body).returning();
  return NextResponse.json(newPawn);
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { id, ...rest } = body;
  const [updated] = await db.update(pawns).set(rest).where(eq(pawns.id, id)).returning();
  return NextResponse.json(updated);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await db.delete(pawns).where(eq(pawns.id, id));
  return NextResponse.json({ success: true });
}
