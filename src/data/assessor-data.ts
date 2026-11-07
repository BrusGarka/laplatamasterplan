import manifest202606 from "../../data/assessor/2026-06/manifest.json";
import email202606 from "../../data/assessor/2026-06/email.md?raw";
import whatsapp202606 from "../../data/assessor/2026-06/whatsapp.md?raw";
import analise202606 from "../../data/assessor/2026-06/analise.md?raw";

import manifest202611 from "../../data/assessor/2026-11/manifest.json";
import email202611 from "../../data/assessor/2026-11/email.md?raw";
import whatsapp202611 from "../../data/assessor/2026-11/whatsapp.md?raw";
import analise202611 from "../../data/assessor/2026-11/analise.md?raw";

export interface AssessorResumo {
  patrimonioTotal: number;
  rentabilidadeMes: number;
  ganhoMes: number;
  rentabilidadeAno: number;
  percentualCDI: number;
  feeMensalEstimado?: number;
  feeAnualPercentual?: number;
  observacaoResumo?: string;
}

export interface AssessorSlide {
  arquivo: string;
  titulo: string;
}

export interface AssessorMes {
  anoMes: string;
  assessor: string;
  conta: string;
  dataReferencia: string;
  dataEmail: string;
  relatorioPdf: string;
  destaque?: string;
  slides?: AssessorSlide[];
  resumo: AssessorResumo;
  email: string;
  whatsapp: string;
  analise: string;
}

const MESES_RAW: Omit<AssessorMes, "email" | "whatsapp" | "analise">[] = [
  manifest202606 as Omit<AssessorMes, "email" | "whatsapp" | "analise">,
  manifest202611 as Omit<AssessorMes, "email" | "whatsapp" | "analise">,
];

const CONTEUDO: Record<string, { email: string; whatsapp: string; analise: string }> = {
  "2026-06": {
    email: email202606,
    whatsapp: whatsapp202606,
    analise: analise202606,
  },
  "2026-11": {
    email: email202611,
    whatsapp: whatsapp202611,
    analise: analise202611,
  },
};

export const ASSESSOR_MESES: AssessorMes[] = MESES_RAW.map((m) => ({
  ...m,
  email: CONTEUDO[m.anoMes]?.email ?? "",
  whatsapp: CONTEUDO[m.anoMes]?.whatsapp ?? "",
  analise: CONTEUDO[m.anoMes]?.analise ?? "",
})).sort((a, b) => b.anoMes.localeCompare(a.anoMes));

export const ASSESSOR_MESES_DISPONIVEIS = ASSESSOR_MESES.map((m) => m.anoMes);

export function getAssessorMes(anoMes: string): AssessorMes | undefined {
  return ASSESSOR_MESES.find((m) => m.anoMes === anoMes);
}
