import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = await db
    .insert(tasks)
    .values({
      categoryId: body.categoryId,
      title: body.title,
      status: body.status ?? "todo",
      memo: body.memo ?? null,
      link: body.link ?? null,
      dueDate: body.dueDate || null,
      sortOrder: body.sortOrder ?? 0,
    })
    .returning();
  return NextResponse.json(result[0], { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const updates: Record<string, unknown> = {};
  if (body.title !== undefined) updates.title = body.title;
  if (body.status !== undefined) updates.status = body.status;
  if (body.memo !== undefined) updates.memo = body.memo;
  if (body.link !== undefined) updates.link = body.link;
  if (body.dueDate !== undefined)
    updates.dueDate = body.dueDate || null;

  const result = await db
    .update(tasks)
    .set(updates)
    .where(eq(tasks.id, body.id))
    .returning();
  return NextResponse.json(result[0]);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get("id"));
  await db.delete(tasks).where(eq(tasks.id, id));
  return NextResponse.json({ ok: true });
}
