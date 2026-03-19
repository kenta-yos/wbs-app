import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body: { ids: number[] } = await request.json();
  await Promise.all(
    body.ids.map((id, index) =>
      db.update(categories).set({ sortOrder: index }).where(eq(categories.id, id))
    )
  );
  return NextResponse.json({ ok: true });
}
