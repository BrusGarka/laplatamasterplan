/**
 * Retorna classes CSS para badge de tag com cor consistente por nome.
 * Mesma tag sempre recebe a mesma cor.
 */

const TAG_PALETTE = [
  "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30",
  "bg-violet-500/20 text-violet-700 dark:text-violet-300 border-violet-500/30",
  "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30",
  "bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30",
  "bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/30",
  "bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
  "bg-lime-500/20 text-lime-700 dark:text-lime-300 border-lime-500/30",
  "bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30",
  "bg-fuchsia-500/20 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-500/30",
] as const;

function hashTag(tag: string): number {
  let h = 0;
  const s = tag.toLowerCase().trim();
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function getTagBadgeClasses(tag: string): string {
  if (!tag?.trim()) return "";
  return TAG_PALETTE[hashTag(tag) % TAG_PALETTE.length];
}
