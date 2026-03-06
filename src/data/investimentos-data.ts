/**
 * Dados de investimentos (renda fixa + fundos) – fonte única para Investimentos e Ativos.
 */

export interface AtivoRendaFixa {
  nome: string;
  tipo: string;
  taxa: string;
  vencimento: string;
  valorAplicado: number;
  posicaoAtual: number;
  rendimento: number;
  risco: string;
  riscoNumero: number;
  valorMercado?: number;
}

export interface Fundo {
  nome: string;
  aplicado: number;
  atual: number;
  liquidez: string;
  risco: number;
}

export const ativosRendaFixa: AtivoRendaFixa[] = [
  { nome: "NTN-B 2035", tipo: "Tesouro", taxa: "IPCA + 6,13%", vencimento: "15/05/2035", valorAplicado: 17134.82, posicaoAtual: 18695.86, rendimento: 3148.74, risco: "Médio", riscoNumero: 18, valorMercado: 18850.20 },
  { nome: "CDB Banco C6", tipo: "CDB", taxa: "IPCA + 8,05%", vencimento: "19/01/2032", valorAplicado: 10000.00, posicaoAtual: 10156.66, rendimento: 156.66, risco: "Baixo", riscoNumero: 10, valorMercado: 10160.00 },
  { nome: "CDB Banco C6", tipo: "CDB", taxa: "IPCA + 7,85%", vencimento: "12/01/2032", valorAplicado: 19000.00, posicaoAtual: 19306.96, rendimento: 306.96, risco: "Baixo", riscoNumero: 10, valorMercado: 19310.50 },
  { nome: "CDB BTG Pactual", tipo: "CDB", taxa: "Pré 12,05%", vencimento: "18/07/2030", valorAplicado: 12000.00, posicaoAtual: 14433.69, rendimento: 2433.69, risco: "Médio", riscoNumero: 12, valorMercado: 14480.00 },
  { nome: "CRA FS BIO", tipo: "CRA", taxa: "IPCA + 8,30%", vencimento: "15/10/2029", valorAplicado: 12917.06, posicaoAtual: 13806.81, rendimento: 2684.47, risco: "Alto", riscoNumero: 27, valorMercado: 13750.00 },
  { nome: "CRA Minerva", tipo: "CRA", taxa: "Pré 14,25%", vencimento: "16/07/2035", valorAplicado: 11381.63, posicaoAtual: 11547.34, rendimento: 893.94, risco: "Alto", riscoNumero: 30, valorMercado: 11420.00 },
  { nome: "CRA Minerva", tipo: "CRA", taxa: "Pré 13,95%", vencimento: "16/11/2034", valorAplicado: 9816.98, posicaoAtual: 9650.93, rendimento: 1047.44, risco: "Alto", riscoNumero: 29, valorMercado: 9620.00 },
  { nome: "CRA Jalles", tipo: "CRA", taxa: "IPCA + 8,20%", vencimento: "06/10/2032", valorAplicado: 13250.90, posicaoAtual: 13782.48, rendimento: 531.57, risco: "Médio", riscoNumero: 23, valorMercado: 13820.00 },
  { nome: "CRA Seara (JBS)", tipo: "CRA", taxa: "IPCA + 8,03%", vencimento: "15/10/2065", valorAplicado: 5000.00, posicaoAtual: 5190.77, rendimento: 190.77, risco: "Alto", riscoNumero: 28, valorMercado: 5180.00 },
  { nome: "CRA Seara (JBS)", tipo: "CRA", taxa: "IPCA + 7,55%", vencimento: "17/05/2055", valorAplicado: 16776.03, posicaoAtual: 17196.86, rendimento: 994.63, risco: "Alto", riscoNumero: 28, valorMercado: 17150.00 },
  { nome: "CRA Seara (JBS)", tipo: "CRA", taxa: "PTAX + 5,30%", vencimento: "03/10/2035", valorAplicado: 5000.00, posicaoAtual: 4937.67, rendimento: -62.33, risco: "Médio", riscoNumero: 15, valorMercado: 4920.00 },
  { nome: "CRA BTG", tipo: "CRA", taxa: "97,50% CDI", vencimento: "15/09/2033", valorAplicado: 6458.65, posicaoAtual: 6881.08, rendimento: 1253.20, risco: "Alto", riscoNumero: 28, valorMercado: 6900.00 },
  { nome: "CRA FS Florestal", tipo: "CRA", taxa: "CDI + 3,00%", vencimento: "17/03/2031", valorAplicado: 6000.00, posicaoAtual: 6044.28, rendimento: 950.74, risco: "Alto", riscoNumero: 26, valorMercado: 6030.00 },
  { nome: "CRI Patrimar", tipo: "CRI", taxa: "CDI + 2,00%", vencimento: "24/04/2029", valorAplicado: 6938.10, posicaoAtual: 7304.16, rendimento: 1382.88, risco: "Médio", riscoNumero: 19, valorMercado: 7320.00 },
  { nome: "DEB Igua", tipo: "DEB", taxa: "IPCA + 8,56%", vencimento: "15/02/2044", valorAplicado: 10405.96, posicaoAtual: 11229.14, rendimento: 823.18, risco: "Alto", riscoNumero: 39, valorMercado: 11180.00 },
  { nome: "DEB Mae", tipo: "DEB", taxa: "Pré 14,55%", vencimento: "15/04/2032", valorAplicado: 8215.39, posicaoAtual: 8579.62, rendimento: 864.36, risco: "Alto", riscoNumero: 29, valorMercado: 8560.00 },
  { nome: "DEB Simpar", tipo: "DEB", taxa: "CDI + 3,40%", vencimento: "15/01/2031", valorAplicado: 6255.73, posicaoAtual: 6154.96, rendimento: 1393.57, risco: "Médio", riscoNumero: 17, valorMercado: 6170.00 },
  { nome: "DEB Aegea Rio", tipo: "DEB", taxa: "IPCA + 8,05%", vencimento: "15/09/2042", valorAplicado: 3261.34, posicaoAtual: 3501.12, rendimento: 493.38, risco: "Alto", riscoNumero: 39, valorMercado: 3480.00 },
  { nome: "DEB Origem", tipo: "DEB", taxa: "Pré 12,90%", vencimento: "15/12/2035", valorAplicado: 4337.92, posicaoAtual: 4327.48, rendimento: 820.90, risco: "Alto", riscoNumero: 35, valorMercado: 4310.00 },
];

export const fundos: Fundo[] = [
  { nome: "XP Referenciado DI CP RL", aplicado: 12645, atual: 13061.98, liquidez: "D+0", risco: 2 },
  { nome: "Occam Liquidez FIC FIF", aplicado: 13485, atual: 13931.97, liquidez: "D+0", risco: 12 },
  { nome: "SVN FIRF CP RL", aplicado: 13393, atual: 13818.82, liquidez: "D+5", risco: 11 },
];

/** Total em investimentos (posição atual: renda fixa + fundos), sem marcação a mercado. */
export function getTotalInvestimentosAtual(): number {
  const totalRendaFixa = ativosRendaFixa.reduce((sum, a) => sum + a.posicaoAtual, 0);
  const totalFundos = fundos.reduce((sum, f) => sum + f.atual, 0);
  return totalRendaFixa + totalFundos;
}
