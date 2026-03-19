"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CategorySection } from "@/components/category-section";
import { TaskEditDialog } from "@/components/task-edit-dialog";
import { Category, Task, STATUS_CYCLE } from "@/lib/types";
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

  // Overall progress
  const allTasks = categories.flatMap((c) => c.tasks);
  const doneTotal = allTasks.filter((t) => t.status === "done").length;
  const overallPercent =
    allTasks.length > 0 ? (doneTotal / allTasks.length) * 100 : 0;

  // Category CRUD
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

  // Task CRUD
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
    <div className="max-w-lg mx-auto px-4 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur py-4 border-b mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            <h1 className="font-bold text-lg">読書事業WBS</h1>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setCategoryName("");
              setShowCategoryDialog(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1" />
            カテゴリ
          </Button>
        </div>
        {/* Overall Progress */}
        {allTasks.length > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>全体進捗</span>
              <span>
                {doneTotal}/{allTasks.length} ({Math.round(overallPercent)}%)
              </span>
            </div>
            <Progress value={overallPercent} className="h-2" />
          </div>
        )}
      </header>

      {/* Categories */}
      <div className="space-y-4">
        {categories.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>カテゴリを追加して始めましょう</p>
          </div>
        ) : (
          categories.map((category) => (
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
          ))
        )}
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
