import { ativosRendaFixa, fundos } from "@/data/investimentos-data";

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
