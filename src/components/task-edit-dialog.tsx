"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Task, TaskStatus, STATUS_LABELS } from "@/lib/types";

const statusStyles: Record<TaskStatus, { active: string; inactive: string }> = {
  todo: {
    active: "bg-gray-200 text-gray-800 border-gray-400",
    inactive: "bg-gray-50 text-gray-400 border-gray-200",
  },
  in_progress: {
    active: "bg-blue-100 text-blue-800 border-blue-400",
    inactive: "bg-blue-50 text-blue-300 border-blue-200",
  },
  done: {
    active: "bg-green-100 text-green-800 border-green-400",
    inactive: "bg-green-50 text-green-300 border-green-200",
  },
};

interface TaskEditDialogProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    status: TaskStatus;
    memo: string | null;
    link: string | null;
    dueDate: string | null;
  }) => void;
  onDelete: () => void;
}

export function TaskEditDialog({
  task,
  open,
  onClose,
  onSave,
  onDelete,
}: TaskEditDialogProps) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? "todo");
  const [memo, setMemo] = useState(task?.memo ?? "");
  const [link, setLink] = useState(task?.link ?? "");
  const [dueDate, setDueDate] = useState(task?.dueDate?.slice(0, 10) ?? "");

  // Sync state when task changes
  const [prevTaskId, setPrevTaskId] = useState<number | null>(null);
  if (task && task.id !== prevTaskId) {
    setPrevTaskId(task.id);
    setTitle(task.title);
    setStatus(task.status);
    setMemo(task.memo ?? "");
    setLink(task.link ?? "");
    setDueDate(task.dueDate?.slice(0, 10) ?? "");
  }

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      status,
      memo: memo.trim() || null,
      link: link.trim() || null,
      dueDate: dueDate || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>タスク編集</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Status Selector */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              ステータス
            </label>
            <div className="flex gap-2 mt-1">
              {(["todo", "in_progress", "done"] as TaskStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`flex-1 py-2 text-xs font-medium rounded-md border transition-colors ${
                    status === s
                      ? statusStyles[s].active
                      : statusStyles[s].inactive
                  }`}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              タイトル
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="タスク名"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              メモ
            </label>
            <Textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="メモを入力..."
              rows={3}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              リンク
            </label>
            <Input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              期限
            </label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1">
              保存
            </Button>
            <Button variant="destructive" onClick={onDelete}>
              削除
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
