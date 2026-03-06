import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";
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

interface Meta {
  nome: string;
  valorMeta: number;
  valorAtual: number;
  prazo: string;
  prioridade: "alta" | "media" | "baixa";
}

const metas: Meta[] = [
  { nome: "Reserva de emergência (6 meses)", valorMeta: 51_000, valorAtual: 25_000, prazo: "2025", prioridade: "alta" },
  { nome: "Meta patrimonial Master Plan", valorMeta: 2_000_000, valorAtual: 224_000, prazo: "2033", prioridade: "alta" },
  { nome: "Viagem família", valorMeta: 25_000, valorAtual: 8_000, prazo: "2026", prioridade: "media" },
  { nome: "Troca de carro", valorMeta: 80_000, valorAtual: 0, prazo: "2028", prioridade: "baixa" },
];

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
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

export default function MetasFinanceiras() {
  return (
    <div className="min-h-screen gradient-mesh">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Metas Financeiras</h1>
            <p className="text-sm text-muted-foreground">
              Objetivos com valor, prazo e progresso — além da meta única do Master Plan
            </p>
          </div>
        </motion.header>

        <Card>
          <CardHeader>
            <CardTitle>Suas metas</CardTitle>
            <CardDescription>
              Defina metas intermediárias (viagem, carro, reforma) e acompanhe o progresso. A meta
              patrimonial do Master Plan aparece aqui integrada.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Meta</TableHead>
                    <TableHead className="text-right">Valor atual</TableHead>
                    <TableHead className="text-right">Valor meta</TableHead>
                    <TableHead>Prazo</TableHead>
                    <TableHead>Progresso</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metas.map((m) => {
                    const pct = m.valorMeta === 0 ? 0 : Math.min(100, (m.valorAtual / m.valorMeta) * 100);
                    return (
                      <TableRow key={m.nome}>
                        <TableCell className="font-medium">{m.nome}</TableCell>
                        <TableCell className="text-right font-mono">{formatBRL(m.valorAtual)}</TableCell>
                        <TableCell className="text-right font-mono">{formatBRL(m.valorMeta)}</TableCell>
                        <TableCell>{m.prazo}</TableCell>
                        <TableCell className="w-32">
                          <Progress value={pct} className="h-2" />
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPrioridadeVariant(m.prioridade)} className="text-xs">
                            {prioridadeLabel[m.prioridade] ?? m.prioridade}
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
      </div>
    </div>
  );
}
