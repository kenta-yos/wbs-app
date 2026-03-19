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
  AlertTriangle,
  GripVertical,
} from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/status-badge";
import { Category, Task } from "@/lib/types";

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
  const allDone =
    category.tasks.length > 0 &&
    category.tasks.every((t) => t.status === "done");
  const [isOpen, setIsOpen] = useState(false);
  const [showDone, setShowDone] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [showAddTask, setShowAddTask] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
  };

  const doneCount = category.tasks.filter((t) => t.status === "done").length;
  const totalCount = category.tasks.length;
  const progressPercent =
    totalCount > 0 ? (doneCount / totalCount) * 100 : 0;

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    onAddTask(category.id, newTaskTitle.trim());
    setNewTaskTitle("");
    setShowAddTask(false);
  };

  const getDueStatus = (task: Task): "overdue" | "soon" | "normal" => {
    if (!task.dueDate || task.status === "done") return "normal";
    const due = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (due < today) return "overdue";
    const diffDays =
      (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays <= 3) return "soon";
    return "normal";
  };

  const formatDueDate = (date: string | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("ja-JP", {
      month: "short",
      day: "numeric",
    });
  };

  const activeTasks = category.tasks.filter((t) => t.status !== "done");
  const doneTasks = category.tasks.filter((t) => t.status === "done");

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-xl ${allDone ? "opacity-50" : ""}`}
    >
      {/* Category Header */}
      <div className="flex items-center gap-1 px-2 py-3">
        <button
          className="touch-none cursor-grab active:cursor-grabbing shrink-0 text-stone-300 p-1"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 flex-1 min-w-0"
        >
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
          )}
          <span
            className={`font-semibold text-sm truncate ${allDone ? "line-through text-stone-400" : "text-stone-800"}`}
          >
            {category.name}
          </span>
        </button>
        <span className="text-xs text-stone-400 shrink-0 tabular-nums">
          {allDone ? "完了" : `${doneCount}/${totalCount}`}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 h-7 w-7 text-stone-400"
              />
            }
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

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="mx-3 h-1 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-400 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Next deadline preview (when closed) */}
      {!isOpen && !allDone && (() => {
        const upcoming = activeTasks
          .filter((t) => t.dueDate)
          .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())[0];
        if (!upcoming) return null;
        const dueStatus = getDueStatus(upcoming);
        return (
          <div className="px-4 pb-2.5 flex items-center gap-2">
            <Calendar className={`w-3 h-3 shrink-0 ${
              dueStatus === "overdue" ? "text-red-500" : dueStatus === "soon" ? "text-amber-500" : "text-stone-400"
            }`} />
            <span className={`text-[11px] truncate ${
              dueStatus === "overdue" ? "text-red-500 font-medium" : dueStatus === "soon" ? "text-amber-500 font-medium" : "text-stone-400"
            }`}>
              {formatDueDate(upcoming.dueDate)} {upcoming.title}
              {dueStatus === "overdue" && " - 期限切れ"}
              {dueStatus === "soon" && " - まもなく"}
            </span>
          </div>
        );
      })()}

      {/* Tasks */}
      {isOpen && (
        <div className="mt-1">
          {/* Active tasks */}
          {activeTasks.map((task) => {
            const dueStatus = getDueStatus(task);
            return (
              <div
                key={task.id}
                className={`flex items-center gap-3 px-4 py-2.5 mx-1 rounded-lg active:bg-stone-50 ${
                  dueStatus === "overdue"
                    ? "bg-red-50/80"
                    : dueStatus === "soon"
                      ? "bg-amber-50/80"
                      : ""
                }`}
              >
                <StatusBadge
                  status={task.status}
                  onClick={() => onToggleStatus(task)}
                />
                <button
                  className="flex-1 text-left text-sm min-w-0"
                  onClick={() => onEditTask(task)}
                >
                  <span className="block truncate text-stone-700">
                    {task.title}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    {task.dueDate && (
                      <span
                        className={`text-[11px] flex items-center gap-1 ${
                          dueStatus === "overdue"
                            ? "text-red-500 font-medium"
                            : dueStatus === "soon"
                              ? "text-amber-500 font-medium"
                              : "text-stone-400"
                        }`}
                      >
                        {dueStatus === "overdue" ? (
                          <AlertTriangle className="w-3 h-3" />
                        ) : (
                          <Calendar className="w-3 h-3" />
                        )}
                        {formatDueDate(task.dueDate)}
                        {dueStatus === "overdue" && " 期限切れ"}
                        {dueStatus === "soon" && " まもなく"}
                      </span>
                    )}
                    {task.link && (
                      <ExternalLink className="w-3 h-3 text-stone-400" />
                    )}
                  </div>
                </button>
              </div>
            );
          })}

          {/* Done tasks collapsed */}
          {doneCount > 0 && (
            <div className="mx-1">
              <button
                onClick={() => setShowDone(!showDone)}
                className="flex items-center gap-1.5 px-4 py-2 text-[11px] text-stone-400 hover:text-stone-600 w-full"
              >
                {showDone ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
                完了済み {doneCount}件
              </button>
              {showDone &&
                doneTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 px-4 py-1.5 rounded-lg active:bg-stone-50"
                  >
                    <StatusBadge
                      status={task.status}
                      onClick={() => onToggleStatus(task)}
                    />
                    <button
                      className="flex-1 text-left text-xs min-w-0 line-through text-stone-400"
                      onClick={() => onEditTask(task)}
                    >
                      <span className="block truncate">{task.title}</span>
                    </button>
                  </div>
                ))}
            </div>
          )}

          {/* Add Task */}
          {showAddTask ? (
            <div className="px-4 py-2 flex gap-2">
              <Input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="タスク名を入力..."
                className="text-sm h-9"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddTask();
                  if (e.key === "Escape") {
                    setShowAddTask(false);
                    setNewTaskTitle("");
                  }
                }}
              />
              <Button size="sm" onClick={handleAddTask} className="h-9">
                追加
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddTask(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-stone-400 hover:text-stone-600 w-full"
            >
              <Plus className="w-4 h-4" />
              タスクを追加
            </button>
          )}
        </div>
      )}
    </div>
  );
}
