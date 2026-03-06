// Dados dos investimentos (mesmos da página Investimentos)
export interface Ativo {
  nome: string;
  tipo: string;
  taxa: string;
  vencimento: string;
  valorAplicado: number;
  posicaoAtual: number;
  rendimento: number;
  risco: string;
  riscoNumero: number;
}

export interface Fundo {
  nome: string;
  aplicado: number;
  atual: number;
  liquidez: string;
  risco: number;
}

const ativosRendaFixa: Ativo[] = [
  { nome: "NTN-B 2035", tipo: "Tesouro", taxa: "IPCA + 6,13%", vencimento: "15/05/2035", valorAplicado: 17134.82, posicaoAtual: 18695.86, rendimento: 3148.74, risco: "Médio", riscoNumero: 18 },
  { nome: "CDB Banco C6", tipo: "CDB", taxa: "IPCA + 8,05%", vencimento: "19/01/2032", valorAplicado: 10000.00, posicaoAtual: 10156.66, rendimento: 156.66, risco: "Baixo", riscoNumero: 10 },
  { nome: "CDB Banco C6", tipo: "CDB", taxa: "IPCA + 7,85%", vencimento: "12/01/2032", valorAplicado: 19000.00, posicaoAtual: 19306.96, rendimento: 306.96, risco: "Baixo", riscoNumero: 10 },
  { nome: "CDB BTG Pactual", tipo: "CDB", taxa: "Pré 12,05%", vencimento: "18/07/2030", valorAplicado: 12000.00, posicaoAtual: 14433.69, rendimento: 2433.69, risco: "Médio", riscoNumero: 12 },
  { nome: "CRA FS BIO", tipo: "CRA", taxa: "IPCA + 8,30%", vencimento: "15/10/2029", valorAplicado: 12917.06, posicaoAtual: 13806.81, rendimento: 2684.47, risco: "Alto", riscoNumero: 27 },
  { nome: "CRA Minerva", tipo: "CRA", taxa: "Pré 14,25%", vencimento: "16/07/2035", valorAplicado: 11381.63, posicaoAtual: 11547.34, rendimento: 893.94, risco: "Alto", riscoNumero: 30 },
  { nome: "CRA Minerva", tipo: "CRA", taxa: "Pré 13,95%", vencimento: "16/11/2034", valorAplicado: 9816.98, posicaoAtual: 9650.93, rendimento: 1047.44, risco: "Alto", riscoNumero: 29 },
  { nome: "CRA Jalles", tipo: "CRA", taxa: "IPCA + 8,20%", vencimento: "06/10/2032", valorAplicado: 13250.90, posicaoAtual: 13782.48, rendimento: 531.57, risco: "Médio", riscoNumero: 23 },
  { nome: "CRA Seara (JBS)", tipo: "CRA", taxa: "IPCA + 8,03%", vencimento: "15/10/2065", valorAplicado: 5000.00, posicaoAtual: 5190.77, rendimento: 190.77, risco: "Alto", riscoNumero: 28 },
  { nome: "CRA Seara (JBS)", tipo: "CRA", taxa: "IPCA + 7,55%", vencimento: "17/05/2055", valorAplicado: 16776.03, posicaoAtual: 17196.86, rendimento: 994.63, risco: "Alto", riscoNumero: 28 },
  { nome: "CRA Seara (JBS)", tipo: "CRA", taxa: "PTAX + 5,30%", vencimento: "03/10/2035", valorAplicado: 5000.00, posicaoAtual: 4937.67, rendimento: -62.33, risco: "Médio", riscoNumero: 15 },
  { nome: "CRA BTG", tipo: "CRA", taxa: "97,50% CDI", vencimento: "15/09/2033", valorAplicado: 6458.65, posicaoAtual: 6881.08, rendimento: 1253.20, risco: "Alto", riscoNumero: 28 },
  { nome: "CRA FS Florestal", tipo: "CRA", taxa: "CDI + 3,00%", vencimento: "17/03/2031", valorAplicado: 6000.00, posicaoAtual: 6044.28, rendimento: 950.74, risco: "Alto", riscoNumero: 26 },
  { nome: "CRI Patrimar", tipo: "CRI", taxa: "CDI + 2,00%", vencimento: "24/04/2029", valorAplicado: 6938.10, posicaoAtual: 7304.16, rendimento: 1382.88, risco: "Médio", riscoNumero: 19 },
  { nome: "DEB Igua", tipo: "DEB", taxa: "IPCA + 8,56%", vencimento: "15/02/2044", valorAplicado: 10405.96, posicaoAtual: 11229.14, rendimento: 823.18, risco: "Alto", riscoNumero: 39 },
  { nome: "DEB Mae", tipo: "DEB", taxa: "Pré 14,55%", vencimento: "15/04/2032", valorAplicado: 8215.39, posicaoAtual: 8579.62, rendimento: 864.36, risco: "Alto", riscoNumero: 29 },
  { nome: "DEB Simpar", tipo: "DEB", taxa: "CDI + 3,40%", vencimento: "15/01/2031", valorAplicado: 6255.73, posicaoAtual: 6154.96, rendimento: 1393.57, risco: "Médio", riscoNumero: 17 },
  { nome: "DEB Aegea Rio", tipo: "DEB", taxa: "IPCA + 8,05%", vencimento: "15/09/2042", valorAplicado: 3261.34, posicaoAtual: 3501.12, rendimento: 493.38, risco: "Alto", riscoNumero: 39 },
  { nome: "DEB Origem", tipo: "DEB", taxa: "Pré 12,90%", vencimento: "15/12/2035", valorAplicado: 4337.92, posicaoAtual: 4327.48, rendimento: 820.90, risco: "Alto", riscoNumero: 35 },
];

const fundos: Fundo[] = [
  { nome: "XP Referenciado DI CP RL", aplicado: 12645, atual: 13061.98, liquidez: "D+0", risco: 2 },
  { nome: "Occam Liquidez FIC FIF", aplicado: 13485, atual: 13931.97, liquidez: "D+0", risco: 12 },
  { nome: "SVN FIRF CP RL", aplicado: 13393, atual: 13818.82, liquidez: "D+5", risco: 11 },
];

// CDI estimado (aproximação baseada em Selic atual)
const CDI_ESTIMADO = 10.5;

/**
 * Converte uma string de taxa para valor numérico anual
 * Exemplos: "IPCA + 6,13%" -> inflacao + 6.13
 *           "Pré 12,05%" -> 12.05
 *           "CDI + 3,00%" -> CDI_ESTIMADO + 3.00
 *           "97,50% CDI" -> CDI_ESTIMADO * 0.975
 *           "PTAX + 5,30%" -> ptax + 5.30
 */
function parseTaxa(taxaStr: string, inflacao: number, ptax: number): number {
  const taxa = taxaStr.trim();
  
  // IPCA + X% (usa o parâmetro configurável de inflação)
  if (taxa.includes("IPCA +")) {
    const match = taxa.match(/IPCA\s*\+\s*([\d,]+)%/);
    if (match) {
      const valor = parseFloat(match[1].replace(",", "."));
      return inflacao + valor; // inflacao vem do contexto e pode ser alterado pelo usuário
    }
  }
  
  // Pré X%
  if (taxa.startsWith("Pré")) {
    const match = taxa.match(/Pré\s*([\d,]+)%/);
    if (match) {
      return parseFloat(match[1].replace(",", "."));
    }
  }
  
  // CDI + X%
  if (taxa.includes("CDI +")) {
    const match = taxa.match(/CDI\s*\+\s*([\d,]+)%/);
    if (match) {
      const valor = parseFloat(match[1].replace(",", "."));
      return CDI_ESTIMADO + valor;
    }
  }
  
  // X% CDI (ex: "97,50% CDI" significa 97.50% do CDI)
  if (taxa.includes("CDI") && !taxa.includes("CDI +")) {
    // Padrão: "97,50% CDI" ou "97.50% CDI"
    const match = taxa.match(/([\d,]+)%?\s*CDI/);
    if (match) {
      const percentual = parseFloat(match[1].replace(",", "."));
      // Se o número é maior que 1, assume que está em percentual (ex: 97.50%)
      // Se é menor que 1, assume que está em decimal (ex: 0.975)
      return percentual > 1 ? CDI_ESTIMADO * (percentual / 100) : CDI_ESTIMADO * percentual;
    }
  }
  
  // PTAX + X%
  if (taxa.includes("PTAX +")) {
    const match = taxa.match(/PTAX\s*\+\s*([\d,]+)%/);
    if (match) {
      const valor = parseFloat(match[1].replace(",", "."));
      return ptax + valor;
    }
  }
  
  // Fallback: tenta extrair qualquer número percentual
  const match = taxa.match(/([\d,]+)%/);
  if (match) {
    return parseFloat(match[1].replace(",", "."));
  }
  
  // Se não conseguir parsear, retorna CDI como padrão conservador
  return CDI_ESTIMADO;
}

/**
 * Calcula a rentabilidade média ponderada da carteira de investimentos
 * baseada nas taxas contratuais e valores investidos
 */
export function calcularRentabilidadeMediaPonderada(inflacao: number, ptax: number): number {
  let totalValor = 0;
  let somaPonderada = 0;
  
  // Processa ativos de renda fixa
  for (const ativo of ativosRendaFixa) {
    const taxaAnual = parseTaxa(ativo.taxa, inflacao, ptax);
    const peso = ativo.posicaoAtual;
    somaPonderada += taxaAnual * peso;
    totalValor += peso;
  }
  
  // Processa fundos (assumindo rentabilidade próxima ao CDI para fundos DI)
  // Para fundos, vamos usar uma estimativa conservadora baseada no CDI
  for (const fundo of fundos) {
    const taxaAnual = CDI_ESTIMADO; // Fundos DI geralmente seguem CDI
    const peso = fundo.atual;
    somaPonderada += taxaAnual * peso;
    totalValor += peso;
  }
  
  if (totalValor === 0) return 0;
  
  const rentabilidadeMedia = somaPonderada / totalValor;
  return Math.round(rentabilidadeMedia * 100) / 100; // Arredonda para 2 casas decimais
}
