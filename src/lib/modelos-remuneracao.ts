/**
 * Comissão × Fee fixo × Tesouro Direto.
 * Mesma régua do Master Plan: IPCA 4,5% + juro real cheio 6% = 10,77% nominal.
 * O que muda é o atrito (spread, fee, custódia, IR).
 *
 * IR incide sobre o ganho nominal, não só sobre o juro real.
 * Renda da fase 3 = juro real líquido; o principal real fica parado.
 */

export const IPCA = 0.045;
export const JURO_REAL_CHEIO = 0.06;
export const ANOS_APORTE = 10;
export const APORTE_ANUAL_NOMINAL = 100_000;
export const ANOS_HOLD = 25;
export const ANOS_SAQUE = 30;

export const IR_COMISSAO = 0.12;
export const IR_TRIBUTADO = 0.15;
export const CUSTODIA_B3 = 0.002;
export const SPREAD_COMISSAO = 0.01;
export const FEE_APORTE = 0.007;
export const FEE_DEPOIS = 0.01;

export type ModeloId = "comissao" | "fee" | "tesouro";

interface FaseConfig {
  nome: "Aporte" | "Hold" | "Renda passiva";
  anos: number;
  aporteAnual: number;
  juroRealBruto: number;
  ir: number;
  fee: number;
  custodia: number;
}

export interface FaseResultado {
  nome: FaseConfig["nome"];
  anos: number;
  aporteAnual: number;
  juroRealBruto: number;
  ir: number;
  fee: number;
  custodia: number;
  taxaNominalBruta: number;
  taxaNominalLiquida: number;
  taxaRealLiquida: number;
  patrimonioNominal: number;
  patrimonioReal: number;
}

export interface ModeloResultado {
  id: ModeloId;
  nome: string;
  resumo: string;
  fases: FaseResultado[];
  taxaRealLiquidaRenda: number;
  patrimonioRealNaRenda: number;
  rendaMensalReal: number;
  totalSacadoReal: number;
}

export function taxaNominalBruta(juroReal: number, ipca: number = IPCA): number {
  return (1 + ipca) * (1 + juroReal) - 1;
}

export function taxaNominalLiquida(
  juroReal: number,
  ir: number,
  fee: number,
  custodia: number,
  ipca: number = IPCA
): number {
  const bruta = taxaNominalBruta(juroReal, ipca);
  return bruta * (1 - ir) - fee - custodia;
}

export function taxaRealLiquida(
  juroReal: number,
  ir: number,
  fee: number,
  custodia: number,
  ipca: number = IPCA
): number {
  const nominal = taxaNominalLiquida(juroReal, ir, fee, custodia, ipca);
  return (1 + nominal) / (1 + ipca) - 1;
}

function snapshot(
  fase: FaseConfig,
  nominal: number,
  meses: number
): FaseResultado {
  const nominalLiquida = taxaNominalLiquida(fase.juroRealBruto, fase.ir, fase.fee, fase.custodia);
  const inflacao = Math.pow(1 + IPCA, meses / 12);
  return {
    nome: fase.nome,
    anos: fase.anos,
    aporteAnual: fase.aporteAnual,
    juroRealBruto: fase.juroRealBruto,
    ir: fase.ir,
    fee: fase.fee,
    custodia: fase.custodia,
    taxaNominalBruta: taxaNominalBruta(fase.juroRealBruto),
    taxaNominalLiquida: nominalLiquida,
    taxaRealLiquida: (1 + nominalLiquida) / (1 + IPCA) - 1,
    patrimonioNominal: nominal,
    patrimonioReal: meses === 0 ? 0 : nominal / inflacao,
  };
}

function simularFases(fases: FaseConfig[]): FaseResultado[] {
  let nominal = 0;
  let meses = 0;
  const saida: FaseResultado[] = [];

  for (const fase of fases) {
    if (fase.nome === "Renda passiva") {
      saida.push(snapshot(fase, nominal, meses));
      continue;
    }

    const nominalLiquida = taxaNominalLiquida(fase.juroRealBruto, fase.ir, fase.fee, fase.custodia);
    const taxaMes = Math.pow(1 + nominalLiquida, 1 / 12) - 1;
    const aporteMes = fase.aporteAnual / 12;

    for (let i = 0; i < fase.anos * 12; i++) {
      nominal = nominal * (1 + taxaMes) + aporteMes;
      meses += 1;
    }

    saida.push(snapshot(fase, nominal, meses));
  }

  return saida;
}

function montarModelo(
  id: ModeloId,
  nome: string,
  resumo: string,
  fases: FaseConfig[]
): ModeloResultado {
  const resultados = simularFases(fases);
  const hold = resultados[1];
  const renda = resultados[2];
  const rendaMensalReal = (hold.patrimonioReal * renda.taxaRealLiquida) / 12;

  return {
    id,
    nome,
    resumo,
    fases: resultados,
    taxaRealLiquidaRenda: renda.taxaRealLiquida,
    patrimonioRealNaRenda: hold.patrimonioReal,
    rendaMensalReal,
    totalSacadoReal: rendaMensalReal * 12 * ANOS_SAQUE,
  };
}

const faseAporte = (extra: Omit<FaseConfig, "nome" | "anos" | "aporteAnual">): FaseConfig => ({
  nome: "Aporte",
  anos: ANOS_APORTE,
  aporteAnual: APORTE_ANUAL_NOMINAL,
  ...extra,
});

const faseHold = (extra: Omit<FaseConfig, "nome" | "anos" | "aporteAnual">): FaseConfig => ({
  nome: "Hold",
  anos: ANOS_HOLD,
  aporteAnual: 0,
  ...extra,
});

const faseRenda = (extra: Omit<FaseConfig, "nome" | "anos" | "aporteAnual">): FaseConfig => ({
  nome: "Renda passiva",
  anos: ANOS_SAQUE,
  aporteAnual: 0,
  ...extra,
});

export function simularModelos(): ModeloResultado[] {
  const comissaoBase = {
    juroRealBruto: JURO_REAL_CHEIO - SPREAD_COMISSAO,
    ir: IR_COMISSAO,
    fee: 0,
    custodia: 0,
  };

  const tesouroBase = {
    juroRealBruto: JURO_REAL_CHEIO,
    ir: IR_TRIBUTADO,
    fee: 0,
    custodia: CUSTODIA_B3,
  };

  return [
    montarModelo(
      "comissao",
      "Comissão",
      "Sem fee na conta. O custo entra no papel: o cliente fica com IPCA+5% em vez de IPCA+6%. IR efetivo de 12%, o mix do plano.",
      [faseAporte(comissaoBase), faseHold(comissaoBase), faseRenda(comissaoBase)]
    ),
    montarModelo(
      "fee",
      "Fee fixo",
      "Acessa a taxa cheia (IPCA+6%) e paga 1% a.a. sobre o patrimônio. No aporte, cashback abaixa o fee para 0,70%. No hold e na renda, Tesouro não gera rebate: fee volta a 1%.",
      [
        faseAporte({
          juroRealBruto: JURO_REAL_CHEIO,
          ir: IR_TRIBUTADO,
          fee: FEE_APORTE,
          custodia: CUSTODIA_B3,
        }),
        faseHold({
          juroRealBruto: JURO_REAL_CHEIO,
          ir: IR_TRIBUTADO,
          fee: FEE_DEPOIS,
          custodia: CUSTODIA_B3,
        }),
        faseRenda({
          juroRealBruto: JURO_REAL_CHEIO,
          ir: IR_TRIBUTADO,
          fee: FEE_DEPOIS,
          custodia: CUSTODIA_B3,
        }),
      ]
    ),
    montarModelo(
      "tesouro",
      "Tesouro Direto",
      "IPCA+6% direto, sem assessor. Custódia B3 de 0,20% a.a. e IR de 15% sobre o ganho nominal.",
      [faseAporte(tesouroBase), faseHold(tesouroBase), faseRenda(tesouroBase)]
    ),
  ];
}

export function modeloVencedor(modelos: ModeloResultado[]): ModeloResultado {
  return modelos.reduce((melhor, atual) =>
    atual.rendaMensalReal > melhor.rendaMensalReal ? atual : melhor
  );
}

/** CRA/LCI isento: ganha do Tesouro na taxa só se o juro real que sobra passar deste piso, e o crédito pagar. */
export function pisoIsentoParaEmpatarTesouro(): number {
  const tesouro = simularModelos().find((m) => m.id === "tesouro");
  if (!tesouro) return 0;
  return tesouro.taxaRealLiquidaRenda;
}
