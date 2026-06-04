/**
 * Dados de investimentos (renda fixa + fundos) – fonte única para Investimentos e Ativos.
 * Gerado por scripts/sync-xp-carteira.mjs em 2026-06-04T21:16:47.620Z
 */

export interface EventoRF {
  data: string;
  juros: string;
  amortizacao: string;
  premio: string;
}

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
  grupo?: string;
  alocacaoPct?: string;
  posicaoTaxaCompra?: string;
  taxaCompra?: string;
  dataAplicacao?: string;
  minhaPosicao?: Record<string, string>;
  caracteristicas?: Record<string, string>;
  eventos?: EventoRF[];
}

export interface Fundo {
  nome: string;
  aplicado: number;
  atual: number;
  liquidez: string;
  risco: number;
  grupo?: string;
  alocacaoPct?: string;
  posicaoTaxaCompra?: string;
  rentabilidadeLiquida?: string;
  rentabilidadeBruta?: string;
  valorLiquido?: number;
  minhaPosicao?: Record<string, string>;
  caracteristicas?: Record<string, string>;
}

export const ativosRendaFixa: AtivoRendaFixa[] = [
  {"nome":"NTN-B - AGO/2040","tipo":"Tesouro","taxa":"IPCA +6,70%","vencimento":"15/08/2040","valorAplicado":26817.93,"posicaoAtual":27079.37,"rendimento":261.44,"risco":"Médio","riscoNumero":20,"grupo":"48,9% | Inflação","alocacaoPct":"10,35%","posicaoTaxaCompra":"R$ 27.155,27","taxaCompra":"IPCA +6,70%","dataAplicacao":"30/04/2026","minhaPosicao":{"Valor Líquido":"R$ 27.079,37","Rendimento Bruto":"R$ 337,34","Rendimento Líquido":"R$ 261,44","Garantia":"0","Quantidade":"6"},"caracteristicas":{"Liquidez":"15/08/2040","Juros":"Semestral","Amortização":"VENCIMENTO","Ticker/Código":"760199","Rating":"-","Taxa de compra":"IPC-A +6,70%"}},
  {"nome":"CDB BANCO C6 CONSIGNADO S.A. - JAN/2032","tipo":"CDB","taxa":"IPCA +7,85%","vencimento":"12/01/2032","valorAplicado":19000,"posicaoAtual":19845.45,"rendimento":845.45,"risco":"Médio","riscoNumero":20,"grupo":"48,9% | Inflação","alocacaoPct":"7,66%","posicaoTaxaCompra":"R$ 20.090,90","taxaCompra":"IPCA +7,85%","dataAplicacao":"13/01/2026","minhaPosicao":{"Valor Líquido":"R$ 19.845,45","Rendimento Bruto":"R$ 1.090,90","Rendimento Líquido":"R$ 845,45","Garantia":"0","Quantidade":"19"},"caracteristicas":{"Liquidez":"12/01/2032","Juros":"Vencimento","Amortização":"VENCIMENTO","Ticker/Código":"CDB1264TIWS","Rating":"Fitch - A+","Taxa de compra":"IPC-A +7,85%"}},
  {"nome":"NTN-B - MAI/2035","tipo":"Tesouro","taxa":"IPCA +6,13%","vencimento":"15/05/2035","valorAplicado":17040.41,"posicaoAtual":18512.22,"rendimento":3521.43,"risco":"Médio","riscoNumero":20,"grupo":"48,9% | Inflação","alocacaoPct":"7,17%","posicaoTaxaCompra":"R$ 18.824,42","taxaCompra":"IPCA +6,13%","dataAplicacao":"19/06/2024","minhaPosicao":{"Valor Líquido":"R$ 18.512,22","Rendimento Bruto":"R$ 3.833,63","Rendimento Líquido":"R$ 3.521,43","Garantia":"0","Quantidade":"4"},"caracteristicas":{"Liquidez":"15/05/2035","Juros":"Semestral","Amortização":"VENCIMENTO","Ticker/Código":"760199","Rating":"-","Taxa de compra":"IPC-A +6,13%"},"eventos":[{"data":"18/11/2024","juros":"R$ 515,33","amortizacao":"R$ 0,00","premio":"R$ 0,00"}]},
  {"nome":"CRA SEARA (JBS) - MAI/2055","tipo":"CRA","taxa":"IPCA +7,55%","vencimento":"17/05/2055","valorAplicado":16555.34,"posicaoAtual":17270.89,"rendimento":1680.99,"risco":"Médio","riscoNumero":20,"grupo":"48,9% | Inflação","alocacaoPct":"6,58%","posicaoTaxaCompra":"R$ 17.270,89","taxaCompra":"IPCA +7,55%","dataAplicacao":"07/08/2025","minhaPosicao":{"Valor Líquido":"R$ 17.270,89","Rendimento Bruto":"R$ 1.680,99","Rendimento Líquido":"R$ 1.680,99","Garantia":"0","Quantidade":"16"},"caracteristicas":{"Liquidez":"17/05/2055","Juros":"Semestral","Amortização":"VENCIMENTO","Ticker/Código":"CRA025003PJ","Rating":"Moody´s - AAA.br","Taxa de compra":"IPC-A +7,55%"},"eventos":[{"data":"17/11/2025","juros":"R$ 573,79","amortizacao":"R$ 0,00","premio":"R$ 0,00"}]},
  {"nome":"CRA VERA CRUZ (JALLES) - OUT/2032","tipo":"CRA","taxa":"IPCA +8,20%","vencimento":"06/10/2032","valorAplicado":13198.36,"posicaoAtual":13845.24,"rendimento":1095.48,"risco":"Médio","riscoNumero":20,"grupo":"48,9% | Inflação","alocacaoPct":"5,28%","posicaoTaxaCompra":"R$ 13.845,24","taxaCompra":"IPCA +8,20%","dataAplicacao":"23/10/2025","minhaPosicao":{"Valor Líquido":"R$ 13.845,24","Rendimento Bruto":"R$ 1.095,48","Rendimento Líquido":"R$ 1.095,48","Garantia":"0","Quantidade":"13"},"caracteristicas":{"Liquidez":"06/10/2032","Juros":"Semestral","Amortização":"VENCIMENTO","Ticker/Código":"CRA024009VN","Rating":"S&P - brAAA","Taxa de compra":"IPC-A +8,20%"},"eventos":[{"data":"06/04/2026","juros":"R$ 501,15","amortizacao":"R$ 0,00","premio":"R$ 0,00"}]},
  {"nome":"DEB IGUA - FEV/2044","tipo":"DEB","taxa":"IPCA +8,56%","vencimento":"15/02/2044","valorAplicado":10405.96,"posicaoAtual":11706.58,"rendimento":1300.62,"risco":"Médio","riscoNumero":20,"grupo":"48,9% | Inflação","alocacaoPct":"4,46%","posicaoTaxaCompra":"R$ 11.706,58","taxaCompra":"IPCA +8,56%","dataAplicacao":"03/07/2025","minhaPosicao":{"Valor Líquido":"R$ 11.706,58","Rendimento Bruto":"R$ 1.300,62","Rendimento Líquido":"R$ 1.300,62","Garantia":"0","Quantidade":"10"},"caracteristicas":{"Liquidez":"15/02/2044","Juros":"Semestral","Amortização":"VENCIMENTO","Ticker/Código":"IRJS15","Rating":"S&P - brAAA","Taxa de compra":"IPC-A +8,56%"}},
  {"nome":"CDB BANCO C6 CONSIGNADO S.A. - JAN/2032","tipo":"CDB","taxa":"IPCA +8,05%","vencimento":"19/01/2032","valorAplicado":10000,"posicaoAtual":10576.03,"rendimento":576.03,"risco":"Médio","riscoNumero":20,"grupo":"48,9% | Inflação","alocacaoPct":"4,03%","posicaoTaxaCompra":"R$ 10.576,03","taxaCompra":"IPCA +8,05%","dataAplicacao":"20/01/2026"},
  {"nome":"CRA SEARA - OUT/2065","tipo":"CRA","taxa":"IPCA +8,03%","vencimento":"15/10/2065","valorAplicado":5000,"posicaoAtual":5227.46,"rendimento":227.46,"risco":"Médio","riscoNumero":20,"grupo":"48,9% | Inflação","alocacaoPct":"1,99%","posicaoTaxaCompra":"R$ 5.227,46","taxaCompra":"IPCA +8,03%","dataAplicacao":"05/11/2025"},
  {"nome":"DEB AEGEA RIO SPE1 - SET/2042","tipo":"DEB","taxa":"IPCA +8,05%","vencimento":"15/09/2042","valorAplicado":3195.96,"posicaoAtual":3510.61,"rendimento":633.42,"risco":"Médio","riscoNumero":20,"grupo":"48,9% | Inflação","alocacaoPct":"1,34%","posicaoTaxaCompra":"R$ 3.510,61","taxaCompra":"IPCA +8,05%","dataAplicacao":"18/12/2024","minhaPosicao":{"Valor Líquido":"R$ 3.510,61","Rendimento Bruto":"R$ 633,42","Rendimento Líquido":"R$ 633,42","Garantia":"0","Quantidade":"3.200"},"caracteristicas":{"Liquidez":"15/09/2042","Juros":"Semestral","Amortização":"VENCIMENTO","Ticker/Código":"RISP24","Rating":"S&P - brAA+","Taxa de compra":"IPC-A +8,05%"},"eventos":[{"data":"17/03/2025","juros":"R$ 249,46","amortizacao":"R$ 0,00","premio":"R$ 0,00"}]},
  {"nome":"CDB BTG PACTUAL - JUL/2030","tipo":"CDB","taxa":"Pré 12,05%","vencimento":"18/07/2030","valorAplicado":12000,"posicaoAtual":14345.83,"rendimento":2345.83,"risco":"Médio","riscoNumero":20,"grupo":"18,6% | Prefixado","alocacaoPct":"5,66%","posicaoTaxaCompra":"R$ 14.843,43","taxaCompra":"Pré 12,05%","dataAplicacao":"19/07/2024","minhaPosicao":{"Valor Líquido":"R$ 14.345,83","Rendimento Bruto":"R$ 2.843,43","Rendimento Líquido":"R$ 2.345,83","Garantia":"0","Quantidade":"12"},"caracteristicas":{"Liquidez":"18/07/2030","Juros":"Vencimento","Amortização":"VENCIMENTO","Ticker/Código":"CDB72484UFA","Rating":"S&P - brAAA","Taxa de compra":"+12,05%"}},
  {"nome":"CRA MINERVA - JUL/2035","tipo":"CRA","taxa":"Pré 14,25%","vencimento":"16/07/2035","valorAplicado":11356.52,"posicaoAtual":11925.78,"rendimento":569.26,"risco":"Médio","riscoNumero":20,"grupo":"18,6% | Prefixado","alocacaoPct":"4,55%","posicaoTaxaCompra":"R$ 11.925,78","taxaCompra":"Pré 14,25%","dataAplicacao":"07/08/2025"},
  {"nome":"CRA MINERVA - NOV/2034","tipo":"CRA","taxa":"Pré 13,95%","vencimento":"16/11/2034","valorAplicado":9302.94,"posicaoAtual":9344.94,"rendimento":42,"risco":"Médio","riscoNumero":20,"grupo":"18,6% | Prefixado","alocacaoPct":"3,56%","posicaoTaxaCompra":"R$ 9.344,94","taxaCompra":"Pré 13,95%","dataAplicacao":"06/05/2025"},
  {"nome":"DEB ORIGEM ENERGIA - DEZ/2035","tipo":"DEB","taxa":"Pré 12,90%","vencimento":"15/12/2035","valorAplicado":4237.96,"posicaoAtual":4456.46,"rendimento":949.89,"risco":"Médio","riscoNumero":20,"grupo":"18,6% | Prefixado","posicaoTaxaCompra":"R$ 4.456,46","taxaCompra":"Pré 12,90%","dataAplicacao":"20/08/2024","minhaPosicao":{"Valor Líquido":"R$ 4.456,46","Rendimento Bruto":"R$ 949,89","Rendimento Líquido":"R$ 949,89","Garantia":"0","Quantidade":"4"},"caracteristicas":{"Liquidez":"15/12/2035","Juros":"Semestral","Amortização":"VENCIMENTO","Ticker/Código":"ORIG21","Rating":"Fitch - A","Taxa de compra":"+12,90%"},"eventos":[{"data":"16/12/2024","juros":"R$ 278,13","amortizacao":"R$ 0,00","premio":"R$ 0,00"}]},
  {"nome":"DEB V.TAL - ABR/2032","tipo":"DEB","taxa":"Pré 14,55%","vencimento":"15/04/2032","valorAplicado":8151.16,"posicaoAtual":8284.81,"rendimento":1140.92,"risco":"Médio","riscoNumero":20,"grupo":"18,6% | Prefixado","alocacaoPct":"3,16%","posicaoTaxaCompra":"R$ 8.284,81","taxaCompra":"Pré 14,55%","dataAplicacao":"03/06/2025","minhaPosicao":{"Valor Líquido":"R$ 8.284,81","Rendimento Bruto":"R$ 1.140,92","Rendimento Líquido":"R$ 1.140,92","Garantia":"0","Quantidade":"8"},"caracteristicas":{"Liquidez":"15/04/2032","Juros":"Semestral","Amortização":"VENCIMENTO","Ticker/Código":"BTEL13","Rating":"S&P - brAA+","Taxa de compra":"+14,55%"},"eventos":[{"data":"15/10/2025","juros":"R$ 500,14","amortizacao":"R$ 0,00","premio":"R$ 0,00"}]},
  {"nome":"CRI PATRIMAR - ABR/2029","tipo":"CRI","taxa":"CDI +2,00%","vencimento":"24/04/2029","valorAplicado":6863.17,"posicaoAtual":7032,"rendimento":1655.99,"risco":"Médio","riscoNumero":20,"grupo":"10% | Pós-Fixado","alocacaoPct":"2,68%","posicaoTaxaCompra":"R$ 7.032,00","taxaCompra":"CDI +2,00%","dataAplicacao":"22/11/2024","minhaPosicao":{"Valor Líquido":"R$ 7.032,00","Rendimento Bruto":"R$ 1.655,99","Rendimento Líquido":"R$ 1.655,99","Garantia":"0","Quantidade":"7"},"caracteristicas":{"Liquidez":"24/04/2029","Juros":"Semestral","Amortização":"VENCIMENTO","Ticker/Código":"24D2688431","Rating":"-","Taxa de compra":"CDI +2,00%"},"eventos":[{"data":"24/04/2025","juros":"R$ 460,81","amortizacao":"R$ 0,00","premio":"R$ 0,00"}]},
  {"nome":"CRA BTG - SET/2033","tipo":"CRA","taxa":"97,50% CDI","vencimento":"15/09/2033","valorAplicado":6455.7,"posicaoAtual":6639.1,"rendimento":1479.13,"risco":"Médio","riscoNumero":20,"grupo":"10% | Pós-Fixado","alocacaoPct":"2,53%","posicaoTaxaCompra":"R$ 6.639,10","taxaCompra":"97,50% CDI","dataAplicacao":"17/09/2024","minhaPosicao":{"Valor Líquido":"R$ 6.639,10","Rendimento Bruto":"R$ 1.479,13","Rendimento Líquido":"R$ 1.479,13","Garantia":"0","Quantidade":"6"},"caracteristicas":{"Liquidez":"15/09/2033","Juros":"Semestral","Amortização":"VENCIMENTO","Ticker/Código":"CRA02300HWH","Rating":"-","Taxa de compra":"97,50% CDI"},"eventos":[{"data":"17/03/2025","juros":"R$ 367,95","amortizacao":"R$ 0,00","premio":"R$ 0,00"}]},
  {"nome":"DEB SIMPAR - JAN/2031","tipo":"DEB","taxa":"CDI +3,40%","vencimento":"15/01/2031","valorAplicado":6012.79,"posicaoAtual":6342.77,"rendimento":1581.37,"risco":"Médio","riscoNumero":20,"grupo":"10% | Pós-Fixado","alocacaoPct":"2,44%","posicaoTaxaCompra":"R$ 6.412,76","taxaCompra":"CDI +3,40%","dataAplicacao":"23/10/2024","minhaPosicao":{"Valor Líquido":"R$ 6.342,77","Rendimento Bruto":"R$ 1.651,36","Rendimento Líquido":"R$ 1.581,37","Garantia":"0","Quantidade":"6"},"caracteristicas":{"Liquidez":"15/01/2031","Juros":"Semestral","Amortização":"VENCIMENTO","Ticker/Código":"JSMLA5","Rating":"Fitch - AAA","Taxa de compra":"CDI +3,40%"},"eventos":[{"data":"15/01/2025","juros":"R$ 435,27","amortizacao":"R$ 0,00","premio":"R$ 0,00"}]},
  {"nome":"CRA FS FLORESTAL - MAR/2031","tipo":"CRA","taxa":"CDI +3,00%","vencimento":"17/03/2031","valorAplicado":6000,"posicaoAtual":6051.01,"rendimento":51.01,"risco":"Médio","riscoNumero":20,"grupo":"10% | Pós-Fixado","alocacaoPct":"2,31%","posicaoTaxaCompra":"R$ 6.051,01","taxaCompra":"CDI +3,00%","dataAplicacao":"26/03/2025"},
  {"nome":"CRA SEARA (JBS) - OUT/2035","tipo":"CRA","taxa":"PTAX +5,30%","vencimento":"03/10/2035","valorAplicado":5000,"posicaoAtual":4699.49,"rendimento":-172.07,"risco":"Médio","riscoNumero":20,"grupo":"1,8% | Renda Fixa Global","alocacaoPct":"1,79%","posicaoTaxaCompra":"R$ 4.699,49","taxaCompra":"PTAX +5,30%","dataAplicacao":"05/11/2025","minhaPosicao":{"Valor Líquido":"R$ 4.699,49","Rendimento Bruto":"-R$ 172,07","Rendimento Líquido":"-R$ 172,07","Garantia":"0","Quantidade":"5"},"caracteristicas":{"Liquidez":"03/10/2035","Juros":"-","Amortização":"VENCIMENTO","Ticker/Código":"CRA0250099D","Rating":"Moody´s - AAA.br","Taxa de compra":"DOLAR PTAX +5,30%"},"eventos":[{"data":"06/04/2026","juros":"R$ 128,43","amortizacao":"R$ 0,00","premio":"R$ 0,00"}]},
];

export const fundos: Fundo[] = [
  {"nome":"Occam Liquidez FIC FIF RF CP RL","aplicado":25965.13,"atual":26848.23,"liquidez":"D+0","risco":10,"grupo":"20,8% | Pós-Fixado","alocacaoPct":"10,26%","posicaoTaxaCompra":"R$ 26.923,80","rentabilidadeLiquida":"3,69%","valorLiquido":26848.23,"minhaPosicao":{"Em cotização":"R$ 0,00","Rendimento bruto":"R$ 958,67","Rendimento líquido":"R$ 883,10","IR":"R$ 52,57","IOF":"R$ 23,00"},"caracteristicas":{"Rent. 12 meses":"15,09%","Rent. mês":"0,11%","Tempo resgate (Cotização)":"D+0 (Dias Úteis)","Tempo resgate (Liquidação)":"D+1 (Dias Úteis)","Taxa administração":"0,4%"}},
  {"nome":"SVN FIRF CP RL","aplicado":13268.15,"atual":14120.08,"liquidez":"—","risco":10,"grupo":"20,8% | Pós-Fixado","alocacaoPct":"6,42%","posicaoTaxaCompra":"R$ 14.167,81","rentabilidadeLiquida":"6,78%","valorLiquido":14120.08},
  {"nome":"XP Referenciado FIF RF Referenciado DI CP RL","aplicado":12526.31,"atual":13344.34,"liquidez":"D+0","risco":10,"grupo":"20,8% | Pós-Fixado","alocacaoPct":"6,53%","posicaoTaxaCompra":"R$ 13.393,14","rentabilidadeLiquida":"6,92%","valorLiquido":13344.34,"minhaPosicao":{"Em cotização":"R$ 0,00","Rendimento bruto":"R$ 866,83","Rendimento líquido":"R$ 818,03","IR":"R$ 48,80","IOF":"R$ 0,00"},"caracteristicas":{"Rent. 12 meses":"14,79%","Rent. mês":"0,16%","Tempo resgate (Cotização)":"D+0 (Dias Úteis)","Tempo resgate (Liquidação)":"D+0 (Dias Úteis)","Taxa administração":"0,3%"}},
];

/** Total em investimentos (posição atual: renda fixa + fundos), sem marcação a mercado. */
export function getTotalInvestimentosAtual(): number {
  const totalRendaFixa = ativosRendaFixa.reduce((sum, a) => sum + a.posicaoAtual, 0);
  const totalFundos = fundos.reduce((sum, f) => sum + f.atual, 0);
  return totalRendaFixa + totalFundos;
}
