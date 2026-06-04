/**
 * Converte linhas [role=row] da visão XLS/XPerformance (XP) em snapshot estruturado.
 */

import { parseBRL, assetKey } from "./xp-parse.mjs";

const ASSET_RE = /^(NTN-B|CDB |CRA |DEB |CRI )/;
const FUND_RE = /FIC|FIRF|Referenciado|Occam|SVN/i;
const isGrupo = (s) => /^\d+[,.]?\d*%?\s*\|/.test(s) || /^\d+%\s*\|/.test(s);
const isBRL = (s) => /^-?R\$\s*[\d.]+,\d{2}$/.test((s || "").replace(/\u00a0/g, " "));
const isPct = (s) => /^\d+,\d{2}%$/.test(s);
const isDate = (s) => /^\d{2}\/\d{2}\/\d{4}$/.test(s);
const isTaxa = (s) => /^(IPC-A|CDI|\+|DOLAR|97)/i.test(s || "");

const MP_LABELS = ["Valor Líquido", "Rendimento Bruto", "Rendimento Líquido", "Garantia", "Quantidade"];
const CAR_LABELS = ["Liquidez", "Juros", "Amortização", "Ticker/Código", "Rating", "Taxa de compra"];
const FUND_MP_LABELS = ["Em cotização", "Rendimento bruto", "Rendimento líquido", "IR", "IOF"];
const FUND_CAR_LABELS = [
  "Rent. 12 meses",
  "Rent. mês",
  "Tempo resgate (Cotização)",
  "Tempo resgate (Liquidação)",
  "Taxa administração",
];

function sliceBetween(lines, startLabel, endLabels) {
  const start = lines.indexOf(startLabel);
  if (start < 0) return [];
  let end = lines.length;
  for (const e of endLabels) {
    const i = lines.indexOf(e, start + 1);
    if (i >= 0 && i < end) end = i;
  }
  return lines.slice(start + 1, end).filter((x) => x !== "Ver mais detalhes");
}

function mapLabels(labels, values) {
  const o = {};
  labels.forEach((l, i) => {
    if (values[i] !== undefined) o[l] = values[i];
  });
  return o;
}

function parseSummaryLine(lines) {
  if (!ASSET_RE.test(lines[0]) && !FUND_RE.test(lines[0])) return null;
  const nome = lines[0];
  const isFund = FUND_RE.test(nome);
  const brls = lines.filter(isBRL);
  const pcts = lines.filter(isPct);
  const taxas = lines.filter(isTaxa);
  const dates = lines.filter(isDate);

  if (isFund) {
    return {
      nome,
      tipo: "fundo",
      posicaoAtual: brls[0],
      alocacaoPct: pcts[0],
      rentabilidadeLiquida: pcts[1],
      rentabilidadeBruta: pcts[2],
      valorAplicado: brls[1],
      valorLiquido: brls[2],
    };
  }

  return {
    nome,
    tipo: "rendaFixa",
    posicaoAtual: brls[0],
    alocacaoPct: pcts[0],
    valorAplicado: brls[1],
    taxaCompra: taxas[0] || lines.find((f) => /%/.test(f)),
    dataAplicacao: dates[0],
    dataVencimento: dates[1],
  };
}

function parseCollapse(lines) {
  const mpVals = sliceBetween(lines, "Minha Posição", ["Características", "Eventos", "Evolução do ativo"]).filter(
    (x) => !MP_LABELS.includes(x) && !FUND_MP_LABELS.includes(x)
  );
  const carVals = sliceBetween(lines, "Características", ["Eventos", "Evolução do ativo"]).filter(
    (x) => !CAR_LABELS.includes(x) && !FUND_CAR_LABELS.includes(x)
  );

  const hasFundMp = lines.includes("Em cotização");
  const minhaPosicao = mapLabels(hasFundMp ? FUND_MP_LABELS : MP_LABELS, mpVals);
  const caracteristicas = mapLabels(hasFundMp ? FUND_CAR_LABELS : CAR_LABELS, carVals);

  let eventos = [];
  if (lines.includes("Eventos")) {
    const evLines = sliceBetween(lines, "Eventos", ["Evolução do ativo"]).filter(
      (x) => !["Ver todos proventos", "Data", "Juros", "Amortização", "Prêmio"].includes(x)
    );
    for (let i = 0; i < evLines.length; i += 5) {
      if (isDate(evLines[i])) {
        eventos.push({
          data: evLines[i],
          juros: evLines[i + 1],
          amortizacao: evLines[i + 2],
          premio: evLines[i + 3],
        });
      }
    }
  }

  return { minhaPosicao, caracteristicas, eventos: eventos.length ? eventos : undefined };
}

export function parseRoleRows(rows, meta = {}) {
  let grupo = null;
  const ativos = [];
  const fundos = [];
  const xlsGrid = [];

  for (const line of rows) {
    if (isGrupo(line[0])) {
      grupo = line[0];
      xlsGrid.push({ tipo: "grupo", grupo, cells: line });
      continue;
    }

    const summaryEnd = line.indexOf("Renda Fixa") >= 0 ? line.indexOf("Renda Fixa") : line.indexOf("Fundos de Investimentos");
    const summaryPart = summaryEnd > 0 ? line.slice(0, summaryEnd) : line.slice(0, 8);
    const summary = parseSummaryLine(summaryPart);

    if (summary) {
      const collapse = summaryEnd > 0 ? parseCollapse(line.slice(summaryEnd)) : {};
      const entry = { grupo, ...summary, ...collapse, _rowCells: summaryPart };

      if (summary.tipo === "fundo") {
        fundos.push(entry);
      } else {
        ativos.push(entry);
      }

      xlsGrid.push({ tipo: summary.tipo, grupo, nome: summary.nome, summary: summaryPart, collapse });
    }
  }

  const byKey = new Map();
  for (const a of ativos) {
    const key = assetKey({
      nome: a.nome,
      dataVencimento: a.dataVencimento,
      valorAplicado: a.valorAplicado,
    });
    const prev = byKey.get(key);
    if (!prev) {
      byKey.set(key, a);
      continue;
    }
    const prevHas = !!prev.minhaPosicao?.["Valor Líquido"];
    const nextHas = !!a.minhaPosicao?.["Valor Líquido"];
    if (!prevHas && nextHas) byKey.set(key, { ...prev, ...a });
    else if (prevHas && !nextHas) byKey.set(key, { ...a, ...prev });
    else byKey.set(key, { ...prev, ...a });
  }
  const deduped = [...byKey.values()];

  const fundosSeen = new Set();
  const fundosDedup = fundos.filter((f) => {
    if (fundosSeen.has(f.nome)) return false;
    fundosSeen.add(f.nome);
    return true;
  });

  const totalRF = deduped.reduce((s, a) => s + parseBRL(a.posicaoAtual), 0);
  const totalFI = fundosDedup.reduce((s, f) => s + parseBRL(f.posicaoAtual), 0);

  return {
    manifest: {
      scrapedAt: meta.scrapedAt || new Date().toISOString(),
      source: meta.source || "browser-xls-rows",
      url: meta.url || "https://experiencia.xpi.com.br/conta/#/carteira",
      notas: [
        "Dados mesclados: grade XLS (lista) + collapses expandidos na mesma [role=row].",
        "Arquivo xls-grid.json = exportação estruturada da grade; use Exportar na XP para .xlsx bruto.",
      ],
      totais: {
        rendaFixaCalculado: totalRF,
        fundosCalculado: totalFI,
        patrimonioCalculado: totalRF + totalFI,
      },
    },
    xls: { grid: xlsGrid, rawRowCount: rows.length },
    rendaFixa: {
      saldo: meta.saldoRF,
      ativos: deduped,
    },
    fundos: {
      saldo: meta.saldoFI,
      itens: fundosDedup,
    },
  };
}
