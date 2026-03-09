import { useRef, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { TagBadge } from "./TagBadge";
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
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const handleFocus = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setOpen(true);
  }, []);

  const handleBlur = useCallback(() => {
    // Pequeno delay para permitir que o clique na opção registre antes de fechar
    closeTimeoutRef.current = setTimeout(() => {
      setOpen(false);
      closeTimeoutRef.current = null;
    }, 150);
  }, []);

  const handleOptionMouseDown = useCallback(
    (e: React.MouseEvent, tag: string) => {
      e.preventDefault();
      e.stopPropagation();
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
      handleSelect(tag);
    },
    [handleSelect]
  );

  return (
    <div className="relative">
      <Input
        className={cn("h-8 min-w-[6rem]", className)}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
          if (e.key === "Enter") setOpen(false);
          onKeyDown?.(e);
        }}
        placeholder={placeholder}
      />
      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-1 w-full min-w-[8rem] max-h-[200px] overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
          onMouseDown={(e) => e.preventDefault()}
        >
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              Nenhuma tag. Digite para criar.
            </div>
          ) : (
            filtered.slice(0, 10).map((tag) => (
              <button
                key={tag}
                type="button"
                className="w-full px-3 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground rounded-sm cursor-pointer flex items-center"
                onMouseDown={(e) => handleOptionMouseDown(e, tag)}
              >
                <TagBadge tag={tag} className="text-xs py-0" />
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
