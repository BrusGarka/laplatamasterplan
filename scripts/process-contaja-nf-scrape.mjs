#!/usr/bin/env node
/**
 * Processa scrape API de Notas Fiscais (Contajá).
 * Uso: node scripts/process-contaja-nf-scrape.mjs --input scrape.json [--update-app]
 */
import { readFileSync, writeFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import { collectionDir } from "./lib/contaja-export.mjs";
import { mergeNotasFiscais, toCsv } from "./lib/contaja-nf-parse.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_BASE = join(ROOT, "data", "contaja-collections");

function load() {
  const i = process.argv.indexOf("--input");
  const path = resolve(i >= 0 ? process.argv[i + 1] : "-");
  const raw = path === "-" ? readFileSync(0, "utf8") : readFileSync(path, "utf8");
  const parsed = JSON.parse(raw);
  return parsed.result?.value ?? parsed;
}

const scrape = load();
const scrapedAt = new Date(scrape.scrapedAt ?? Date.now());
const dir = collectionDir(OUT_BASE, scrapedAt);
const docs = scrape.docs ?? [];
const notas = mergeNotasFiscais(docs);

const manifest = {
  fonte: "contaja-api-nfs",
  url: "https://app.contaja.com.br/notas-fiscais",
  scrapedAt: scrape.scrapedAt ?? scrapedAt.toISOString(),
  companyId: scrape.companyId,
  totalContaja: docs.length,
  totalComProjecoes: notas.length,
  projecoes: "07/2026–12/2026 R$ 27.000/mês (quando competência ainda não emitida)",
};

writeFileSync(join(dir, "manifest-nf.json"), JSON.stringify(manifest, null, 2));
writeFileSync(join(dir, "nf-api-raw.json"), JSON.stringify(scrape, null, 2));
writeFileSync(join(dir, "notas-fiscais.json"), JSON.stringify({ manifest, notas }, null, 2));

const cols = [
  "id",
  "origem",
  "dataEmissao",
  "competencia",
  "tomador",
  "servico",
  "valor",
  "valorNumero",
  "status",
  "statusSlug",
  "contajaId",
];
writeFileSync(join(dir, "notas-fiscais.csv"), toCsv(notas, cols));

if (process.argv.includes("--update-app")) {
  const relImport = `../../data/contaja-collections/${dir.split("/").pop()}/notas-fiscais.json`;
  const ts = `/**
 * Notas fiscais Contajá + projeções — Planejamento Tributário.
 * Gerado por scripts/process-contaja-nf-scrape.mjs em ${manifest.scrapedAt}
 */
import snapshot from "${relImport}";

export interface NotaFiscal {
  id: string;
  contajaId: number | null;
  origem: "contaja" | "planejamento";
  dataEmissao: string | null;
  competencia: string;
  tomador: string;
  servico: string;
  valor: string;
  valorNumero: number | null;
  status: string;
  statusSlug: string;
  nfeLinkXml: string | null;
  observacao?: string;
}

export interface ContajaNfManifest {
  fonte: string;
  url: string;
  scrapedAt: string;
  companyId?: number;
  totalContaja: number;
  totalComProjecoes: number;
  projecoes?: string;
}

export const contajaNfManifest = snapshot.manifest as ContajaNfManifest;
export const notasFiscais = snapshot.notas as NotaFiscal[];
`;
  writeFileSync(join(ROOT, "src/data/contaja-nf-data.ts"), ts);
  console.log("Atualizado src/data/contaja-nf-data.ts");
}

console.log(`Coleta NF salva em ${dir}`);
console.log(`  contaja: ${docs.length}`);
console.log(`  total (com projeções): ${notas.length}`);
