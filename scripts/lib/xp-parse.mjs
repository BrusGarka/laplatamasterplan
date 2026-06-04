/**
 * Parsers e normalizadores para dados da carteira XP.
 */

export function parseBRL(str) {
  if (!str || !String(str).trim()) return 0;
  const raw = String(str).trim().replace(/\u00a0/g, " ");
  const neg = /^-/.test(raw) || /-\s*R\$/i.test(raw);
  const s = raw
    .replace(/^-?\s*R\$\s*/gi, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const n = parseFloat(s);
  const val = Number.isNaN(n) ? 0 : Math.abs(n);
  return neg ? -val : val;
}

export function parsePct(str) {
  if (!str) return 0;
  const m = String(str).match(/([\d,]+)/);
  return m ? parseFloat(m[1].replace(",", ".")) : 0;
}

export function inferTipo(nome) {
  const n = (nome || "").toUpperCase();
  if (n.startsWith("NTN")) return "Tesouro";
  if (n.startsWith("CDB")) return "CDB";
  if (n.startsWith("CRA")) return "CRA";
  if (n.startsWith("CRI")) return "CRI";
  if (n.startsWith("DEB")) return "DEB";
  if (n.startsWith("LCI")) return "LCI";
  if (n.startsWith("LCA")) return "LCA";
  return "Renda Fixa";
}

export function normalizeTaxa(taxa) {
  if (!taxa) return "";
  let t = String(taxa).trim();
  if (/^\+/.test(t)) t = `Pré ${t.replace(/^\+/, "")}`;
  t = t.replace(/IPC-A/gi, "IPCA");
  t = t.replace(/DOLAR PTAX/gi, "PTAX");
  return t;
}

export function riscoFromNumero(n) {
  if (n <= 14) return "Baixo";
  if (n <= 25) return "Médio";
  return "Alto";
}

export function assetKey(ativo) {
  return `${ativo.nome}|${ativo.dataVencimento}|${ativo.valorAplicado}`;
}

export function dedupeRendaFixa(assets) {
  const seen = new Set();
  return assets.filter((a) => {
    if (!a.posicaoAtual) return false;
    const key = assetKey(a);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function toCsv(rows, columns) {
  const esc = (v) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = columns.map((c) => esc(c)).join(",");
  const body = rows.map((row) => columns.map((col) => esc(row[col])).join(",")).join("\n");
  return `${header}\n${body}\n`;
}
