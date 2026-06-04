import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { dedupeRendaFixa, toCsv } from "./xp-parse.mjs";

export function collectionDir(baseDir, scrapedAt = new Date()) {
  const stamp = scrapedAt.toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const dir = join(baseDir, stamp);
  mkdirSync(dir, { recursive: true });
  return dir;
}

function flattenForCsv(obj, prefix = "") {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith("_")) continue;
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      Object.assign(out, flattenForCsv(v, key));
    } else if (Array.isArray(v)) {
      out[key] = JSON.stringify(v);
    } else {
      out[key] = v;
    }
  }
  return out;
}

export function writeCollection(dir, snapshot) {
  const rf = dedupeRendaFixa(snapshot.rendaFixa?.ativos ?? []);
  const fundos = snapshot.fundos?.itens ?? [];

  const rfWithCollapse = rf.filter((a) => a.minhaPosicao?.["Valor Líquido"]).length;
  const fiWithCollapse = fundos.filter((f) => f.minhaPosicao?.["Rendimento líquido"] || f.minhaPosicao?.["Rendimento bruto"]).length;

  writeFileSync(join(dir, "manifest.json"), JSON.stringify(snapshot.manifest, null, 2));
  writeFileSync(join(dir, "carteira.json"), JSON.stringify(snapshot, null, 2));
  writeFileSync(join(dir, "renda-fixa.json"), JSON.stringify({ saldo: snapshot.rendaFixa?.saldo, ativos: rf }, null, 2));
  writeFileSync(join(dir, "fundos.json"), JSON.stringify({ saldo: snapshot.fundos?.saldo, itens: fundos }, null, 2));

  if (snapshot.xls) {
    writeFileSync(join(dir, "xls-grid.json"), JSON.stringify(snapshot.xls, null, 2));
    const gridRows = (snapshot.xls.grid ?? []).map((g) => flattenForCsv(g));
    if (gridRows.length) {
      const cols = [...new Set(gridRows.flatMap((r) => Object.keys(r)))];
      writeFileSync(join(dir, "xls-grid.csv"), toCsv(gridRows, cols));
    }
  }

  const rfCols = [
    "grupo",
    "nome",
    "posicaoAtual",
    "alocacaoPct",
    "valorAplicado",
    "taxaCompra",
    "dataAplicacao",
    "dataVencimento",
  ];
  writeFileSync(join(dir, "renda-fixa.csv"), toCsv(rf, rfCols));

  const rfDetailRows = rf.map((a) =>
    flattenForCsv({
      nome: a.nome,
      grupo: a.grupo,
      ...a.minhaPosicao,
      ...Object.fromEntries(
        Object.entries(a.caracteristicas ?? {}).map(([k, v]) => [`car.${k}`, v])
      ),
      eventos: a.eventos,
    })
  );
  if (rfDetailRows.length) {
    const detailCols = [...new Set(rfDetailRows.flatMap((r) => Object.keys(r)))];
    writeFileSync(join(dir, "renda-fixa-detalhes.csv"), toCsv(rfDetailRows, detailCols));
  }

  const fCols = ["nome", "posicaoAtual", "valorAplicado", "valorLiquido", "alocacaoPct", "rentabilidadeLiquida", "rentabilidadeBruta"];
  writeFileSync(join(dir, "fundos.csv"), toCsv(fundos, fCols));

  const fDetailRows = fundos.map((f) =>
    flattenForCsv({
      nome: f.nome,
      ...f.minhaPosicao,
      ...Object.fromEntries(
        Object.entries(f.caracteristicas ?? {}).map(([k, v]) => [`car.${k}`, v])
      ),
    })
  );
  if (fDetailRows.length) {
    const fDetailCols = [...new Set(fDetailRows.flatMap((r) => Object.keys(r)))];
    writeFileSync(join(dir, "fundos-detalhes.csv"), toCsv(fDetailRows, fDetailCols));
  }

  return {
    dir,
    rfCount: rf.length,
    fundosCount: fundos.length,
    rfWithCollapse,
    fundosWithCollapse: fiWithCollapse,
  };
}
