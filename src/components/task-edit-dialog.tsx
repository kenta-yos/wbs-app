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
import { Task } from "@/lib/types";

interface TaskEditDialogProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
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
  const [memo, setMemo] = useState(task?.memo ?? "");
  const [link, setLink] = useState(task?.link ?? "");
  const [dueDate, setDueDate] = useState(task?.dueDate?.slice(0, 10) ?? "");

  // Sync state when task changes
  const [prevTaskId, setPrevTaskId] = useState<number | null>(null);
  if (task && task.id !== prevTaskId) {
    setPrevTaskId(task.id);
    setTitle(task.title);
    setMemo(task.memo ?? "");
    setLink(task.link ?? "");
    setDueDate(task.dueDate?.slice(0, 10) ?? "");
  }

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
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
