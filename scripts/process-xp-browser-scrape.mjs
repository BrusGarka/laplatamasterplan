#!/usr/bin/env node
/**
 * Processa scrape do browser (log debug ou JSON) → coleção versionada.
 * Uso: node scripts/process-xp-browser-scrape.mjs [--update-investimentos]
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { parseRoleRows } from "./lib/xp-parse-rows.mjs";
import { collectionDir, writeCollection } from "./lib/xp-export.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const LOG_PATH = join(ROOT, ".cursor/debug-5c96b9.log");
const COLLECTIONS_BASE = join(ROOT, "data", "xp-collections");

function loadRowsFromDebugLog(path) {
  const lines = readFileSync(path, "utf-8").trim().split("\n");
  for (let i = lines.length - 1; i >= 0; i--) {
    try {
      const entry = JSON.parse(lines[i]);
      if (entry.message === "role-rows" && entry.data?.rows) {
        return entry.data.rows;
      }
    } catch {
      /* skip */
    }
  }
  throw new Error(`Nenhum evento role-rows em ${path}`);
}

async function main() {
  const updateInvestimentos = process.argv.includes("--update-investimentos");
  const rows = loadRowsFromDebugLog(LOG_PATH);
  const snapshot = parseRoleRows(rows, {
    scrapedAt: new Date().toISOString(),
    source: "browser-xls-expanded",
    saldoRF: "R$ 207.897,18",
    saldoFI: "R$ 54.484,75",
  });

  const dir = collectionDir(COLLECTIONS_BASE, new Date(snapshot.manifest.scrapedAt));
  const stats = writeCollection(dir, snapshot);
  console.log(`Coleção salva em ${dir}`);
  console.log(`  renda fixa: ${stats.rfCount} (${stats.rfWithCollapse} com collapse)`);
  console.log(`  fundos: ${stats.fundosCount} (${stats.fundosWithCollapse} com collapse)`);

  if (updateInvestimentos) {
    const { spawnSync } = await import("child_process");
    spawnSync(
      "node",
      [join(__dirname, "sync-xp-carteira.mjs"), "--from-json", join(dir, "carteira.json"), "--update-investimentos"],
      { stdio: "inherit", cwd: ROOT }
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
