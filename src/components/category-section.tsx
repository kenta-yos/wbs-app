"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  ExternalLink,
  Calendar,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/status-badge";
import { Category, Task, TaskStatus, STATUS_CYCLE } from "@/lib/types";

interface CategorySectionProps {
  category: Category;
  onAddTask: (categoryId: number, title: string) => void;
  onToggleStatus: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (category: Category) => void;
}

export function CategorySection({
  category,
  onAddTask,
  onToggleStatus,
  onEditTask,
  onEditCategory,
  onDeleteCategory,
}: CategorySectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [showAddTask, setShowAddTask] = useState(false);

  const doneCount = category.tasks.filter((t) => t.status === "done").length;
  const totalCount = category.tasks.length;
  const progressPercent = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    onAddTask(category.id, newTaskTitle.trim());
    setNewTaskTitle("");
    setShowAddTask(false);
  };

  const formatDueDate = (date: string | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("ja-JP", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className="overflow-hidden">
      {/* Category Header */}
      <div className="p-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 flex-1 min-w-0"
          >
            {isOpen ? (
              <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
            ) : (
              <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
            )}
            <h2 className="font-semibold text-lg truncate">{category.name}</h2>
            <span className="text-sm text-muted-foreground shrink-0">
              {doneCount}/{totalCount}
            </span>
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon" className="shrink-0 h-8 w-8" />}
            >
              <MoreHorizontal className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEditCategory(category)}>
                <Pencil className="w-4 h-4 mr-2" />
                名前を変更
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDeleteCategory(category)}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                削除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Progress value={progressPercent} className="mt-2 h-2" />
      </div>

      {/* Tasks */}
      {isOpen && (
        <div className="border-t">
          {category.tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0 active:bg-muted/50"
            >
              <StatusBadge
                status={task.status}
                onClick={() => onToggleStatus(task)}
              />
              <button
                className={`flex-1 text-left text-sm min-w-0 ${
                  task.status === "done"
                    ? "line-through text-muted-foreground"
                    : ""
                }`}
                onClick={() => onEditTask(task)}
              >
                <span className="block truncate">{task.title}</span>
                <div className="flex items-center gap-2 mt-0.5">
                  {task.dueDate && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDueDate(task.dueDate)}
                    </span>
                  )}
                  {task.link && (
                    <ExternalLink className="w-3 h-3 text-muted-foreground" />
                  )}
                </div>
              </button>
            </div>
          ))}

          {/* Add Task */}
          {showAddTask ? (
            <div className="p-3 flex gap-2">
              <Input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="タスク名を入力..."
                className="text-sm"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddTask();
                  if (e.key === "Escape") {
                    setShowAddTask(false);
                    setNewTaskTitle("");
                  }
                }}
              />
              <Button size="sm" onClick={handleAddTask}>
                追加
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddTask(true)}
              className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground hover:text-foreground w-full"
            >
              <Plus className="w-4 h-4" />
              タスクを追加
            </button>
          )}
        </div>
      )}
    </Card>
  );
}
