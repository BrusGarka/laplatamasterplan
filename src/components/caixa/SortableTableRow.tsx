import {
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

interface SortableTableRowProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function SortableTableRow({ id, children, className }: SortableTableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  const style = {
    ...(transform && { transform: CSS.Transform.toString(transform) }),
    ...(transition && { transition }),
  };
  return (
    <TableRow
      ref={setNodeRef}
      style={Object.keys(style).length > 0 ? style : undefined}
      className={`${className ?? ""} ${isDragging ? "opacity-50 bg-muted" : ""}`}
    >
      <TableCell
        className="w-10 cursor-grab active:cursor-grabbing touch-none p-2"
        {...attributes}
        {...listeners}
        aria-label="Arrastar para reordenar"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </TableCell>
      {children}
    </TableRow>
  );
}
