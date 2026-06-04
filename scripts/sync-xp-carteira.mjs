#!/usr/bin/env node
/**
 * Sincroniza carteira XP → data/xp-collections/<timestamp>/
 *
 * Uso:
 *   node scripts/sync-xp-carteira.mjs --from-json path/carteira.json
 *   node scripts/sync-xp-carteira.mjs --scrape   # Playwright (sessão salva)
 *   node scripts/sync-xp-carteira.mjs --from-json x.json --update-investimentos
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { copyFileSync } from "fs";
import { collectionDir, writeCollection } from "./lib/xp-export.mjs";
import {
  parseBRL,
  normalizeTaxa,
  inferTipo,
  riscoFromNumero,
  dedupeRendaFixa,
} from "./lib/xp-parse.mjs";
import { parseRoleRows } from "./lib/xp-parse-rows.mjs";
import { parseXlsFile } from "./lib/xp-parse-xls.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const COLLECTIONS_BASE = join(ROOT, "data", "xp-collections");
const INVESTIMENTOS_PATH = join(ROOT, "src", "data", "investimentos-data.ts");

function parseArgs(argv) {
  const args = { fromJson: null, scrape: false, updateInvestimentos: false };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--from-json" && argv[i + 1]) {
      args.fromJson = argv[++i];
    } else if (argv[i] === "--scrape") {
      args.scrape = true;
    } else if (argv[i] === "--update-investimentos") {
      args.updateInvestimentos = true;
    }
  }
  return args;
}

function parseRendimentoLiquido(str) {
  if (!str) return null;
  return parseBRL(str);
}

function liquidezFromFundCaracteristicas(car) {
  if (!car) return "—";
  const cot = car["Tempo resgate (Cotização)"] || "";
  const liq = car["Tempo resgate (Liquidação)"] || "";
  const m = (cot || liq).match(/D\+(\d+)/i);
  return m ? `D+${m[1]}` : cot || liq || "—";
}

function mapToLaPlata(snapshot) {
  const ativos = dedupeRendaFixa(snapshot.rendaFixa?.ativos ?? []).map((a) => {
    const valorAplicado = parseBRL(a.valorAplicado);
    const posicaoLista = parseBRL(a.posicaoAtual);
    const valorLiquido = parseBRL(a.minhaPosicao?.["Valor Líquido"]);
    const posicaoAtual = valorLiquido || posicaoLista;
    const rendLiq = parseRendimentoLiquido(a.minhaPosicao?.["Rendimento Líquido"]);
    const rendimento =
      rendLiq !== null && !Number.isNaN(rendLiq)
        ? Math.round(rendLiq * 100) / 100
        : Math.round((posicaoAtual - valorAplicado) * 100) / 100;
    const riscoNumero = a.riscoNumero ?? 20;
    const taxaCompra = normalizeTaxa(a.taxaCompra || a.caracteristicas?.["Taxa de compra"]);
    return {
      nome: a.nome,
      tipo: inferTipo(a.nome),
      taxa: taxaCompra,
      vencimento: a.dataVencimento,
      valorAplicado,
      posicaoAtual,
      rendimento,
      risco: riscoFromNumero(riscoNumero),
      riscoNumero,
      grupo: a.grupo,
      alocacaoPct: a.alocacaoPct,
      posicaoTaxaCompra: typeof a.posicaoAtual === "string" ? a.posicaoAtual : undefined,
      taxaCompra: a.taxaCompra ? normalizeTaxa(a.taxaCompra) : undefined,
      dataAplicacao: a.dataAplicacao,
      minhaPosicao: a.minhaPosicao,
      caracteristicas: a.caracteristicas,
      eventos: a.eventos,
    };
  });

  const fundos = (snapshot.fundos?.itens ?? []).map((f) => {
    const aplicado = parseBRL(f.valorAplicado ?? f.aplicado);
    const atual = parseBRL(f.valorLiquido ?? f.posicaoAtual ?? f.atual);
    return {
      nome: f.nome,
      aplicado,
      atual,
      liquidez: f.liquidez ?? liquidezFromFundCaracteristicas(f.caracteristicas),
      risco: f.risco ?? 10,
      grupo: f.grupo,
      alocacaoPct: f.alocacaoPct,
      posicaoTaxaCompra: typeof f.posicaoAtual === "string" ? f.posicaoAtual : undefined,
      rentabilidadeLiquida: f.rentabilidadeLiquida,
      rentabilidadeBruta: f.rentabilidadeBruta,
      valorLiquido: parseBRL(f.valorLiquido) || undefined,
      minhaPosicao: f.minhaPosicao,
      caracteristicas: f.caracteristicas,
    };
  });

  return { ativos, fundos };
}

function generateInvestimentosTs({ ativos, fundos }) {
  const rfLines = ativos.map((a) => `  ${JSON.stringify(a)},`).join("\n");
  const fLines = fundos.map((f) => `  ${JSON.stringify(f)},`).join("\n");

  return `/**
 * Dados de investimentos (renda fixa + fundos) – fonte única para Investimentos e Ativos.
 * Gerado por scripts/sync-xp-carteira.mjs em ${new Date().toISOString()}
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
${rfLines}
];

export const fundos: Fundo[] = [
${fLines}
];

/** Total em investimentos (posição atual: renda fixa + fundos), sem marcação a mercado. */
export function getTotalInvestimentosAtual(): number {
  const totalRendaFixa = ativosRendaFixa.reduce((sum, a) => sum + a.posicaoAtual, 0);
  const totalFundos = fundos.reduce((sum, f) => sum + f.atual, 0);
  return totalRendaFixa + totalFundos;
}
`;
}

async function scrapeWithPlaywright() {
  const { chromium } = await import("playwright");
  const statePath = join(ROOT, ".xp-storage-state.json");
  if (!existsSync(statePath)) {
    console.error("Sessão XP não encontrada. Rode: npm run sync:xp:login");
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    storageState: statePath,
    acceptDownloads: true,
  });
  const page = await context.newPage();
  await page.goto("https://experiencia.xpi.com.br/conta/#/carteira", {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });
  await page.waitForTimeout(4000);

  await page.evaluate(() => {
    window.scrollTo(0, 0);
    const xls = [...document.querySelectorAll("soma-button")].find(
      (e) => (e.textContent || "").trim() === "XLS"
    );
    if (xls) xls.click();
  });
  await page.waitForTimeout(2000);

  const rows = await page.evaluate(() =>
    [...document.querySelectorAll("[role=row]")]
      .map((row) =>
        row.innerText
          .split("\n")
          .map((x) => x.trim())
          .filter(Boolean)
      )
      .filter((r) => r.length >= 2)
  );

  let xlsExportPath = null;
  try {
    const exportBtn = page.locator("soma-button", { hasText: "Exportar" });
    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: 20000 }),
      exportBtn.click(),
    ]);
    xlsExportPath = join(ROOT, ".xp-carteira-export-tmp.xlsx");
    await download.saveAs(xlsExportPath);
  } catch (err) {
    console.warn("Download XLS Exportar:", err.message || err);
  }

  await browser.close();

  if (!rows?.length) {
    console.error("Scrape retornou vazio. Expanda RF/Fundos e tente de novo.");
    process.exit(1);
  }

  const snapshot = parseRoleRows(rows, {
    scrapedAt: new Date().toISOString(),
    source: "playwright-xls-expanded",
  });

  if (xlsExportPath && existsSync(xlsExportPath)) {
    snapshot.xlsExportFile = xlsExportPath;
    try {
      snapshot.xlsParsed = await parseXlsFile(xlsExportPath);
    } catch (e) {
      console.warn("Parse XLS:", e.message);
    }
  }

  return snapshot;
}

async function loginWithPlaywright() {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("https://experiencia.xpi.com.br/conta/#/carteira");
  console.log("Faça login na XP e abra a carteira. Quando estiver pronto, pressione Enter no terminal.");
  await new Promise((r) => process.stdin.once("data", r));
  await context.storageState({ path: join(ROOT, ".xp-storage-state.json") });
  await browser.close();
  console.log("Sessão salva em .xp-storage-state.json");
}

async function main() {
  const args = parseArgs(process.argv);
  if (process.argv.includes("--login")) {
    await loginWithPlaywright();
    return;
  }

  let snapshot;
  if (args.fromJson) {
    snapshot = JSON.parse(readFileSync(args.fromJson, "utf-8"));
  } else if (args.scrape) {
    snapshot = await scrapeWithPlaywright();
  } else {
    console.error("Informe --from-json <arquivo> ou --scrape");
    process.exit(1);
  }

  const scrapedAt = new Date(snapshot.manifest?.scrapedAt ?? Date.now());
  const dir = collectionDir(COLLECTIONS_BASE, scrapedAt);

  if (snapshot.xlsExportFile && existsSync(snapshot.xlsExportFile)) {
    const dest = join(dir, "carteira-export.xlsx");
    copyFileSync(snapshot.xlsExportFile, dest);
    snapshot.manifest.xlsExport = "carteira-export.xlsx";
    if (snapshot.xlsParsed) {
      writeFileSync(join(dir, "carteira-export-parsed.json"), JSON.stringify(snapshot.xlsParsed, null, 2));
    }
    delete snapshot.xlsExportFile;
  }

  const { rfCount, fundosCount } = writeCollection(dir, snapshot);
  console.log(`Coleção salva em ${dir}`);
  console.log(`  renda fixa: ${rfCount} ativos`);
  console.log(`  fundos: ${fundosCount}`);

  if (args.updateInvestimentos) {
    const mapped = mapToLaPlata(snapshot);
    const ts = generateInvestimentosTs(mapped);
    writeFileSync(INVESTIMENTOS_PATH, ts);
    console.log(`Atualizado ${INVESTIMENTOS_PATH}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
