#!/usr/bin/env node
/**
 * Processa scrape da API Contajá (sessão do browser).
 * Uso: node scripts/process-contaja-api-scrape.mjs --input scrape.json
 */
import { readFileSync, writeFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import { collectionDir } from "./lib/contaja-export.mjs";
import { mergeDocumentosApi, parseApiPayload } from "./lib/contaja-api-merge.mjs";
import { toCsv } from "./lib/contaja-parse.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_BASE = join(ROOT, "data", "contaja-collections");

function load() {
  const i = process.argv.indexOf("--input");
  const path = resolve(i >= 0 ? process.argv[i + 1] : "-");
  const raw = path === "-" ? readFileSync(0, "utf8") : readFileSync(path, "utf8");
  return JSON.parse(raw);
}

const payload = parseApiPayload(load());
const scrapedAt = new Date(payload.scrapedAt);
const dir = collectionDir(OUT_BASE, scrapedAt);
const documentos = mergeDocumentosApi(payload.docs, payload.calcs);

const comCalculo = documentos.filter((d) => d.metodoCalculo?.calculoId);
const manifest = {
  fonte: "contaja-api",
  url: "https://app.contaja.com.br/tributos-folhas",
  scrapedAt: payload.scrapedAt,
  totalDocumentos: documentos.length,
  totalComMetodoCalculo: comCalculo.length,
  calculosSimplesUnicos: Object.keys(payload.calcs).length,
  endpoints: [
    "/api/tax-payroll-document",
    "/api/tax-payroll-document/national-simple-tax-calculation",
  ],
};

writeFileSync(join(dir, "manifest.json"), JSON.stringify(manifest, null, 2));
writeFileSync(join(dir, "api-raw.json"), JSON.stringify(payload, null, 2));
writeFileSync(join(dir, "calculos-simples.json"), JSON.stringify(payload.calcs, null, 2));
writeFileSync(
  join(dir, "tributos.json"),
  JSON.stringify({ manifest, documentos }, null, 2)
);

const csvCols = [
  "contajaId",
  "tipoDocumento",
  "competencia",
  "vencimento",
  "valor",
  "valorNumero",
  "status",
  "anexo",
  "aliquotaEfetiva",
  "receitaCompetencia",
  "impostoDevido",
  "fatorR",
  "visualizar",
  "id",
];
const csvRows = documentos.map((d) => ({
  ...d,
  anexo: d.metodoCalculo?.itens?.[0]?.anexo ?? "",
  aliquotaEfetiva: d.metodoCalculo?.aliquotaEfetiva ?? "",
  receitaCompetencia: d.metodoCalculo?.receitaCompetencia ?? "",
  impostoDevido: d.metodoCalculo?.impostoDevido ?? "",
  fatorR: d.metodoCalculo?.fatorR ?? "",
}));
writeFileSync(join(dir, "tributos.csv"), toCsv(csvRows, csvCols));

console.log(`Coleta API Contajá salva em ${dir}`);
console.log(`  documentos: ${documentos.length}`);
console.log(`  com método de cálculo (DAS): ${comCalculo.length}`);
