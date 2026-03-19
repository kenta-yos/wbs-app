"use client";

import { Badge } from "@/components/ui/badge";
import { TaskStatus, STATUS_LABELS } from "@/lib/types";

const statusStyles: Record<TaskStatus, string> = {
  todo: "bg-gray-100 text-gray-700 hover:bg-gray-200",
  in_progress: "bg-blue-100 text-blue-700 hover:bg-blue-200",
  done: "bg-green-100 text-green-700 hover:bg-green-200",
};

interface StatusBadgeProps {
  status: TaskStatus;
  onClick?: () => void;
}

export function StatusBadge({ status, onClick }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={`cursor-pointer border-0 text-xs font-medium ${statusStyles[status]}`}
      onClick={onClick}
    >
      {STATUS_LABELS[status]}
    </Badge>
  );
}
