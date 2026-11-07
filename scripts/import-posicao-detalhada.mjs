/**
 * Atualiza src/data/investimentos-data.ts a partir do XLS "Posição detalhada" da XP.
 * Mantém taxa de compra, eventos e risco dos papéis que já existiam.
 *
 * Uso: node scripts/import-posicao-detalhada.mjs "C:/Users/brusg/Downloads/PosicaoDetalhada.xlsx"
 */

import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { parseXlsFile } from "./lib/xp-parse-xls.mjs";
import { inferTipo, normalizeTaxa, parseBRL } from "./lib/xp-parse.mjs";
import { ativosRendaFixa, fundos } from "../src/data/investimentos-data.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../src/data/investimentos-data.ts");

function round2(n) {
  return Math.round(n * 100) / 100;
}

function brl(n) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function cell(row, i) {
  return row[i] ?? "";
}

function isBlank(row) {
  return row.every((c) => String(c).trim() === "");
}

function parseSheet(rows) {
  const rf = [];
  const fi = [];
  let modo = null;
  let grupo = "";

  for (const row of rows) {
    if (isBlank(row)) continue;

    const c0 = String(cell(row, 0)).trim();
    const c1 = String(cell(row, 1)).trim();

    if (c1 === "Saldo a mercado") {
      modo = "rf";
      grupo = c0;
      continue;
    }
    if (String(cell(row, 3)).trim() === "Saldo" && c0.includes("Pós-Fixado")) {
      modo = "fundo";
      grupo = c0;
      continue;
    }
    if (c0 === "Fundos de Investimentos" || c0 === "Renda Fixa") continue;
    if (c0.startsWith("Lucas Maia") || c0 === "Total investido") continue;

    if (modo === "rf" && c0 && !c0.includes("%")) {
      const valorAplicado = parseBRL(cell(row, 3));
      const valorAplicadoOriginal = parseBRL(cell(row, 4));
      const posicaoAtual = parseBRL(cell(row, 12));
      const valorMercado = parseBRL(cell(row, 1));
      rf.push({
        nome: c0,
        grupo,
        alocacaoPct: String(cell(row, 2)).trim(),
        valorAplicado,
        valorAplicadoOriginal,
        rentabilidadeMercado: String(cell(row, 5)).trim(),
        dataAplicacao: String(cell(row, 6)).trim(),
        vencimento: String(cell(row, 7)).trim(),
        quantidade: String(cell(row, 8)).trim(),
        precoUnitario: parseBRL(cell(row, 9)),
        ir: parseBRL(cell(row, 10)),
        iof: parseBRL(cell(row, 11)),
        posicaoAtual,
        valorMercado,
        rendimento: round2(posicaoAtual - valorAplicado),
      });
    }

    if (modo === "fundo" && c0 && !c0.includes("%")) {
      const saldo = parseBRL(cell(row, 3));
      const aplicado = parseBRL(cell(row, 5));
      const liquido = parseBRL(cell(row, 6));
      fi.push({
        nome: c0,
        grupo,
        alocacaoPct: String(cell(row, 4)).trim(),
        aplicado,
        saldo,
        liquido,
      });
    }
  }

  return { rf, fi };
}

function keyOf(nome, vencimento) {
  return `${String(nome).replace(" (JBS)", "")}|${vencimento ?? ""}`;
}

const filePath = process.argv[2];
if (!filePath) {
  console.error("Informe o caminho do xlsx");
  process.exit(1);
}

const parsed = await parseXlsFile(filePath);
const rows = parsed.sheets["Sua carteira"];
const { rf, fi } = parseSheet(rows);

const oldRf = new Map(ativosRendaFixa.map((a) => [keyOf(a.nome, a.vencimento), a]));
const oldFi = new Map(fundos.map((f) => [f.nome, f]));

const ativos = rf.map((a) => {
  const prev = oldRf.get(keyOf(a.nome, a.vencimento));
  const taxaMercado = normalizeTaxa(a.rentabilidadeMercado);
  const taxa = prev?.taxa || taxaMercado;
  const caracteristicas = {
    ...(prev?.caracteristicas ?? {}),
    Liquidez: a.vencimento,
    "Taxa de compra": prev?.taxaCompra || prev?.caracteristicas?.["Taxa de compra"] || taxa,
    "Rentabilidade a mercado": taxaMercado,
    "Valor aplicado original": brl(a.valorAplicadoOriginal),
    "Preço unitário": brl(a.precoUnitario),
  };
  return {
    nome: a.nome,
    tipo: prev?.tipo || inferTipo(a.nome),
    taxa,
    vencimento: a.vencimento,
    valorAplicado: a.valorAplicado,
    posicaoAtual: a.posicaoAtual,
    rendimento: a.rendimento,
    risco: prev?.risco || "Médio",
    riscoNumero: prev?.riscoNumero || 20,
    valorMercado: a.valorMercado,
    grupo: a.grupo,
    alocacaoPct: a.alocacaoPct,
    posicaoTaxaCompra: brl(a.valorMercado),
    taxaCompra: prev?.taxaCompra || prev?.taxa || taxa,
    dataAplicacao: a.dataAplicacao,
    minhaPosicao: {
      "Valor Líquido": brl(a.posicaoAtual),
      "Saldo a mercado": brl(a.valorMercado),
      IR: brl(a.ir),
      IOF: brl(a.iof),
      Quantidade: a.quantidade,
    },
    caracteristicas,
    ...(prev?.eventos ? { eventos: prev.eventos } : {}),
  };
});

const fundosOut = fi.map((f) => {
  const prev = oldFi.get(f.nome);
  const caracteristicas = { ...(prev?.caracteristicas ?? {}) };
  delete caracteristicas["Rent. 12 meses"];
  delete caracteristicas["Rent. mês"];
  const di = /referenciado di/i.test(f.nome);
  return {
    nome: f.nome,
    aplicado: f.aplicado,
    atual: f.liquido,
    liquidez: prev?.liquidez || (di ? "D+0" : "—"),
    risco: prev?.risco ?? 10,
    grupo: f.grupo,
    alocacaoPct: f.alocacaoPct,
    posicaoTaxaCompra: brl(f.saldo),
    ...(prev?.rentabilidadeLiquida ? {} : {}),
    valorLiquido: f.liquido,
    minhaPosicao: {
      "Valor líquido": brl(f.liquido),
      Saldo: brl(f.saldo),
    },
    ...(Object.keys(caracteristicas).length ? { caracteristicas } : {}),
  };
});

const removedRf = ativosRendaFixa
  .filter((a) => !rf.some((n) => keyOf(n.nome, n.vencimento) === keyOf(a.nome, a.vencimento)))
  .map((a) => a.nome);
const addedRf = ativos.filter((a) => !oldRf.has(keyOf(a.nome, a.vencimento))).map((a) => a.nome);
const removedFi = fundos.filter((f) => !fi.some((n) => n.nome === f.nome)).map((f) => f.nome);
const addedFi = fundosOut.filter((f) => !oldFi.has(f.nome)).map((f) => f.nome);

const cabecalho = String(rows[0].find((c) => String(c).includes("Conta:")) || "").trim();
const quando = cabecalho.match(/\d{2}\/\d{2}\/\d{4}/)?.[0] ?? cabecalho;
const conta = cabecalho.match(/Conta:\s*(\d+)/)?.[1] ?? "";
const patrimonio = String(rows[3][0] || "").trim();

const ts = `/**
 * Dados de investimentos (renda fixa + fundos) – fonte única para Investimentos e Ativos.
 * Atualizado pela posição detalhada XP em ${quando} (conta ${conta}). Patrimônio ${patrimonio}.
 */

export interface EventoRF {
  data: string;
  juros: string;
  amortizacao: string;
  premio: string;
}

export interface AtivoRendaFixa {
  nome: string;
  tipo: string;
  taxa: string;
  vencimento: string;
  valorAplicado: number;
  posicaoAtual: number;
  rendimento: number;
  risco: string;
  riscoNumero: number;
  valorMercado?: number;
  grupo?: string;
  alocacaoPct?: string;
  posicaoTaxaCompra?: string;
  taxaCompra?: string;
  dataAplicacao?: string;
  minhaPosicao?: Record<string, string>;
  caracteristicas?: Record<string, string>;
  eventos?: EventoRF[];
}

export interface Fundo {
  nome: string;
  aplicado: number;
  atual: number;
  liquidez: string;
  risco: number;
  grupo?: string;
  alocacaoPct?: string;
  posicaoTaxaCompra?: string;
  rentabilidadeLiquida?: string;
  rentabilidadeBruta?: string;
  valorLiquido?: number;
  minhaPosicao?: Record<string, string>;
  caracteristicas?: Record<string, string>;
}

export const ativosRendaFixa: AtivoRendaFixa[] = [
${ativos.map((a) => `  ${JSON.stringify(a)},`).join("\n")}
];

export const fundos: Fundo[] = [
${fundosOut.map((f) => `  ${JSON.stringify(f)},`).join("\n")}
];

/** Total em investimentos (posição atual: renda fixa + fundos), sem marcação a mercado. */
export function getTotalInvestimentosAtual(): number {
  const totalRendaFixa = ativosRendaFixa.reduce((sum, a) => sum + a.posicaoAtual, 0);
  const totalFundos = fundos.reduce((sum, f) => sum + f.atual, 0);
  return totalRendaFixa + totalFundos;
}
`;

writeFileSync(OUT, ts);
const totalRf = ativos.reduce((s, a) => s + a.posicaoAtual, 0);
const totalFi = fundosOut.reduce((s, f) => s + f.atual, 0);
console.log(JSON.stringify({
  quando,
  patrimonio,
  totalLiquidoInvestido: round2(totalRf + totalFi),
  rendaFixa: ativos.length,
  fundos: fundosOut.length,
  sairam: [...removedRf, ...removedFi],
  entraram: [...addedRf, ...addedFi],
}, null, 2));
