/**
 * Configuração de domínio para o Planejamento Tributário (Simples Nacional).
 * Constantes, tabelas dos Anexos III e V e helpers de cálculo puros.
 *
 * Aviso: valores e regras são uma referência de apoio à decisão; não substituem
 * a orientação do contador responsável.
 */

export const salarioMinimo = 1621;
export const aliquotaINSSProLabore = 0.11;
/** INSS mensal do pró-labore de 1 salário mínimo (11% de R$ 1.621,00). */
export const inssProLaboreMensal = Number((salarioMinimo * aliquotaINSSProLabore).toFixed(2));

/** Fator R mínimo (28%) para enquadrar atividades dependentes no Anexo III. */
export const fatorRMinimo = 0.28;
/** Presunção de lucro para serviços (32% da receita bruta). */
export const presuncaoLucroServicos = 0.32;

export interface FaixaSimples {
  faixa: number;
  /** Limite superior do RBT12 da faixa (R$). */
  limite: number;
  /** Alíquota nominal (fração, ex.: 0.112 = 11,20%). */
  aliquotaNominal: number;
  /** Parcela a deduzir (R$). */
  deducao: number;
}

export const tabelaAnexoIII: FaixaSimples[] = [
  { faixa: 1, limite: 180000, aliquotaNominal: 0.06, deducao: 0 },
  { faixa: 2, limite: 360000, aliquotaNominal: 0.112, deducao: 9360 },
  { faixa: 3, limite: 720000, aliquotaNominal: 0.135, deducao: 17640 },
  { faixa: 4, limite: 1800000, aliquotaNominal: 0.16, deducao: 35640 },
  { faixa: 5, limite: 3600000, aliquotaNominal: 0.21, deducao: 125640 },
  { faixa: 6, limite: 4800000, aliquotaNominal: 0.33, deducao: 648000 },
];

export const tabelaAnexoV: FaixaSimples[] = [
  { faixa: 1, limite: 180000, aliquotaNominal: 0.155, deducao: 0 },
  { faixa: 2, limite: 360000, aliquotaNominal: 0.18, deducao: 4500 },
  { faixa: 3, limite: 720000, aliquotaNominal: 0.195, deducao: 9900 },
  { faixa: 4, limite: 1800000, aliquotaNominal: 0.205, deducao: 17100 },
  { faixa: 5, limite: 3600000, aliquotaNominal: 0.23, deducao: 62100 },
  { faixa: 6, limite: 4800000, aliquotaNominal: 0.305, deducao: 540000 },
];

export interface AtividadeSecundaria {
  cnae: string;
  descricao: string;
  /** Atividade que depende do Fator R (cairia no Anexo V se a folha < 28%). */
  dependeFatorR: boolean;
}

export interface InfoEmpresa {
  nomeFantasia: string;
  razaoSocial: string;
  cnpj: string;
  responsavelFinanceiro: string;
  atividadePrincipal: string;
  atividadesSecundarias: AtividadeSecundaria[];
  tipoAtribuicao: string;
  capitalSocial: number;
  sociosAtivos: number;
  funcionariosCadastrados: number;
}

export const infoEmpresa: InfoEmpresa = {
  nomeFantasia: "MAIA TECNOLOGIA",
  razaoSocial: "MAIA SERVICOS DE INFORMACAO NA INTERNET LTDA",
  cnpj: "49.106.223/0001-27",
  responsavelFinanceiro: "Lucas Maia Veríssimo",
  atividadePrincipal:
    "6399-2/00 - Outras atividades de prestação de serviços de informação não especificadas anteriormente",
  atividadesSecundarias: [
    {
      cnae: "6201-5/01",
      descricao: "Desenvolvimento de programas de computador sob encomenda",
      dependeFatorR: true,
    },
    {
      cnae: "6202-3/00",
      descricao: "Desenvolvimento e licenciamento de programas de computador customizáveis",
      dependeFatorR: true,
    },
    {
      cnae: "6203-1/00",
      descricao: "Desenvolvimento e licenciamento de programas de computador não customizáveis",
      dependeFatorR: true,
    },
    {
      cnae: "6204-0/00",
      descricao: "Consultoria em tecnologia da informação",
      dependeFatorR: true,
    },
    {
      cnae: "6209-1/00",
      descricao: "Suporte técnico, manutenção e outros serviços em tecnologia da informação",
      dependeFatorR: true,
    },
    {
      cnae: "6311-9/00",
      descricao:
        "Tratamento de dados, provedores de serviços de aplicação e serviços de hospedagem na internet",
      dependeFatorR: false,
    },
    {
      cnae: "6319-4/00",
      descricao: "Portais, provedores de conteúdo e outros serviços de informação na internet",
      dependeFatorR: false,
    },
    {
      cnae: "8211-3/00",
      descricao: "Serviços combinados de escritório e apoio administrativo",
      dependeFatorR: false,
    },
  ],
  tipoAtribuicao: "Simples Nacional",
  capitalSocial: 1000,
  sociosAtivos: 1,
  funcionariosCadastrados: 0,
};

/** CNAEs que disparam Fator R (e cairiam no Anexo V com a folha atual). */
export const cnaesFatorR = infoEmpresa.atividadesSecundarias.filter((a) => a.dependeFatorR);

/** Retorna a faixa do Simples correspondente ao RBT12 informado. */
export function faixaPorRBT12(rbt12: number, tabela: FaixaSimples[]): FaixaSimples {
  return tabela.find((f) => rbt12 <= f.limite) ?? tabela[tabela.length - 1];
}

/**
 * Alíquota efetiva = (RBT12 × alíquota nominal − dedução) / RBT12.
 * Retorna fração (ex.: 0.0791 = 7,91%).
 */
export function aliquotaEfetiva(rbt12: number, tabela: FaixaSimples[]): number {
  if (rbt12 <= 0) return 0;
  const f = faixaPorRBT12(rbt12, tabela);
  return (rbt12 * f.aliquotaNominal - f.deducao) / rbt12;
}

/** DAS do mês = receita do mês × alíquota efetiva (calculada sobre o RBT12). */
export function dasDoMes(receitaMes: number, rbt12: number, tabela: FaixaSimples[]): number {
  return receitaMes * aliquotaEfetiva(rbt12, tabela);
}
