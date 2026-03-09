import { useState, useCallback } from "react";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TagComboboxProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  className?: string;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
}

export function TagCombobox({
  value,
  onChange,
  suggestions,
  placeholder = "Tag",
  className,
  onKeyDown,
}: TagComboboxProps) {
  const [open, setOpen] = useState(false);

  const filtered = value.trim()
    ? suggestions.filter((s) =>
        s.toLowerCase().includes(value.trim().toLowerCase())
      )
    : suggestions;

  const handleSelect = useCallback(
    (selected: string) => {
      onChange(selected);
      setOpen(false);
    },
    [onChange]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <Input
          className={cn("h-8 min-w-[6rem]", className)}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
            if (e.key === "Enter") setOpen(false);
            onKeyDown?.(e);
          }}
          placeholder={placeholder}
        />
      </PopoverAnchor>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="max-h-[200px] overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              Nenhuma tag. Digite para criar.
            </div>
          ) : (
            filtered.slice(0, 10).map((tag) => (
              <button
                key={tag}
                type="button"
                className="w-full px-3 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground rounded-sm cursor-pointer"
                onClick={() => handleSelect(tag)}
              >
                {tag}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
