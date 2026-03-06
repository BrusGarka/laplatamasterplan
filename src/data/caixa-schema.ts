/**
 * Estrutura de dados do app Caixa - fonte de verdade
 * Documenta tipos, chaves Redis e exemplos para referência segura no repo.
 */

// Chaves usadas no Redis (Upstash)
export const REDIS_KEYS = {
  CONFIG_CONTAS_FIXAS: "config:contas-fixas",
  MES: (anoMes: string) => `mes:${anoMes}`,
  LANCAMENTOS: (anoMes: string) => `lancamentos:${anoMes}`,
  RESUMO: (anoMes: string) => `resumo:${anoMes}`,
} as const;

// Tipos de lançamento (baseado na planilha Tabela_16)
export type TipoLancamento = "giro" | "entrada" | "fixo" | "poupança" | "variavel";

export const TIPOS_LANCAMENTO: TipoLancamento[] = [
  "giro",
  "entrada",
  "fixo",
  "poupança",
  "variavel",
];

export interface Lancamento {
  id: string;
  tipo: TipoLancamento;
  item: string;
  valor: number;
  executado: boolean;
  dia: number | null;
  debitoAutomatico?: boolean;
}

export interface ResumoMes {
  posicao: number;
  ativoCirculante: number;
  passivoCirculante: number;
  balancoPrevisto: number;
  acumuladoAnual?: number;
  totalPoupanca?: number;
  porquinhos?: Record<string, number>;
}

export interface MetadadosMes {
  criadoEm: string;
  atualizadoEm: string;
}

// Exemplo de lançamento
export const EXEMPLO_LANCAMENTO: Lancamento = {
  id: "uuid-exemplo",
  tipo: "fixo",
  item: "terapia - rosana",
  valor: -460,
  executado: false,
  dia: 15,
  debitoAutomatico: false,
};

// Exemplo de resumo
export const EXEMPLO_RESUMO: ResumoMes = {
  posicao: 2300.84,
  ativoCirculante: 32689.72,
  passivoCirculante: -29668.88,
  balancoPrevisto: 2300.84,
  acumuladoAnual: 14116.66,
  totalPoupanca: 237191.6,
  porquinhos: { chorumelo: -720, poupar: 0, guardandinho: 0 },
};
