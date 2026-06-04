/** Normaliza notas fiscais Contajá + projeções de planejamento. */

export function parseBRL(text) {
  if (!text) return null;
  const m = String(text).replace(/\s/g, "").match(/R\$\s*([\d.,]+)/);
  if (!m) return null;
  const n = Number(m[1].replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export function normalizeNfApiDoc(doc) {
  const valorNumero = parseBRL(doc.value);
  return {
    id: `contaja-${doc.id}`,
    contajaId: doc.id,
    origem: "contaja",
    dataEmissao: doc.createdAt ?? null,
    competencia: doc.competency,
    tomador: doc.borrower ?? "",
    servico: doc.service ?? "",
    valor: doc.value ?? "-",
    valorNumero,
    status: doc.nfsDocumentStatus?.description ?? "",
    statusSlug: doc.nfsDocumentStatus?.slug ?? "",
    nfeLinkXml: doc.nfeLinkXml ?? null,
  };
}

/** Projeções jul–dez/2026 (R$ 27 mil/mês). */
export const PROJECOES_NF_2026 = [
  { competencia: "07/2026", servico: "ref a jun/26 (planejado)" },
  { competencia: "08/2026", servico: "ref a jul/26 (planejado)" },
  { competencia: "09/2026", servico: "ref a ago/26 (planejado)" },
  { competencia: "10/2026", servico: "ref a set/26 (planejado)" },
  { competencia: "11/2026", servico: "ref a out/26 (planejado)" },
  { competencia: "12/2026", servico: "ref a nov/26 (planejado)" },
];

export function buildProjecoesNf(tomadorPadrao = "MOB2CON SOLUCOES TECNOLOGICAS S.A") {
  const valor = 27_000;
  return PROJECOES_NF_2026.map(({ competencia, servico }) => ({
    id: `planejamento-${competencia.replace("/", "-")}`,
    contajaId: null,
    origem: "planejamento",
    dataEmissao: null,
    competencia,
    tomador: tomadorPadrao,
    servico,
    valor: valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
    valorNumero: valor,
    status: "Planejada",
    statusSlug: "planned",
    nfeLinkXml: null,
    observacao: "Projeção cadastrada no La Plata — jul a dez/2026, R$ 27.000/mês",
  }));
}

export function mergeNotasFiscais(apiDocs, { incluirProjecoes = true } = {}) {
  const contaja = apiDocs.map(normalizeNfApiDoc);
  const tomador = contaja[0]?.tomador ?? "MOB2CON SOLUCOES TECNOLOGICAS S.A";
  const projecoes = incluirProjecoes ? buildProjecoesNf(tomador) : [];
  const competenciasContaja = new Set(contaja.map((n) => n.competencia));
  const projFiltradas = projecoes.filter((p) => !competenciasContaja.has(p.competencia));
  return [...contaja, ...projFiltradas];
}

export function toCsv(rows, columns) {
  const esc = (v) => {
    const s = v == null ? "" : String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  return `${columns.join(",")}\n${rows.map((r) => columns.map((c) => esc(r[c])).join(",")).join("\n")}\n`;
}
