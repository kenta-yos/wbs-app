"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, BookOpen } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CategorySection } from "@/components/category-section";
import { TaskEditDialog } from "@/components/task-edit-dialog";
import { Category, Task, TaskStatus, STATUS_CYCLE } from "@/lib/types";
import * as api from "@/lib/api";

export function WbsApp() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");

  const reload = useCallback(async () => {
    const data = await api.fetchCategories();
    setCategories(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(categories, oldIndex, newIndex);
    setCategories(reordered);
    await api.reorderCategories(reordered.map((c) => c.id));
  };

  const today = new Date().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  const allTasks = categories.flatMap((c) => c.tasks);
  const doneTotal = allTasks.filter((t) => t.status === "done").length;

  const handleAddCategory = async () => {
    if (!categoryName.trim()) return;
    await api.createCategory(categoryName.trim(), categories.length);
    setCategoryName("");
    setShowCategoryDialog(false);
    reload();
  };

  const handleEditCategory = async () => {
    if (!editingCategory || !categoryName.trim()) return;
    await api.updateCategory(editingCategory.id, categoryName.trim());
    setEditingCategory(null);
    setCategoryName("");
    reload();
  };

  const handleDeleteCategory = async (category: Category) => {
    if (!confirm(`「${category.name}」を削除しますか？中のタスクもすべて削除されます。`))
      return;
    await api.deleteCategory(category.id);
    reload();
  };

  const handleAddTask = async (categoryId: number, title: string) => {
    const cat = categories.find((c) => c.id === categoryId);
    await api.createTask(categoryId, title, cat?.tasks.length ?? 0);
    reload();
  };

  const handleToggleStatus = async (task: Task) => {
    const currentIdx = STATUS_CYCLE.indexOf(task.status);
    const nextStatus = STATUS_CYCLE[(currentIdx + 1) % STATUS_CYCLE.length];
    await api.updateTask(task.id, { status: nextStatus });
    reload();
  };

  const handleSaveTask = async (data: {
    title: string;
    status: TaskStatus;
    memo: string | null;
    link: string | null;
    dueDate: string | null;
  }) => {
    if (!editingTask) return;
    await api.updateTask(editingTask.id, data);
    setEditingTask(null);
    reload();
  };

  const handleDeleteTask = async () => {
    if (!editingTask) return;
    await api.deleteTask(editingTask.id);
    setEditingTask(null);
    reload();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white pt-[max(3.5rem,calc(env(safe-area-inset-top)+1rem))] pb-4 px-5 mb-2">
        <div className="max-w-lg mx-auto">
          <p className="text-xs text-stone-400 mb-1">{today}</p>
          <div className="flex items-center justify-between">
            <h1 className="font-bold text-xl tracking-tight">読書事業WBS</h1>
            <button
              onClick={() => {
                setCategoryName("");
                setShowCategoryDialog(true);
              }}
              className="flex items-center gap-1 text-sm font-medium text-stone-500 active:text-stone-800"
            >
              <Plus className="w-4 h-4" />
              追加
            </button>
          </div>
          {allTasks.length > 0 && (
            <p className="text-xs text-stone-400 mt-1">
              {doneTotal}/{allTasks.length} 完了
            </p>
          )}
        </div>
      </header>

      {/* Categories */}
      <div className="max-w-lg mx-auto px-4 pb-[max(6rem,calc(1.5rem+env(safe-area-inset-bottom)))]">
        <div className="space-y-3">
          {categories.length === 0 ? (
            <div className="text-center py-16 text-stone-400">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">カテゴリを追加して始めましょう</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={categories.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                {categories.map((category) => (
                  <CategorySection
                    key={category.id}
                    category={category}
                    onAddTask={handleAddTask}
                    onToggleStatus={handleToggleStatus}
                    onEditTask={setEditingTask}
                    onEditCategory={(cat) => {
                      setEditingCategory(cat);
                      setCategoryName(cat.name);
                    }}
                    onDeleteCategory={handleDeleteCategory}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>

      {/* Add Category Dialog */}
      <Dialog
        open={showCategoryDialog}
        onOpenChange={(v) => !v && setShowCategoryDialog(false)}
      >
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>カテゴリを追加</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="例: パサージュ棚主"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
            />
            <Button onClick={handleAddCategory} className="w-full">
              追加
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog
        open={!!editingCategory}
        onOpenChange={(v) => !v && setEditingCategory(null)}
      >
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>カテゴリ名を変更</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleEditCategory()}
            />
            <Button onClick={handleEditCategory} className="w-full">
              保存
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <TaskEditDialog
        task={editingTask}
        open={!!editingTask}
        onClose={() => setEditingTask(null)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />
    </div>
  );
}
