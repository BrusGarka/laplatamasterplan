#!/usr/bin/env node
/**
 * Processa JSON de scrape do browser (Contajá → Tributos e Folhas).
 *
 * Uso:
 *   node scripts/process-contaja-browser-scrape.mjs --input /caminho/scrape.json
 *   cat scrape.json | node scripts/process-contaja-browser-scrape.mjs
 */
import { readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import { buildSnapshot, collectionDir, writeCollection } from "./lib/contaja-export.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_BASE = join(ROOT, "data", "contaja-collections");

function loadPayload() {
  const inputIdx = process.argv.indexOf("--input");
  if (inputIdx >= 0) {
    const path = resolve(process.argv[inputIdx + 1]);
    const raw = readFileSync(path, "utf8");
    const parsed = JSON.parse(raw);
    return parsed.result?.value ?? parsed;
  }
  const raw = readFileSync(0, "utf8");
  const parsed = JSON.parse(raw);
  return parsed.result?.value ?? parsed;
}

const scrape = loadPayload();
const scrapedAt = new Date(scrape.scrapedAt ?? Date.now());
const dir = collectionDir(OUT_BASE, scrapedAt);
const snapshot = buildSnapshot(scrape);
writeCollection(dir, snapshot);

console.log(`Coleta Contajá salva em ${dir}`);
console.log(`  documentos: ${snapshot.documentos.length}`);
console.log(`  com valor: ${snapshot.manifest.totalComValor}`);
console.log(`  soma valores conhecidos: R$ ${snapshot.manifest.totalValorConhecidoBRL.toLocaleString("pt-BR")}`);
