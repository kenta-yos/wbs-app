import { Category, Task, TaskStatus } from "./types";

const BASE = "/api";

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${BASE}/categories`);
  return res.json();
}

export async function createCategory(name: string, sortOrder: number): Promise<Category> {
  const res = await fetch(`${BASE}/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, sortOrder }),
  });
  return res.json();
}

export async function updateCategory(id: number, name: string): Promise<Category> {
  const res = await fetch(`${BASE}/categories`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, name }),
  });
  return res.json();
}

export async function deleteCategory(id: number): Promise<void> {
  await fetch(`${BASE}/categories?id=${id}`, { method: "DELETE" });
}

export async function createTask(
  categoryId: number,
  title: string,
  sortOrder: number
): Promise<Task> {
  const res = await fetch(`${BASE}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ categoryId, title, sortOrder }),
  });
  return res.json();
}

export async function updateTask(
  id: number,
  data: {
    title?: string;
    status?: TaskStatus;
    memo?: string | null;
    link?: string | null;
    dueDate?: string | null;
  }
): Promise<Task> {
  const res = await fetch(`${BASE}/tasks`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...data }),
  });
  return res.json();
}

export async function deleteTask(id: number): Promise<void> {
  await fetch(`${BASE}/tasks?id=${id}`, { method: "DELETE" });
}

export async function reorderCategories(ids: number[]): Promise<void> {
  await fetch(`${BASE}/categories/reorder`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
}
