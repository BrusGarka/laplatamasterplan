import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
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
import { useState, useMemo } from "react";
import { ativosRendaFixa, fundos } from "@/data/investimentos-data";
import type { AtivoRendaFixa } from "@/data/investimentos-data";

type Ativo = AtivoRendaFixa;

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

export default function Investimentos() {
  const { inflacao, ptax } = usePremissas();
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [marcacaoMercado, setMarcacaoMercado] = useState(false);
  
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

  const sortedAtivos = useMemo(() => {
    if (!sortField || !sortDirection) return ativosRendaFixa;
    
    return [...ativosRendaFixa].sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      switch (sortField) {
        case 'nome':
          aValue = a.nome.toLowerCase();
          bValue = b.nome.toLowerCase();
          break;
        case 'tipo':
          aValue = a.tipo.toLowerCase();
          bValue = b.tipo.toLowerCase();
          break;
        case 'taxa':
          aValue = parseTaxa(a.taxa, inflacao, ptax);
          bValue = parseTaxa(b.taxa, inflacao, ptax);
          break;
        case 'taxaEsperada':
          aValue = parseTaxa(a.taxa, inflacao, ptax);
          bValue = parseTaxa(b.taxa, inflacao, ptax);
          break;
        case 'vencimento':
          const [diaA, mesA, anoA] = a.vencimento.split('/').map(Number);
          const [diaB, mesB, anoB] = b.vencimento.split('/').map(Number);
          aValue = new Date(anoA, mesA - 1, diaA).getTime();
          bValue = new Date(anoB, mesB - 1, diaB).getTime();
          break;
        case 'valorAplicado':
          aValue = a.valorAplicado;
          bValue = b.valorAplicado;
          break;
        case 'posicaoAtual':
          aValue = marcacaoMercado && a.valorMercado !== undefined ? a.valorMercado : a.posicaoAtual;
          bValue = marcacaoMercado && b.valorMercado !== undefined ? b.valorMercado : b.posicaoAtual;
          break;
        case 'rendimento':
          if (marcacaoMercado) {
            aValue = (a.valorMercado !== undefined ? a.valorMercado : a.posicaoAtual) - a.valorAplicado;
            bValue = (b.valorMercado !== undefined ? b.valorMercado : b.posicaoAtual) - b.valorAplicado;
          } else {
            aValue = a.rendimento;
            bValue = b.rendimento;
          }
          break;
        case 'rentabilidadeEsperada':
          const rentA = calcularRentabilidadeEsperada(a, inflacao, ptax).rentabilidadeEsperada;
          const rentB = calcularRentabilidadeEsperada(b, inflacao, ptax).rentabilidadeEsperada;
          aValue = rentA;
          bValue = rentB;
          break;
        case 'risco':
          aValue = a.riscoNumero;
          bValue = b.riscoNumero;
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [sortField, sortDirection, inflacao, ptax, marcacaoMercado]);
  
  // Calcular totais considerando marcação a mercado
  const totalRendaFixa = useMemo(() => {
    return ativosRendaFixa.reduce((sum, a) => {
      const valor = marcacaoMercado && a.valorMercado !== undefined ? a.valorMercado : a.posicaoAtual;
      return sum + valor;
    }, 0);
  }, [marcacaoMercado]);
  
  const totalFundos = fundos.reduce((sum, f) => sum + f.atual, 0);
  const totalGeral = totalRendaFixa + totalFundos;
  
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

        {/* Renda Fixa */}
        <Card>
          <CardHeader>
            <CardTitle>Ativos Financeiros – Renda Fixa (XP/SVN)</CardTitle>
            <CardDescription>
              Total em Renda Fixa: {formatBRL(totalRendaFixa)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-secondary/50 select-none"
                      onClick={() => handleSort('nome')}
                    >
                      <div className="flex items-center">
                        Ativo
                        {getSortIcon('nome')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-secondary/50 select-none"
                      onClick={() => handleSort('tipo')}
                    >
                      <div className="flex items-center">
                        Tipo
                        {getSortIcon('tipo')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-secondary/50 select-none"
                      onClick={() => handleSort('taxa')}
                    >
                      <div className="flex items-center">
                        Taxa (Compra)
                        {getSortIcon('taxa')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-right cursor-pointer hover:bg-secondary/50 select-none"
                      onClick={() => handleSort('taxaEsperada')}
                    >
                      <div className="flex items-center justify-end">
                        Taxa Esperada
                        {getSortIcon('taxaEsperada')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-secondary/50 select-none"
                      onClick={() => handleSort('vencimento')}
                    >
                      <div className="flex items-center">
                        Vencimento
                        {getSortIcon('vencimento')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-right cursor-pointer hover:bg-secondary/50 select-none"
                      onClick={() => handleSort('valorAplicado')}
                    >
                      <div className="flex items-center justify-end">
                        Valor Aplicado
                        {getSortIcon('valorAplicado')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-right cursor-pointer hover:bg-secondary/50 select-none"
                      onClick={() => handleSort('posicaoAtual')}
                    >
                      <div className="flex items-center justify-end">
                        Posição Atual
                        {getSortIcon('posicaoAtual')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-right cursor-pointer hover:bg-secondary/50 select-none"
                      onClick={() => handleSort('rendimento')}
                    >
                      <div className="flex items-center justify-end">
                        Rendimento
                        {getSortIcon('rendimento')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-right cursor-pointer hover:bg-secondary/50 select-none"
                      onClick={() => handleSort('rentabilidadeEsperada')}
                    >
                      <div className="flex items-center justify-end">
                        Rentabilidade Esperada
                        {getSortIcon('rentabilidadeEsperada')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-center cursor-pointer hover:bg-secondary/50 select-none"
                      onClick={() => handleSort('risco')}
                    >
                      <div className="flex items-center justify-center">
                        Risco
                        {getSortIcon('risco')}
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedAtivos.map((ativo, idx) => {
                    const { rentabilidadeEsperada } = calcularRentabilidadeEsperada(ativo, inflacao, ptax);
                    const taxaEsperada = parseTaxa(ativo.taxa, inflacao, ptax);
                    const valorExibido = marcacaoMercado && ativo.valorMercado !== undefined 
                      ? ativo.valorMercado 
                      : ativo.posicaoAtual;
                    const rendimentoExibido = valorExibido - ativo.valorAplicado;
                    const diferencaMarcacao = ativo.valorMercado !== undefined 
                      ? ativo.valorMercado - ativo.posicaoAtual 
                      : 0;
                    
                    return (
                      <TableRow key={`${ativo.nome}-${idx}`}>
                        <TableCell className="font-medium">{ativo.nome}</TableCell>
                        <TableCell>{ativo.tipo}</TableCell>
                        <TableCell className="font-mono text-xs">{ativo.taxa}</TableCell>
                        <TableCell className="text-right font-mono text-xs font-semibold text-primary">
                          {taxaEsperada.toFixed(2)}% a.a.
                        </TableCell>
                        <TableCell className="font-mono text-xs">{ativo.vencimento}</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatBRL(ativo.valorAplicado)}
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold">
                          <div className="flex flex-col items-end">
                            <span>{formatBRL(valorExibido)}</span>
                            {marcacaoMercado && ativo.valorMercado !== undefined && diferencaMarcacao !== 0 && (
                              <span className={`text-xs ${
                                diferencaMarcacao >= 0 ? "text-primary" : "text-destructive"
                              }`}>
                                ({diferencaMarcacao >= 0 ? "+" : ""}{formatBRL(diferencaMarcacao)})
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className={`text-right font-mono ${
                          rendimentoExibido >= 0 ? "text-primary" : "text-destructive"
                        }`}>
                          {rendimentoExibido >= 0 ? "+" : ""}{formatBRL(rendimentoExibido)}
                        </TableCell>
                        <TableCell className={`text-right font-mono ${
                          rentabilidadeEsperada >= 0 ? "text-primary" : "text-destructive"
                        }`}>
                          {rentabilidadeEsperada >= 0 ? "+" : ""}{formatBRL(rentabilidadeEsperada)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={getRiscoBadgeVariant(ativo.risco)}>
                            {ativo.risco} ({ativo.riscoNumero})
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Fundos */}
        <Card>
          <CardHeader>
            <CardTitle>Fundos de Investimento (Liquidez)</CardTitle>
            <CardDescription>
              Total em Fundos: {formatBRL(totalFundos)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fundos.map((fundo, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div className="flex-1">
                    <div className="font-semibold mb-1">{fundo.nome}</div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Aplicado: <span className="font-mono">{formatBRL(fundo.aplicado)}</span></span>
                      <span>•</span>
                      <span>Liquidez: <span className="font-semibold">{fundo.liquidez}</span></span>
                      <span>•</span>
                      <span>Risco: <Badge variant="secondary">{fundo.risco}</Badge></span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-xl font-bold">{formatBRL(fundo.atual)}</div>
                    <div className={`text-sm font-mono ${
                      fundo.atual >= fundo.aplicado ? "text-primary" : "text-destructive"
                    }`}>
                      {fundo.atual >= fundo.aplicado ? "+" : ""}
                      {formatBRL(fundo.atual - fundo.aplicado)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
