import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBRL(value: number, options?: { compact?: boolean }): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: options?.compact ? 0 : 2,
    maximumFractionDigits: options?.compact ? 0 : 2,
    useGrouping: true,
  });
}

/** Formata número para exibição em input (sem símbolo R$). Ex: 1234.56 → "1.234,56" */
export function formatBRLForInput(value: number): string {
  if (value === 0) return "";
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  });
}

/** Converte string em formato BR (1.234,56) para número */
export function parseBRL(value: string): number {
  if (!value || value.trim() === "" || value === "-") return 0;
  const trimmed = value.trim();
  const neg = trimmed.startsWith("-");
  const s = trimmed.replace(/^-/, "");
  const parts = s.split(",");
  const intPart = (parts[0] ?? "").replace(/\./g, "");
  const decPart = parts[1] ?? "00";
  const combined = intPart + "." + decPart;
  const n = parseFloat(combined);
  const result = Number.isNaN(n) ? 0 : n;
  return neg ? -result : result;
}

/**
 * Avalia expressão tipo planilha no input de valor.
 * Ex: "50,00+40" → 90 | "100-20" → 80 | "-50+10" → -40
 */
export function parseBRLExpression(value: string): number {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "-") return 0;
  const parts = trimmed.split(/(\+|-)/);
  let result = parseBRL(parts[0] ?? "0");
  for (let i = 1; i < parts.length; i += 2) {
    const op = parts[i];
    const num = parseBRL(parts[i + 1] ?? "0");
    if (op === "+") result += num;
    else if (op === "-") result -= num;
  }
  return result;
}
