import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const result = await db.query.categories.findMany({
    orderBy: (categories, { asc }) => [asc(categories.sortOrder)],
    with: {
      tasks: {
        orderBy: (tasks, { asc }) => [asc(tasks.sortOrder)],
      },
    },
  });
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = await db
    .insert(categories)
    .values({ name: body.name, sortOrder: body.sortOrder ?? 0 })
    .returning();
  return NextResponse.json(result[0], { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const result = await db
    .update(categories)
    .set({ name: body.name })
    .where(eq(categories.id, body.id))
    .returning();
  return NextResponse.json(result[0]);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get("id"));
  await db.delete(categories).where(eq(categories.id, id));
  return NextResponse.json({ ok: true });
}
