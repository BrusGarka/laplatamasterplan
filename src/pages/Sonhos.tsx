import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Sonho {
  nome: string;
  tipo: string;
  valor: number;
  observacao?: string;
  link?: string;
  valorMeta?: number;
  valorAtual?: number;
  prazo?: string;
  prioridade?: "alta" | "media" | "baixa";
}

const sonhos: Sonho[] = [
  { nome: "Casa", tipo: "Financiamento", valor: 0, observacao: "Valor a preencher" },
  {
    nome: "Carrinho BYD",
    tipo: "Financiamento",
    valor: -100000,
    observacao: "Projeto BYD Dolphin Mini PCD",
    link: "/sonhos/carrinho-byd",
    valorMeta: 80_000,
    valorAtual: 0,
    prazo: "2028",
    prioridade: "baixa",
  },
  { nome: "IPTU acordo judicial", tipo: "Tributo", valor: -5993.72, observacao: "À vista" },
  {
    nome: "IPTU 2023-2025",
    tipo: "Tributo",
    valor: -6919.16,
    observacao: "10 parcelas fixas de R$ 698,59 (simulação Prefeitura)",
  },
  {
    nome: "Viagem",
    tipo: "Outras",
    valor: 0,
    observacao: "Viagem família",
    valorMeta: 25_000,
    valorAtual: 8_000,
    prazo: "2026",
    prioridade: "media",
  },
  {
    nome: "Reserva de emergência (6 meses)",
    tipo: "Meta",
    valor: 0,
    link: "/reserva-emergencia",
    valorMeta: 51_000,
    valorAtual: 25_000,
    prazo: "2025",
    prioridade: "alta",
  },
  {
    nome: "Meta patrimonial Master Plan",
    tipo: "Meta",
    valor: 0,
    link: "/master-plan",
    valorMeta: 2_000_000,
    valorAtual: 224_000,
    prazo: "2033",
    prioridade: "alta",
  },
];

function formatBRL(value: number, fractionDigits = 2): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

function formatMetaBRL(value: number): string {
  return formatBRL(value, 0);
}

function getPrioridadeVariant(p: string): "default" | "secondary" | "destructive" | "outline" {
  if (p === "alta") return "destructive";
  if (p === "media") return "secondary";
  return "outline";
}

const prioridadeLabel: Record<string, string> = {
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};

function progressPct(valorMeta?: number, valorAtual?: number): number {
  if (valorMeta == null || valorMeta === 0) return 0;
  const atual = valorAtual ?? 0;
  return Math.min(100, (atual / valorMeta) * 100);
}

export default function Sonhos() {
  const totalSonhos = sonhos.reduce((sum, d) => sum + d.valor, 0);

  return (
    <div className="min-h-screen gradient-mesh">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <Scale className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Sonhos</h1>
            <p className="text-sm text-muted-foreground">
              Obrigações, passivos e metas com prazo e progresso
            </p>
          </div>
        </motion.header>

        <div className="grid gap-4 md:grid-cols-1">
          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total de Sonhos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{formatBRL(totalSonhos)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Soma das obrigações listadas (valores negativos)
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detalhamento dos Sonhos</CardTitle>
            <CardDescription>
              Casa, carro, IPTU, viagem, reserva de emergência e meta patrimonial.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Valor (R$)</TableHead>
                    <TableHead className="text-right">Valor atual</TableHead>
                    <TableHead className="text-right">Valor meta</TableHead>
                    <TableHead>Prazo</TableHead>
                    <TableHead>Progresso</TableHead>
                    <TableHead></TableHead>
                    <TableHead className="text-muted-foreground">Observação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sonhos.map((d) => {
                    const pct = progressPct(d.valorMeta, d.valorAtual);
                    const hasMeta = d.valorMeta != null;
                    return (
                      <TableRow key={d.nome} className={d.link ? "hover:bg-muted/50" : undefined}>
                        <TableCell className="font-medium">
                          {d.link ? (
                            <Link
                              to={d.link}
                              className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
                            >
                              {d.nome}
                            </Link>
                          ) : (
                            d.nome
                          )}
                        </TableCell>
                        <TableCell>{d.tipo}</TableCell>
                        <TableCell
                          className={`text-right font-mono ${d.valor < 0 ? "text-destructive font-semibold" : ""}`}
                        >
                          {formatBRL(d.valor)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {hasMeta ? formatMetaBRL(d.valorAtual ?? 0) : "—"}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {hasMeta ? formatMetaBRL(d.valorMeta!) : "—"}
                        </TableCell>
                        <TableCell>{d.prazo ?? "—"}</TableCell>
                        <TableCell className="w-32">
                          {hasMeta ? <Progress value={pct} className="h-2" /> : "—"}
                        </TableCell>
                        <TableCell>
                          {d.prioridade ? (
                            <Badge variant={getPrioridadeVariant(d.prioridade)} className="text-xs">
                              {prioridadeLabel[d.prioridade] ?? d.prioridade}
                            </Badge>
                          ) : null}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {d.observacao ?? "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
