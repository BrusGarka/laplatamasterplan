/** Normaliza linhas da tabela Tributos e Folhas (Contajá). */

const HEADERS = [
  "tipoDocumento",
  "competencia",
  "vencimento",
  "valor",
  "status",
  "voceJaPagou",
];

export function cleanTipoDocumento(raw) {
  return raw
    .replace(/\s*Ver mais\s*$/i, "")
    .replace(/\s*\|\s*[^|]+$/g, (m) => (m.includes("Ver mais") ? "" : m))
    .replace(/\s*\.\.\.\s*Ver mais$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseBRL(text) {
  if (!text || text === "-") return null;
  const m = text.replace(/\s/g, "").match(/R\$\s*([\d.,]+)/);
  if (!m) return null;
  const n = Number(m[1].replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export function rowFromCells(cells) {
  const map = Object.fromEntries(HEADERS.map((h, i) => [h, cells[i] ?? ""]));
  const tipoDocumento = cleanTipoDocumento(map.tipoDocumento);
  const valorNumero = parseBRL(map.valor);
  return {
    tipoDocumento,
    competencia: map.competencia,
    vencimento: map.vencimento,
    valor: map.valor,
    valorNumero,
    status: map.status,
    voceJaPagou: map.voceJaPagou === "Sim",
    voceJaPagouLabel: map.voceJaPagou,
    id: `${tipoDocumento}|${map.competencia}|${map.vencimento}`,
  };
}

export function mergeScrapePages(pages) {
  const byPage = [...pages].sort((a, b) => a.page - b.page);
  const seen = new Set();
  const documentos = [];
  for (const p of byPage) {
    if (p.page === 0) continue;
    for (const { cells } of p.rows ?? []) {
      const doc = rowFromCells(cells);
      if (seen.has(doc.id)) continue;
      seen.add(doc.id);
      documentos.push(doc);
    }
  }
  return documentos;
}

export function summarizeByTipo(documentos) {
  const byTipo = {};
  for (const d of documentos) {
    if (!byTipo[d.tipoDocumento]) {
      byTipo[d.tipoDocumento] = { count: 0, totalPago: 0, comValor: 0 };
    }
    byTipo[d.tipoDocumento].count += 1;
    if (d.valorNumero != null) {
      byTipo[d.tipoDocumento].totalPago += d.valorNumero;
      byTipo[d.tipoDocumento].comValor += 1;
    }
  }
  return byTipo;
}

export function toCsv(rows, columns) {
  const esc = (v) => {
    const s = v == null ? "" : String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  const header = columns.join(",");
  const body = rows.map((r) => columns.map((c) => esc(r[c])).join(",")).join("\n");
  return `${header}\n${body}\n`;
}
