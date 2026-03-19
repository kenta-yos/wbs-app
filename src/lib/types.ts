export type TaskStatus = "todo" | "in_progress" | "done";

export interface Task {
  id: number;
  categoryId: number;
  title: string;
  status: TaskStatus;
  memo: string | null;
  link: string | null;
  dueDate: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  sortOrder: number;
  createdAt: string;
  tasks: Task[];
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "未着手",
  in_progress: "進行中",
  done: "完了",
};

export const STATUS_CYCLE: TaskStatus[] = ["todo", "in_progress", "done"];
