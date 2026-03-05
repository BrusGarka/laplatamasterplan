// ============================================================
// MASTER PLAN FINANCEIRO 360° — Projection Engine
// Taxa: 10.77% a.a. nominal (IPCA 4.5% + juro real 6%)
// Metodologia: aportes progressivos mensais
// ============================================================

export const TAXA_ANUAL = 0.1077;
export const TAXA_MENSAL = TAXA_ANUAL / 12; // 0.008975
export const META = 2_000_000;

export interface YearData {
  ano: number;
  idade: number;
  saldoInicial: number;
  aporteAnual: number;
  pmtMes: number;
  jurosSaldoInicial: number;
  jurosAportes: number;
  rendimentoTotal: number;
  saldoFinal: number;
  pctMeta: number;
}

// Historical data (2024-2025 kept as-is)
const DADOS_HISTORICOS: YearData[] = [
  {
    ano: 2024, idade: 30, saldoInicial: 0, aporteAnual: 100_000, pmtMes: 8_333,
    jurosSaldoInicial: 0, jurosAportes: 4_845, rendimentoTotal: 4_845,
    saldoFinal: 104_845, pctMeta: 10.2,
  },
  {
    ano: 2025, idade: 31, saldoInicial: 104_845, aporteAnual: 105_500, pmtMes: 8_792,
    jurosSaldoInicial: 11_866, jurosAportes: 5_367, rendimentoTotal: 13_655,
    saldoFinal: 224_000, pctMeta: 21.1,
  },
];

// Future contribution schedule
const APORTES_FUTUROS = [
  { ano: 2026, idade: 32, aporteAnual: 109_400, pmtMes: 9_117 },
  { ano: 2027, idade: 33, aporteAnual: 114_323, pmtMes: 9_527 },
  { ano: 2028, idade: 34, aporteAnual: 119_468, pmtMes: 9_956 },
  { ano: 2029, idade: 35, aporteAnual: 124_844, pmtMes: 10_404 },
  { ano: 2030, idade: 36, aporteAnual: 130_462, pmtMes: 10_872 },
  { ano: 2031, idade: 37, aporteAnual: 136_333, pmtMes: 11_361 },
  { ano: 2032, idade: 38, aporteAnual: 142_468, pmtMes: 11_872 },
  { ano: 2033, idade: 39, aporteAnual: 148_879, pmtMes: 12_407 },
];

/**
 * Calcula saldo final com aportes mensais progressivos.
 * - Saldo inicial rende 12 meses inteiros
 * - Aporte do mês m rende (12 - m) meses restantes
 */
export function calcularAno(
  saldoInicial: number,
  pmtMes: number,
  taxaMensal: number = TAXA_MENSAL
): { jurosSI: number; jurosAportes: number; rendimento: number; saldoFinal: number } {
  const jurosSI = saldoInicial * (Math.pow(1 + taxaMensal, 12) - 1);

  let jurosAportes = 0;
  for (let mes = 1; mes <= 12; mes++) {
    jurosAportes += pmtMes * (Math.pow(1 + taxaMensal, 12 - mes) - 1);
  }

  const rendimento = jurosSI + jurosAportes;
  const saldoFinal = saldoInicial + pmtMes * 12 + rendimento;

  return {
    jurosSI: Math.round(jurosSI),
    jurosAportes: Math.round(jurosAportes),
    rendimento: Math.round(rendimento),
    saldoFinal: Math.round(saldoFinal),
  };
}

/** Gera projeção completa 2024-2033 com dados padrão */
export function gerarProjecaoPadrao(): YearData[] {
  const tabela: YearData[] = [...DADOS_HISTORICOS];
  let saldoAnterior = DADOS_HISTORICOS[DADOS_HISTORICOS.length - 1].saldoFinal;

  for (const d of APORTES_FUTUROS) {
    const r = calcularAno(saldoAnterior, d.pmtMes);
    const entry: YearData = {
      ano: d.ano,
      idade: d.idade,
      saldoInicial: saldoAnterior,
      aporteAnual: d.aporteAnual,
      pmtMes: d.pmtMes,
      jurosSaldoInicial: r.jurosSI,
      jurosAportes: r.jurosAportes,
      rendimentoTotal: r.rendimento,
      saldoFinal: r.saldoFinal,
      pctMeta: Math.round((r.saldoFinal / META) * 1000) / 10,
    };
    tabela.push(entry);
    saldoAnterior = r.saldoFinal;
  }

  return tabela;
}

export interface UnifiedYearData {
  ano: number;
  idade: number;
  saldoInicial: number;
  aporteAnual: number;
  pmtMes: number;
  rendimentoTotal: number;
  saldoFinal: number;
  pctMeta: number;
  fase: 1 | 2;
  rendaLiquidaMes?: number;
  marco?: string;
}

/** Gera projeção unificada Fase 1 (2024-2033) + Fase 2 (2034-2058) */
export function gerarProjecaoUnificada(): UnifiedYearData[] {
  const fase1 = gerarProjecaoPadrao();
  const tabela: UnifiedYearData[] = fase1.map(d => ({
    ...d,
    fase: 1 as const,
  }));

  const ultimo = fase1[fase1.length - 1];
  let patrimonio = ultimo.saldoFinal;
  let ifMinimaFound = false;
  let ifAlvoFound = false;

  for (let i = 1; i <= 25; i++) {
    const ano = ultimo.ano + i;
    const idade = ultimo.idade + i;
    const rendimento = Math.round(patrimonio * TAXA_REAL_ANUAL);
    const saldoFinal = patrimonio + rendimento;
    const rendaLiquidaMes = Math.round(((patrimonio * TAXA_RETIRADA) / 12) * (1 - IR_EFETIVO));

    let marco: string | undefined;
    if (!ifMinimaFound && rendaLiquidaMes >= IF_MINIMA_RENDA) {
      marco = "IF Mínima R$12k";
      ifMinimaFound = true;
    }
    if (!ifAlvoFound && rendaLiquidaMes >= IF_ALVO_RENDA) {
      marco = "IF Alvo R$15k";
      ifAlvoFound = true;
    }

    tabela.push({
      ano,
      idade,
      saldoInicial: patrimonio,
      aporteAnual: 0,
      pmtMes: 0,
      rendimentoTotal: rendimento,
      saldoFinal,
      pctMeta: Math.round((saldoFinal / META) * 1000) / 10,
      fase: 2,
      rendaLiquidaMes,
      marco,
    });

    patrimonio = saldoFinal;
  }

  return tabela;
}

/** Simulação custom: dado saldo inicial, aporte mensal e taxa, projeta N anos */
export function simularProjecao(
  saldoInicial: number,
  pmtMes: number,
  taxaAnual: number,
  anos: number
): YearData[] {
  const taxaM = taxaAnual / 12;
  const tabela: YearData[] = [];
  let saldo = saldoInicial;

  for (let i = 0; i < anos; i++) {
    const ano = 2026 + i;
    const idade = 32 + i;
    const r = calcularAno(saldo, pmtMes, taxaM);
    tabela.push({
      ano,
      idade,
      saldoInicial: saldo,
      aporteAnual: pmtMes * 12,
      pmtMes,
      jurosSaldoInicial: r.jurosSI,
      jurosAportes: r.jurosAportes,
      rendimentoTotal: r.rendimento,
      saldoFinal: r.saldoFinal,
      pctMeta: Math.round((r.saldoFinal / META) * 1000) / 10,
    });
    saldo = r.saldoFinal;
  }

  return tabela;
}

/** Simula mês a mês para um ano específico */
export function simularMensal(
  saldoInicial: number,
  pmtMes: number,
  taxaMensal: number = TAXA_MENSAL
): { mes: number; saldoAntes: number; aporte: number; juros: number; saldoDepois: number }[] {
  const meses = [];
  let saldo = saldoInicial;

  for (let m = 1; m <= 12; m++) {
    const juros = Math.round(saldo * taxaMensal);
    const saldoDepois = saldo + pmtMes + juros;
    meses.push({
      mes: m,
      saldoAntes: Math.round(saldo),
      aporte: pmtMes,
      juros,
      saldoDepois: Math.round(saldoDepois),
    });
    saldo = saldoDepois;
  }

  return meses;
}

export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export function formatCompact(value: number): string {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(0)}k`;
  return formatBRL(value);
}

// ============================================================
// FASE 2 — Hold & Compound (sem aportes, juro real 6% a.a.)
// ============================================================

export const TAXA_REAL_ANUAL = 0.06;
export const IR_EFETIVO = 0.12; // mix isentos + tributados
export const TAXA_RETIRADA = 0.045; // 4.5% a.a. SWR

export const IF_MINIMA_RENDA = 12_000; // R$/mês
export const IF_ALVO_RENDA = 15_000;   // R$/mês
export const IF_MINIMA_MONTANTE = 3_640_000;
export const IF_ALVO_MONTANTE = 4_550_000;

export interface Phase2YearData {
  ano: number;
  idade: number;
  patrimonio: number;
  rendimentoAnual: number;
  rendaBrutaMes: number;
  rendaLiquidaMes: number;
  marco?: string;
}

/** Projeta Fase 2: hold sem aportes com taxa real */
export function gerarProjecaoFase2(
  patrimonioInicial: number,
  idadeInicial: number,
  anoInicial: number,
  anosHorizonte: number = 25,
  taxaRealAnual: number = TAXA_REAL_ANUAL
): Phase2YearData[] {
  const tabela: Phase2YearData[] = [];
  let patrimonio = patrimonioInicial;

  for (let i = 0; i <= anosHorizonte; i++) {
    const ano = anoInicial + i;
    const idade = idadeInicial + i;
    const rendimentoAnual = patrimonio * taxaRealAnual;
    const rendaBrutaMes = (patrimonio * TAXA_RETIRADA) / 12;
    const rendaLiquidaMes = rendaBrutaMes * (1 - IR_EFETIVO);

    let marco: string | undefined;
    if (rendaLiquidaMes >= IF_ALVO_RENDA && !tabela.some(d => d.marco === "IF Alvo R$15k")) {
      marco = "IF Alvo R$15k";
    } else if (rendaLiquidaMes >= IF_MINIMA_RENDA && !tabela.some(d => d.marco === "IF Mínima R$12k")) {
      marco = "IF Mínima R$12k";
    }

    tabela.push({
      ano,
      idade,
      patrimonio: Math.round(patrimonio),
      rendimentoAnual: Math.round(rendimentoAnual),
      rendaBrutaMes: Math.round(rendaBrutaMes),
      rendaLiquidaMes: Math.round(rendaLiquidaMes),
      marco,
    });

    patrimonio += rendimentoAnual;
  }

  return tabela;
}
