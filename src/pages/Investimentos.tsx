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
import { usePremissas } from "@/contexts/PremissasContext";
import { useState, useMemo } from "react";

interface Ativo {
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

interface Fundo {
  nome: string;
  aplicado: number;
  atual: number;
  liquidez: string;
  risco: number;
}

const fundos: Fundo[] = [
  { nome: "XP Referenciado DI CP RL", aplicado: 12645, atual: 13061.98, liquidez: "D+0", risco: 2 },
  { nome: "Occam Liquidez FIC FIF", aplicado: 13485, atual: 13931.97, liquidez: "D+0", risco: 12 },
  { nome: "SVN FIRF CP RL", aplicado: 13393, atual: 13818.82, liquidez: "D+5", risco: 11 },
];

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
          aValue = a.posicaoAtual;
          bValue = b.posicaoAtual;
          break;
        case 'rendimento':
          aValue = a.rendimento;
          bValue = b.rendimento;
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
  }, [sortField, sortDirection, inflacao, ptax]);
  
  const totalRendaFixa = ativosRendaFixa.reduce((sum, a) => sum + a.posicaoAtual, 0);
  const totalFundos = fundos.reduce((sum, f) => sum + f.atual, 0);
  const totalGeral = totalRendaFixa + totalFundos;
  const totalRendimentoRendaFixa = ativosRendaFixa.reduce((sum, a) => sum + a.rendimento, 0);
  const totalRendimentoFundos = fundos.reduce((sum, f) => sum + (f.atual - f.aplicado), 0);
  
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
                          {formatBRL(ativo.posicaoAtual)}
                        </TableCell>
                        <TableCell className={`text-right font-mono ${
                          ativo.rendimento >= 0 ? "text-primary" : "text-destructive"
                        }`}>
                          {ativo.rendimento >= 0 ? "+" : ""}{formatBRL(ativo.rendimento)}
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
