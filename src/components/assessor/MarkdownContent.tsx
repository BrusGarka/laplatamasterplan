import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function parseTable(lines: string[], startIndex: number): { html: ReactNode; nextIndex: number } {
  const rows: string[][] = [];
  let i = startIndex;
  while (i < lines.length && lines[i].trim().startsWith("|")) {
    const cells = lines[i]
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim());
    if (!cells.every((c) => /^[-:]+$/.test(c))) {
      rows.push(cells);
    }
    i++;
  }

  if (rows.length === 0) {
    return { html: null, nextIndex: startIndex };
  }

  const [header, ...body] = rows;
  const table = (
    <div className="my-4 overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/40">
            {header.map((cell, ci) => (
              <th key={ci} className="px-3 py-2 text-left font-medium">
                {renderInline(cell)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, ri) => (
            <tr key={ri} className="border-b last:border-0">
              {row.map((cell, ci) => (
                <td key={ci} className="px-3 py-2">
                  {renderInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return { html: table, nextIndex: i };
}

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  const lines = content.trim().split("\n");
  const elements: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === "") {
      i++;
      continue;
    }

    if (trimmed.startsWith("|")) {
      const { html, nextIndex } = parseTable(lines, i);
      if (html) {
        elements.push(<div key={key++}>{html}</div>);
        i = nextIndex;
        continue;
      }
    }

    if (trimmed.startsWith("### ")) {
      elements.push(
        <h3 key={key++} className="mt-6 mb-2 text-base font-semibold">
          {renderInline(trimmed.slice(4))}
        </h3>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith("## ")) {
      elements.push(
        <h2 key={key++} className="mt-8 mb-3 text-lg font-semibold border-b pb-2">
          {renderInline(trimmed.slice(3))}
        </h2>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith("# ")) {
      elements.push(
        <h1 key={key++} className="mb-4 text-xl font-bold">
          {renderInline(trimmed.slice(2))}
        </h1>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith("> ")) {
      elements.push(
        <blockquote
          key={key++}
          className="my-4 border-l-4 border-primary/40 bg-muted/30 px-4 py-3 text-sm italic text-muted-foreground"
        >
          {renderInline(trimmed.slice(2))}
        </blockquote>
      );
      i++;
      continue;
    }

    if (trimmed === "---") {
      elements.push(<hr key={key++} className="my-6 border-border" />);
      i++;
      continue;
    }

    elements.push(
      <p key={key++} className="mb-3 text-sm leading-relaxed text-muted-foreground">
        {renderInline(trimmed)}
      </p>
    );
    i++;
  }

  return <div className={cn("max-w-none", className)}>{elements}</div>;
}
