import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { mergeScrapePages, summarizeByTipo, toCsv } from "./contaja-parse.mjs";

export function collectionDir(baseDir, scrapedAt = new Date()) {
  const stamp = scrapedAt.toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const dir = join(baseDir, stamp);
  mkdirSync(dir, { recursive: true });
  return dir;
}

function parseEmpresaMeta(empresaRaw = "") {
  const cnpj = empresaRaw.match(/CNPJ:\s*([\d./-]+)/)?.[1] ?? null;
  const razao =
    empresaRaw.match(
      /MAIA SERVICOS DE INFORMACAO NA INTERNET LTDA/i
    )?.[0] ?? "MAIA SERVICOS DE INFORMACAO NA INTERNET LTDA";
  return { razaoSocial: razao, cnpj };
}

export function buildSnapshot(scrape) {
  const scrapedAt = scrape.scrapedAt ?? new Date().toISOString();
  const { razaoSocial, cnpj } = parseEmpresaMeta(scrape.empresa ?? "");
  const documentos = mergeScrapePages(scrape.pages ?? []);
  const resumoPorTipo = summarizeByTipo(documentos);
  const comValor = documentos.filter((d) => d.valorNumero != null);
  const totalValorConhecido = comValor.reduce((s, d) => s + d.valorNumero, 0);

  return {
    manifest: {
      fonte: "contaja",
      url: scrape.sourceUrl ?? "https://app.contaja.com.br/tributos-folhas",
      scrapedAt,
      empresa: { razaoSocial, cnpj },
      totalDocumentos: documentos.length,
      totalComValor: comValor.length,
      totalValorConhecidoBRL: Math.round(totalValorConhecido * 100) / 100,
      resumoPorTipo,
      paginasColetadas: (scrape.pages ?? [])
        .filter((p) => p.page > 0)
        .map((p) => ({ page: p.page, rowCount: p.rowCount })),
    },
    documentos,
  };
}

export function writeCollection(dir, snapshot) {
  const cols = [
    "tipoDocumento",
    "competencia",
    "vencimento",
    "valor",
    "valorNumero",
    "status",
    "voceJaPagou",
    "id",
  ];
  writeFileSync(join(dir, "manifest.json"), JSON.stringify(snapshot.manifest, null, 2));
  writeFileSync(join(dir, "tributos.json"), JSON.stringify(snapshot, null, 2));
  writeFileSync(join(dir, "tributos.csv"), toCsv(snapshot.documentos, cols));
  writeFileSync(
    join(dir, "scrape-raw.json"),
    JSON.stringify(
      {
        sourceUrl: snapshot.manifest.url,
        scrapedAt: snapshot.manifest.scrapedAt,
        pages: snapshot.manifest.paginasColetadas,
      },
      null,
      2
    )
  );
}
