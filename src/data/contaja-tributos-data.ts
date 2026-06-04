/**
 * Tributos Contajá (Tributos e Folhas) — fonte para Planejamento Tributário.
 * Gerado por scripts/process-contaja-api-scrape.mjs em 2026-06-04T21:39:58.566Z
 */
import snapshot from "../../data/contaja-collections/2026-06-04T21-39-58/tributos.json";

export interface ItemCalculoSimples {
  anexo: string | null;
  anexoSlug: string | null;
  aliquotaEfetiva: string | null;
  receitaCompetencia: string | null;
  impostoDevido: string | null;
  receitaCompetenciaNumero: number | null;
  impostoDevidoNumero: number | null;
  fatorR: boolean | null;
  retencao: boolean | null;
}

export interface MetodoCalculo {
  calculoId?: number;
  aliquotaEfetiva?: string | null;
  fatorR?: boolean | null;
  receitaCompetencia?: string | null;
  impostoDevido?: string | null;
  receitaCompetenciaNumero?: number | null;
  impostoDevidoNumero?: number | null;
  itens?: ItemCalculoSimples[];
  fonte?: string;
  erro?: string;
}

export interface DocumentoTributo {
  contajaId: number;
  hash: string;
  tipoDocumento: string;
  tipoSlug: string;
  competencia: string;
  vencimento: string;
  valor: string;
  valorNumero: number | null;
  status: string;
  statusSlug: string;
  voceJaPagou: boolean;
  voceJaPagouPeloSistema: boolean;
  nationalSimpleTaxCalculationId: number | null;
  metodoCalculo: MetodoCalculo | null;
  visualizar: string;
  id: string;
}

export interface ContajaTributosManifest {
  fonte: string;
  url: string;
  scrapedAt: string;
  totalDocumentos: number;
  totalComMetodoCalculo: number;
  calculosSimplesUnicos?: number;
  endpoints?: string[];
}

export const contajaTributosManifest = snapshot.manifest as ContajaTributosManifest;
export const tributosDocumentos = snapshot.documentos as DocumentoTributo[];
