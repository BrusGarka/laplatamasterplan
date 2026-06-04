/**
 * Notas fiscais Contajá + projeções — Planejamento Tributário.
 * Gerado por scripts/process-contaja-nf-scrape.mjs em 2026-06-04T21:50:42.467Z
 */
import snapshot from "../../data/contaja-collections/2026-06-04T21-50-42/notas-fiscais.json";

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
