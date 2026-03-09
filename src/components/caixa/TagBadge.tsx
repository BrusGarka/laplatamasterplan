import { Badge } from "@/components/ui/badge";
import { getTagBadgeClasses } from "@/lib/tag-colors";
import { cn } from "@/lib/utils";

interface TagBadgeProps {
  tag: string;
  className?: string;
}

export function TagBadge({ tag, className }: TagBadgeProps) {
  if (!tag?.trim()) return <span className="text-muted-foreground">—</span>;
  return (
    <Badge
      variant="outline"
      className={cn("font-normal", getTagBadgeClasses(tag), className)}
    >
      {tag}
    </Badge>
  );
}
