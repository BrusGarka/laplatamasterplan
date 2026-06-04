import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, ArrowUpDown, ArrowUp, ArrowDown, ChevronDown } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { usePremissas } from "@/contexts/PremissasContext";
import { useState, useMemo, Fragment } from "react";
import { ativosRendaFixa, fundos } from "@/data/investimentos-data";
import type { AtivoRendaFixa, Fundo } from "@/data/investimentos-data";
import {
  buildGruposCarteira,
  calcularResumosPorGrupo,
  expandRowKey,
  grupoEhSomenteFundos,
  totalGrupo,
  type CarteiraLinha,
} from "@/lib/investimentos-groups";

type Ativo = AtivoRendaFixa;

const RF_COL_COUNT = 24;

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function displayText(value?: string | null) {
  if (!value?.trim()) return <span className="text-muted-foreground">—</span>;
  return <span className="font-mono text-xs whitespace-nowrap">{value}</span>;
}

function pickMp(ativo: AtivoRendaFixa, key: string) {
  return ativo.minhaPosicao?.[key];
}

function pickCar(ativo: AtivoRendaFixa, key: string) {
  return ativo.caracteristicas?.[key];
}

function pickFundoMp(fundo: Fundo, key: string) {
  return fundo.minhaPosicao?.[key];
}

function pickFundoCar(fundo: Fundo, key: string) {
  return fundo.caracteristicas?.[key];
}

function getRiscoBadgeVariant(risco: string): "default" | "secondary" | "destructive" | "outline" {
  if (risco === "Baixo") return "default";
  if (risco === "Médio") return "secondary";
  return "destructive";
}

// CDI estimado (mesmo valor usado no investments-calculator.ts)
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
  if (taxa.includes("IPCA +") || taxa.includes("IPCA+")) {
    const match = taxa.match(/IPCA\s*\+\s*([\d,]+)%/i);
    if (match) {
      const valor = parseFloat(match[1].replace(",", "."));
      return inflacao + valor; // inflacao vem do contexto e pode ser alterado pelo usuário
    }
  }
  
  // Pré X% (case-insensitive e suporta diferentes acentuações)
  if (taxa.match(/^pr[éeé]/i)) {
    const match = taxa.match(/pr[éeé]\s*([\d,]+)%/i);
    if (match) {
      return parseFloat(match[1].replace(",", "."));
    }
  }
  
  // CDI + X%
  if (taxa.includes("CDI +") || taxa.includes("CDI+")) {
    const match = taxa.match(/CDI\s*\+\s*([\d,]+)%/i);
    if (match) {
      const valor = parseFloat(match[1].replace(",", "."));
      return CDI_ESTIMADO + valor;
    }
  }
  
  // X% CDI (ex: "97,50% CDI" significa 97.50% do CDI)
  if (taxa.includes("CDI") && !taxa.match(/CDI\s*\+/i)) {
    const match = taxa.match(/([\d,]+)%?\s*CDI/i);
    if (match) {
      const percentual = parseFloat(match[1].replace(",", "."));
      return percentual > 1 ? CDI_ESTIMADO * (percentual / 100) : CDI_ESTIMADO * percentual;
    }
  }
  
  // PTAX + X%
  if (taxa.includes("PTAX +") || taxa.includes("PTAX+")) {
    const match = taxa.match(/PTAX\s*\+\s*([\d,]+)%/i);
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
 * Calcula o valor de mercado de um título usando a metodologia da XP Investimentos
 * Baseado em: Valor Presente = Valor Futuro / (1 + taxa_mercado_atual)^prazo
 * 
 * A XP calcula trazendo o valor futuro esperado a valor presente usando a taxa
 * de mercado atual (não a taxa contratada). A diferença entre taxa contratada
 * e taxa de mercado causa ágio (valorização) ou deságio (desvalorização).
 * 
 * @param ativo - O ativo financeiro
 * @param inflacao - Taxa de inflação atual (IPCA)
 * @param ptax - Taxa PTAX atual
 * @param variacaoTaxaMercado - Variação percentual da taxa de mercado em relação à contratada
 *                              (ex: 0.5 = mercado está 0.5% acima da taxa contratada)
 * @returns Valor de mercado calculado
 */
function calcularValorMercado(
  ativo: Ativo,
  inflacao: number,
  ptax: number,
  variacaoTaxaMercado: number = 0
): number {
  // Se já tem valor de mercado definido manualmente, usa ele
  if (ativo.valorMercado !== undefined) {
    return ativo.valorMercado;
  }
  
  // Parsear a taxa contratada anual
  const taxaContratada = parseTaxa(ativo.taxa, inflacao, ptax) / 100;
  
  // Calcular taxa de mercado atual (taxa contratada + variação)
  const taxaMercadoAtual = taxaContratada + (variacaoTaxaMercado / 100);
  
  // Parsear a data de vencimento
  const [dia, mes, ano] = ativo.vencimento.split("/").map(Number);
  const dataVencimento = new Date(ano, mes - 1, dia);
  const hoje = new Date();
  
  // Calcular anos restantes até o vencimento
  const anosRestantes = (dataVencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  
  // Se já venceu ou está muito próximo, retorna posição atual
  if (anosRestantes <= 0) {
    return ativo.posicaoAtual;
  }
  
  // Calcular valor futuro esperado usando a taxa contratada
  // VF = VP * (1 + taxa_contratada)^anos
  const valorFuturoEsperado = ativo.valorAplicado * Math.pow(1 + taxaContratada, anosRestantes);
  
  // Trazer valor futuro a valor presente usando taxa de mercado atual
  // VP = VF / (1 + taxa_mercado)^anos
  const valorMercado = valorFuturoEsperado / Math.pow(1 + taxaMercadoAtual, anosRestantes);
  
  return Math.round(valorMercado * 100) / 100;
}

/**
 * Calcula a rentabilidade esperada até o vencimento do papel
 * Retorna o valor esperado no vencimento e a rentabilidade total esperada
 */
function calcularRentabilidadeEsperada(
  ativo: Ativo,
  inflacao: number,
  ptax: number
): { valorEsperado: number; rentabilidadeEsperada: number } {
  // Parsear a taxa anual
  const taxaAnual = parseTaxa(ativo.taxa, inflacao, ptax) / 100; // Converter para decimal
  
  // Parsear a data de vencimento (formato: "DD/MM/YYYY")
  const [dia, mes, ano] = ativo.vencimento.split("/").map(Number);
  const dataVencimento = new Date(ano, mes - 1, dia);
  const hoje = new Date();
  
  // Calcular anos restantes até o vencimento
  const anosRestantes = (dataVencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  
  // Se já venceu ou está muito próximo, retorna valores atuais
  if (anosRestantes <= 0) {
    return {
      valorEsperado: ativo.posicaoAtual,
      rentabilidadeEsperada: 0,
    };
  }
  
  // Calcular valor futuro usando juros compostos: VF = VP * (1 + taxa)^anos
  const valorEsperado = ativo.posicaoAtual * Math.pow(1 + taxaAnual, anosRestantes);
  const rentabilidadeEsperada = valorEsperado - ativo.posicaoAtual;
  
  return {
    valorEsperado: Math.round(valorEsperado * 100) / 100,
    rentabilidadeEsperada: Math.round(rentabilidadeEsperada * 100) / 100,
  };
}

type SortField = 'nome' | 'tipo' | 'taxa' | 'taxaEsperada' | 'vencimento' | 'valorAplicado' | 'posicaoAtual' | 'rendimento' | 'rentabilidadeEsperada' | 'risco' | null;
type SortDirection = 'asc' | 'desc' | null;

function compareAtivos(
  a: Ativo,
  b: Ativo,
  field: SortField,
  inflacao: number,
  ptax: number,
  marcacaoMercado: boolean
): number {
  if (!field) return 0;
  let aValue: string | number;
  let bValue: string | number;

  switch (field) {
    case "nome":
      aValue = a.nome.toLowerCase();
      bValue = b.nome.toLowerCase();
      break;
    case "tipo":
      aValue = a.tipo.toLowerCase();
      bValue = b.tipo.toLowerCase();
      break;
    case "taxa":
    case "taxaEsperada":
      aValue = parseTaxa(a.taxa, inflacao, ptax);
      bValue = parseTaxa(b.taxa, inflacao, ptax);
      break;
    case "vencimento": {
      const [diaA, mesA, anoA] = a.vencimento.split("/").map(Number);
      const [diaB, mesB, anoB] = b.vencimento.split("/").map(Number);
      aValue = new Date(anoA, mesA - 1, diaA).getTime();
      bValue = new Date(anoB, mesB - 1, diaB).getTime();
      break;
    }
    case "valorAplicado":
      aValue = a.valorAplicado;
      bValue = b.valorAplicado;
      break;
    case "posicaoAtual":
      aValue =
        marcacaoMercado && a.valorMercado !== undefined ? a.valorMercado : a.posicaoAtual;
      bValue =
        marcacaoMercado && b.valorMercado !== undefined ? b.valorMercado : b.posicaoAtual;
      break;
    case "rendimento":
      if (marcacaoMercado) {
        aValue =
          (a.valorMercado !== undefined ? a.valorMercado : a.posicaoAtual) - a.valorAplicado;
        bValue =
          (b.valorMercado !== undefined ? b.valorMercado : b.posicaoAtual) - b.valorAplicado;
      } else {
        aValue = a.rendimento;
        bValue = b.rendimento;
      }
      break;
    case "rentabilidadeEsperada":
      aValue = calcularRentabilidadeEsperada(a, inflacao, ptax).rentabilidadeEsperada;
      bValue = calcularRentabilidadeEsperada(b, inflacao, ptax).rentabilidadeEsperada;
      break;
    case "risco":
      aValue = a.riscoNumero;
      bValue = b.riscoNumero;
      break;
    default:
      return 0;
  }

  if (aValue < bValue) return -1;
  if (aValue > bValue) return 1;
  return 0;
}

function compareFundos(a: Fundo, b: Fundo, field: SortField): number {
  if (!field) return 0;
  let aValue: string | number;
  let bValue: string | number;
  switch (field) {
    case "nome":
      aValue = a.nome.toLowerCase();
      bValue = b.nome.toLowerCase();
      break;
    case "valorAplicado":
      aValue = a.aplicado;
      bValue = b.aplicado;
      break;
    case "posicaoAtual":
    case "rendimento":
      aValue = a.atual;
      bValue = b.atual;
      break;
    default:
      aValue = a.nome.toLowerCase();
      bValue = b.nome.toLowerCase();
  }
  if (aValue < bValue) return -1;
  if (aValue > bValue) return 1;
  return 0;
}

function sortLinhasGrupo(
  linhas: CarteiraLinha[],
  sortField: SortField,
  sortDirection: SortDirection,
  inflacao: number,
  ptax: number,
  marcacaoMercado: boolean
): CarteiraLinha[] {
  if (!sortField || !sortDirection) return linhas;
  const dir = sortDirection === "asc" ? 1 : -1;
  const somenteFundos = grupoEhSomenteFundos(linhas);
  return [...linhas].sort((la, lb) => {
    if (somenteFundos && la.tipo === "fundo" && lb.tipo === "fundo") {
      return compareFundos(la.fundo, lb.fundo, sortField) * dir;
    }
    if (la.tipo === "rendaFixa" && lb.tipo === "rendaFixa") {
      return compareAtivos(la.ativo, lb.ativo, sortField, inflacao, ptax, marcacaoMercado) * dir;
    }
    return 0;
  });
}

export default function Investimentos() {
  const { inflacao, ptax } = usePremissas();
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [marcacaoMercado, setMarcacaoMercado] = useState(false);
  const [expandedRfRows, setExpandedRfRows] = useState<Set<string>>(new Set());

  const toggleRfExpand = (key: string) => {
    setExpandedRfRows((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };
  
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const gruposCarteira = useMemo(
    () => buildGruposCarteira(ativosRendaFixa, fundos),
    []
  );

  const gruposExibicao = useMemo(
    () =>
      gruposCarteira.map((grupo) => ({
        ...grupo,
        linhas: sortLinhasGrupo(
          grupo.linhas,
          sortField,
          sortDirection,
          inflacao,
          ptax,
          marcacaoMercado
        ),
      })),
    [gruposCarteira, sortField, sortDirection, inflacao, ptax, marcacaoMercado]
  );
  
  // Calcular totais considerando marcação a mercado
  const totalRendaFixa = useMemo(() => {
    return ativosRendaFixa.reduce((sum, a) => {
      const valor = marcacaoMercado && a.valorMercado !== undefined ? a.valorMercado : a.posicaoAtual;
      return sum + valor;
    }, 0);
  }, [marcacaoMercado]);
  
  const totalFundos = fundos.reduce((sum, f) => sum + f.atual, 0);
  const totalGeral = totalRendaFixa + totalFundos;

  const resumosPorGrupo = useMemo(
    () => calcularResumosPorGrupo(gruposCarteira, totalGeral, marcacaoMercado),
    [gruposCarteira, totalGeral, marcacaoMercado]
  );
  
  const totalRendimentoRendaFixa = useMemo(() => {
    return ativosRendaFixa.reduce((sum, a) => {
      const valorAtual = marcacaoMercado && a.valorMercado !== undefined ? a.valorMercado : a.posicaoAtual;
      return sum + (valorAtual - a.valorAplicado);
    }, 0);
  }, [marcacaoMercado]);
  
  const totalRendimentoFundos = fundos.reduce((sum, f) => sum + (f.atual - f.aplicado), 0);
  
  // Calcular diferença de marcação a mercado
  const diferencaMarcacaoMercado = useMemo(() => {
    return ativosRendaFixa.reduce((sum, a) => {
      if (a.valorMercado !== undefined) {
        return sum + (a.valorMercado - a.posicaoAtual);
      }
      return sum;
    }, 0);
  }, []);
  
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="ml-1 h-3 w-3" />;
    }
    if (sortDirection === 'desc') {
      return <ArrowDown className="ml-1 h-3 w-3" />;
    }
    return <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />;
  };

  return (
    <div className="min-h-screen gradient-mesh">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Investimentos</h1>
            </div>
            <p className="text-sm text-muted-foreground ml-12">
              Detalhamento completo da carteira de investimentos
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Label htmlFor="marcacao-mercado" className="text-sm font-medium cursor-pointer">
              Marcação a Mercado
            </Label>
            <Switch
              id="marcacao-mercado"
              checked={marcacaoMercado}
              onCheckedChange={setMarcacaoMercado}
            />
          </div>
        </motion.header>

        {/* Resumo Geral */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total em Renda Fixa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatBRL(totalRendaFixa)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Rendimento: <span className="text-primary font-semibold">
                  {formatBRL(totalRendimentoRendaFixa)}
                </span>
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total em Fundos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatBRL(totalFundos)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Rendimento: <span className="text-primary font-semibold">
                  {formatBRL(totalRendimentoFundos)}
                </span>
              </p>
            </CardContent>
          </Card>
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Geral</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{formatBRL(totalGeral)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Rendimento Total: <span className="text-primary font-semibold">
                  {formatBRL(totalRendimentoRendaFixa + totalRendimentoFundos)}
                </span>
              </p>
              {marcacaoMercado && diferencaMarcacaoMercado !== 0 && (
                <p className={`text-xs mt-1 font-semibold ${
                  diferencaMarcacaoMercado >= 0 ? "text-primary" : "text-destructive"
                }`}>
                  Dif. Marcação: {diferencaMarcacaoMercado >= 0 ? "+" : ""}
                  {formatBRL(diferencaMarcacaoMercado)}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Resumo por agrupamento XP */}
        <div>
          <p className="text-xs text-muted-foreground mb-3">
            Por bloco da carteira (mesmos agrupamentos da grade XLS)
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {resumosPorGrupo.map((resumo) => (
              <Card key={resumo.grupo} className="border-border/80">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm font-semibold leading-snug">
                      {resumo.nomeGrupo}
                    </CardTitle>
                    <Badge variant={resumo.somenteFundos ? "secondary" : "outline"} className="shrink-0 text-[10px]">
                      {resumo.somenteFundos ? "Fundos" : "RF"}
                    </Badge>
                  </div>
                  {resumo.pctXp !== null && (
                    <CardDescription className="text-xs">
                      Alocação XP: {resumo.pctXp.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="text-xl font-bold tracking-tight">
                    {formatBRL(resumo.posicao)}
                  </div>
                  <p className="text-muted-foreground">
                    <span className="font-semibold text-foreground">{resumo.qtdPapeis}</span>
                    {resumo.qtdPapeis === 1
                      ? resumo.somenteFundos
                        ? " fundo"
                        : " papel"
                      : resumo.somenteFundos
                        ? " fundos"
                        : " papéis"}
                    {" · "}
                    <span className="font-medium text-foreground">
                      {resumo.pctRealCarteira.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%
                    </span>{" "}
                    da carteira
                  </p>
                  <p>
                    Aplicado:{" "}
                    <span className="font-mono font-medium">{formatBRL(resumo.aplicado)}</span>
                  </p>
                  <p>
                    Rendimento:{" "}
                    <span
                      className={`font-mono font-semibold ${
                        resumo.rendimento >= 0 ? "text-primary" : "text-destructive"
                      }`}
                    >
                      {resumo.rendimento >= 0 ? "+" : ""}
                      {formatBRL(resumo.rendimento)}
                    </span>
                    {!resumo.somenteFundos && resumo.aplicado > 0 && (
                      <span className="text-muted-foreground ml-1">
                        ({resumo.rentabilidadeSobreAplicado.toLocaleString("pt-BR", {
                          maximumFractionDigits: 2,
                        })}
                        % s/ aplicado)
                      </span>
                    )}
                  </p>
                  {resumo.somenteFundos && resumo.rentMediaLiquidaPct !== null && (
                    <p className="text-muted-foreground">
                      Rent. líquida média:{" "}
                      <span className="font-semibold text-foreground">
                        {resumo.rentMediaLiquidaPct.toLocaleString("pt-BR", {
                          maximumFractionDigits: 2,
                        })}
                        %
                      </span>
                    </p>
                  )}
                  {resumo.pctXp !== null &&
                    Math.abs(resumo.pctRealCarteira - resumo.pctXp) > 0.5 && (
                      <p className="text-[10px] text-muted-foreground/80 pt-1 border-t border-border/50">
                        % real ({resumo.pctRealCarteira.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%)
                        difere do rótulo XP — normal após marcação ou atualização parcial.
                      </p>
                    )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Carteira por agrupamentos XP */}
        <Card>
          <CardHeader>
            <CardTitle>Carteira XP — por agrupamento</CardTitle>
            <CardDescription>
              Mesma ordem e grupos da grade XLS ({gruposExibicao.length} blocos). Fundos ficam em{" "}
              <span className="font-medium">20,8% | Pós-Fixado</span>, separados do bloco{" "}
              <span className="font-medium">10% | Pós-Fixado</span> (renda fixa).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-10">
            {gruposExibicao.map((grupo) => {
              const ehFundos = grupoEhSomenteFundos(grupo.linhas);
              const subtotal = totalGrupo(grupo.linhas, marcacaoMercado);
              const qtd = grupo.linhas.length;

              return (
                <section key={grupo.grupo} className="space-y-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold tracking-tight">{grupo.grupo}</h3>
                      <Badge variant="outline" className="text-xs font-normal">
                        {ehFundos ? "Fundos" : "Renda fixa"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {qtd} {qtd === 1 ? "linha" : "linhas"} · Subtotal{" "}
                      <span className="font-mono font-semibold text-foreground">
                        {formatBRL(subtotal)}
                      </span>
                    </p>
                  </div>

                  {ehFundos ? (
                    <ScrollArea className="w-full rounded-md border">
                      <div className="min-w-[1700px]">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead
                                className="min-w-[220px] cursor-pointer hover:bg-secondary/50 select-none"
                                onClick={() => handleSort("nome")}
                              >
                                <div className="flex items-center">Fundo{getSortIcon("nome")}</div>
                              </TableHead>
                              <TableHead className="text-right">% Alocação</TableHead>
                              <TableHead className="text-right">Posição</TableHead>
                              <TableHead className="text-right">Rent. bruta %</TableHead>
                              <TableHead className="text-right">Rent. líquida %</TableHead>
                              <TableHead
                                className="text-right cursor-pointer hover:bg-secondary/50 select-none"
                                onClick={() => handleSort("valorAplicado")}
                              >
                                <div className="flex items-center justify-end">
                                  Valor aplicado{getSortIcon("valorAplicado")}
                                </div>
                              </TableHead>
                              <TableHead className="text-right">Valor líquido</TableHead>
                              <TableHead
                                className="text-right cursor-pointer hover:bg-secondary/50 select-none"
                                onClick={() => handleSort("posicaoAtual")}
                              >
                                <div className="flex items-center justify-end">
                                  Posição{getSortIcon("posicaoAtual")}
                                </div>
                              </TableHead>
                              <TableHead className="text-right">Rend. bruto</TableHead>
                              <TableHead className="text-right">Rend. líquido</TableHead>
                              <TableHead className="text-right">IR</TableHead>
                              <TableHead className="text-right">IOF</TableHead>
                              <TableHead className="text-right">Em cotização</TableHead>
                              <TableHead className="text-right">Rent. 12 meses</TableHead>
                              <TableHead className="text-right">Rent. mês</TableHead>
                              <TableHead>Cotização</TableHead>
                              <TableHead>Liquidação</TableHead>
                              <TableHead className="text-right">Taxa adm.</TableHead>
                              <TableHead>Liquidez</TableHead>
                              <TableHead className="text-center">Risco</TableHead>
                              <TableHead className="text-right">Ganho/perda</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {grupo.linhas.map((linha) => {
                              if (linha.tipo !== "fundo") return null;
                              const fundo = linha.fundo;
                              const ganho = fundo.atual - fundo.aplicado;
                              return (
                                <TableRow key={`${grupo.grupo}-${fundo.nome}`}>
                                  <TableCell className="font-medium">{fundo.nome}</TableCell>
                                  <TableCell className="text-right">{displayText(fundo.alocacaoPct)}</TableCell>
                                  <TableCell className="text-right">{displayText(fundo.posicaoTaxaCompra)}</TableCell>
                                  <TableCell className="text-right">{displayText(fundo.rentabilidadeBruta)}</TableCell>
                                  <TableCell className="text-right">{displayText(fundo.rentabilidadeLiquida)}</TableCell>
                                  <TableCell className="text-right font-mono">{formatBRL(fundo.aplicado)}</TableCell>
                                  <TableCell className="text-right font-mono">
                                    {fundo.valorLiquido != null && fundo.valorLiquido > 0
                                      ? formatBRL(fundo.valorLiquido)
                                      : displayText(pickFundoMp(fundo, "Valor líquido"))}
                                  </TableCell>
                                  <TableCell className="text-right font-mono font-semibold">
                                    {formatBRL(fundo.atual)}
                                  </TableCell>
                                  <TableCell className="text-right">{displayText(pickFundoMp(fundo, "Rendimento bruto"))}</TableCell>
                                  <TableCell className="text-right">{displayText(pickFundoMp(fundo, "Rendimento líquido"))}</TableCell>
                                  <TableCell className="text-right">{displayText(pickFundoMp(fundo, "IR"))}</TableCell>
                                  <TableCell className="text-right">{displayText(pickFundoMp(fundo, "IOF"))}</TableCell>
                                  <TableCell className="text-right">{displayText(pickFundoMp(fundo, "Em cotização"))}</TableCell>
                                  <TableCell className="text-right">{displayText(pickFundoCar(fundo, "Rent. 12 meses"))}</TableCell>
                                  <TableCell className="text-right">{displayText(pickFundoCar(fundo, "Rent. mês"))}</TableCell>
                                  <TableCell>{displayText(pickFundoCar(fundo, "Tempo resgate (Cotização)"))}</TableCell>
                                  <TableCell>{displayText(pickFundoCar(fundo, "Tempo resgate (Liquidação)"))}</TableCell>
                                  <TableCell className="text-right">{displayText(pickFundoCar(fundo, "Taxa administração"))}</TableCell>
                                  <TableCell>{fundo.liquidez}</TableCell>
                                  <TableCell className="text-center">
                                    <Badge variant="secondary">{fundo.risco}</Badge>
                                  </TableCell>
                                  <TableCell
                                    className={`text-right font-mono ${
                                      ganho >= 0 ? "text-primary" : "text-destructive"
                                    }`}
                                  >
                                    {ganho >= 0 ? "+" : ""}
                                    {formatBRL(ganho)}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                      <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                  ) : (
                    <ScrollArea className="w-full rounded-md border">
                      <div className="min-w-[2100px]">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead
                        className="min-w-[200px] cursor-pointer hover:bg-secondary/50 select-none sticky left-0 bg-background z-10"
                        onClick={() => handleSort("nome")}
                      >
                        <div className="flex items-center">
                          Ativo
                          {getSortIcon("nome")}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer hover:bg-secondary/50 select-none" onClick={() => handleSort("tipo")}>
                        <div className="flex items-center">Tipo{getSortIcon("tipo")}</div>
                      </TableHead>
                      <TableHead className="text-right">% Alocação</TableHead>
                      <TableHead className="text-right">Pos. taxa compra</TableHead>
                      <TableHead className="text-right cursor-pointer hover:bg-secondary/50 select-none" onClick={() => handleSort("valorAplicado")}>
                        <div className="flex items-center justify-end">Valor aplicado{getSortIcon("valorAplicado")}</div>
                      </TableHead>
                      <TableHead className="cursor-pointer hover:bg-secondary/50 select-none" onClick={() => handleSort("taxa")}>
                        <div className="flex items-center">Taxa compra{getSortIcon("taxa")}</div>
                      </TableHead>
                      <TableHead>Data aplicação</TableHead>
                      <TableHead className="cursor-pointer hover:bg-secondary/50 select-none" onClick={() => handleSort("vencimento")}>
                        <div className="flex items-center">Vencimento{getSortIcon("vencimento")}</div>
                      </TableHead>
                      <TableHead className="text-right">Valor líquido</TableHead>
                      <TableHead className="text-right">Rend. bruto</TableHead>
                      <TableHead className="text-right">Rend. líquido</TableHead>
                      <TableHead className="text-right">Garantia</TableHead>
                      <TableHead className="text-right">Quantidade</TableHead>
                      <TableHead>Liquidez</TableHead>
                      <TableHead>Juros</TableHead>
                      <TableHead>Amortização</TableHead>
                      <TableHead>Ticker / Código</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead className="text-center">Eventos</TableHead>
                      <TableHead className="text-right cursor-pointer hover:bg-secondary/50 select-none" onClick={() => handleSort("taxaEsperada")}>
                        <div className="flex items-center justify-end">Taxa esperada{getSortIcon("taxaEsperada")}</div>
                      </TableHead>
                      <TableHead className="text-right cursor-pointer hover:bg-secondary/50 select-none" onClick={() => handleSort("posicaoAtual")}>
                        <div className="flex items-center justify-end">Posição (líq.){getSortIcon("posicaoAtual")}</div>
                      </TableHead>
                      <TableHead className="text-right cursor-pointer hover:bg-secondary/50 select-none" onClick={() => handleSort("rendimento")}>
                        <div className="flex items-center justify-end">Rendimento{getSortIcon("rendimento")}</div>
                      </TableHead>
                      <TableHead className="text-right cursor-pointer hover:bg-secondary/50 select-none" onClick={() => handleSort("rentabilidadeEsperada")}>
                        <div className="flex items-center justify-end">Rent. esperada{getSortIcon("rentabilidadeEsperada")}</div>
                      </TableHead>
                      <TableHead className="text-center cursor-pointer hover:bg-secondary/50 select-none" onClick={() => handleSort("risco")}>
                        <div className="flex items-center justify-center">Risco{getSortIcon("risco")}</div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                          <TableBody>
                            {grupo.linhas.map((linha) => {
                              if (linha.tipo !== "rendaFixa") return null;
                              const ativo = linha.ativo;
                              const { rentabilidadeEsperada } = calcularRentabilidadeEsperada(
                                ativo,
                                inflacao,
                                ptax
                              );
                              const taxaEsperada = parseTaxa(ativo.taxa, inflacao, ptax);
                              const valorExibido =
                                marcacaoMercado && ativo.valorMercado !== undefined
                                  ? ativo.valorMercado
                                  : ativo.posicaoAtual;
                              const rendimentoExibido = valorExibido - ativo.valorAplicado;
                              const diferencaMarcacao =
                                ativo.valorMercado !== undefined
                                  ? ativo.valorMercado - ativo.posicaoAtual
                                  : 0;
                              const eventos = ativo.eventos ?? [];
                              const expandKey = expandRowKey(grupo.grupo, ativo);
                              const isExpanded = expandedRfRows.has(expandKey);

                              return (
                                <Fragment key={expandKey}>
                                  <TableRow>
                                    <TableCell className="font-medium min-w-[200px] sticky left-0 bg-background z-10">
                              {ativo.nome}
                            </TableCell>
                            <TableCell>{ativo.tipo}</TableCell>
                            <TableCell className="text-right">{displayText(ativo.alocacaoPct)}</TableCell>
                            <TableCell className="text-right">{displayText(ativo.posicaoTaxaCompra)}</TableCell>
                            <TableCell className="text-right font-mono">{formatBRL(ativo.valorAplicado)}</TableCell>
                            <TableCell className="font-mono text-xs">
                              {displayText(ativo.taxaCompra ?? ativo.taxa)}
                            </TableCell>
                            <TableCell className="font-mono text-xs">{displayText(ativo.dataAplicacao)}</TableCell>
                            <TableCell className="font-mono text-xs">{ativo.vencimento}</TableCell>
                            <TableCell className="text-right">{displayText(pickMp(ativo, "Valor Líquido"))}</TableCell>
                            <TableCell className="text-right">{displayText(pickMp(ativo, "Rendimento Bruto"))}</TableCell>
                            <TableCell className="text-right">{displayText(pickMp(ativo, "Rendimento Líquido"))}</TableCell>
                            <TableCell className="text-right">{displayText(pickMp(ativo, "Garantia"))}</TableCell>
                            <TableCell className="text-right">{displayText(pickMp(ativo, "Quantidade"))}</TableCell>
                            <TableCell>{displayText(pickCar(ativo, "Liquidez"))}</TableCell>
                            <TableCell>{displayText(pickCar(ativo, "Juros"))}</TableCell>
                            <TableCell>{displayText(pickCar(ativo, "Amortização"))}</TableCell>
                            <TableCell>{displayText(pickCar(ativo, "Ticker/Código"))}</TableCell>
                            <TableCell>{displayText(pickCar(ativo, "Rating"))}</TableCell>
                            <TableCell className="text-center">
                              {eventos.length > 0 ? (
                                <button
                                  type="button"
                                  onClick={() => toggleRfExpand(expandKey)}
                                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                                >
                                  {eventos.length}
                                  <ChevronDown className={`h-3 w-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                </button>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs font-semibold text-primary">
                              {taxaEsperada.toFixed(2)}% a.a.
                            </TableCell>
                            <TableCell className="text-right font-mono font-semibold">
                              <div className="flex flex-col items-end">
                                <span>{formatBRL(valorExibido)}</span>
                                {marcacaoMercado && ativo.valorMercado !== undefined && diferencaMarcacao !== 0 && (
                                  <span
                                    className={`text-xs ${
                                      diferencaMarcacao >= 0 ? "text-primary" : "text-destructive"
                                    }`}
                                  >
                                    ({diferencaMarcacao >= 0 ? "+" : ""}
                                    {formatBRL(diferencaMarcacao)})
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell
                              className={`text-right font-mono ${
                                rendimentoExibido >= 0 ? "text-primary" : "text-destructive"
                              }`}
                            >
                              {rendimentoExibido >= 0 ? "+" : ""}
                              {formatBRL(rendimentoExibido)}
                            </TableCell>
                            <TableCell
                              className={`text-right font-mono ${
                                rentabilidadeEsperada >= 0 ? "text-primary" : "text-destructive"
                              }`}
                            >
                              {rentabilidadeEsperada >= 0 ? "+" : ""}
                              {formatBRL(rentabilidadeEsperada)}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant={getRiscoBadgeVariant(ativo.risco)}>
                                {ativo.risco} ({ativo.riscoNumero})
                              </Badge>
                            </TableCell>
                          </TableRow>
                          {eventos.length > 0 && isExpanded && (
                            <TableRow>
                              <TableCell colSpan={RF_COL_COUNT} className="bg-muted/30 p-4">
                                <p className="text-xs font-medium mb-2">Eventos</p>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Data</TableHead>
                                      <TableHead className="text-right">Juros</TableHead>
                                      <TableHead className="text-right">Amortização</TableHead>
                                      <TableHead className="text-right">Prêmio</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {eventos.map((ev, evIdx) => (
                                      <TableRow key={evIdx}>
                                        <TableCell className="font-mono text-xs">{ev.data}</TableCell>
                                        <TableCell className="text-right font-mono text-xs">{ev.juros}</TableCell>
                                        <TableCell className="text-right font-mono text-xs">{ev.amortizacao}</TableCell>
                                        <TableCell className="text-right font-mono text-xs">{ev.premio}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableCell>
                            </TableRow>
                          )}
                                </Fragment>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                      <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                  )}
                </section>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
