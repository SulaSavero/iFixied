import { NextResponse } from "next/server";
import { db } from "@/db";
import { pawns } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const [pawn] = await db.select().from(pawns).where(eq(pawns.accessCode, code));

  if (!pawn) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
  return NextResponse.json(pawn);
}