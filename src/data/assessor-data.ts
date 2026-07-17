import manifest202606 from "../../data/assessor/2026-06/manifest.json";
import email202606 from "../../data/assessor/2026-06/email.md?raw";
import whatsapp202606 from "../../data/assessor/2026-06/whatsapp.md?raw";
import analise202606 from "../../data/assessor/2026-06/analise.md?raw";

export interface AssessorResumo {
  patrimonioTotal: number;
  rentabilidadeMes: number;
  ganhoMes: number;
  rentabilidadeAno: number;
  percentualCDI: number;
}

export interface AssessorMes {
  anoMes: string;
  assessor: string;
  conta: string;
  dataReferencia: string;
  dataEmail: string;
  relatorioPdf: string;
  resumo: AssessorResumo;
  email: string;
  whatsapp: string;
  analise: string;
}

const MESES_RAW: Omit<AssessorMes, "email" | "whatsapp" | "analise">[] = [
  manifest202606 as Omit<AssessorMes, "email" | "whatsapp" | "analise">,
];

const CONTEUDO: Record<string, { email: string; whatsapp: string; analise: string }> = {
  "2026-06": {
    email: email202606,
    whatsapp: whatsapp202606,
    analise: analise202606,
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
