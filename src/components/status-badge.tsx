"use client";

import { TaskStatus, STATUS_LABELS } from "@/lib/types";

const statusStyles: Record<TaskStatus, string> = {
  todo: "bg-stone-100 text-stone-500",
  in_progress: "bg-blue-50 text-blue-600",
  done: "bg-emerald-50 text-emerald-600",
};

interface StatusBadgeProps {
  status: TaskStatus;
  onClick?: () => void;
}

export function StatusBadge({ status, onClick }: StatusBadgeProps) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors active:scale-95 ${statusStyles[status]}`}
    >
      {STATUS_LABELS[status]}
    </button>
  );
}
