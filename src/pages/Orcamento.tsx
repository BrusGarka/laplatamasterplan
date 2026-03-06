import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PiggyBank } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ItemOrcamento {
  categoria: string;
  descricao: string;
  valor: number;
  tipo: "receita" | "despesa";
  recorrencia: "fixo" | "variavel";
}

const receitas: ItemOrcamento[] = [
  { categoria: "Salário", descricao: "Renda principal", valor: 15_000, tipo: "receita", recorrencia: "fixo" },
  { categoria: "Freelance", descricao: "Renda extra", valor: 2_000, tipo: "receita", recorrencia: "variavel" },
];

const despesas: ItemOrcamento[] = [
  { categoria: "Moradia", descricao: "Aluguel/condomínio", valor: 3_500, tipo: "despesa", recorrencia: "fixo" },
  { categoria: "Alimentação", descricao: "Supermercado e delivery", valor: 2_200, tipo: "despesa", recorrencia: "variavel" },
  { categoria: "Transporte", descricao: "Combustível, Uber", valor: 800, tipo: "despesa", recorrencia: "variavel" },
  { categoria: "Saúde", descricao: "Plano e medicamentos", valor: 600, tipo: "despesa", recorrencia: "fixo" },
  { categoria: "Educação", descricao: "Cursos e livros", valor: 400, tipo: "despesa", recorrencia: "variavel" },
  { categoria: "Lazer", descricao: "Entretenimento", valor: 500, tipo: "despesa", recorrencia: "variavel" },
  { categoria: "Outros", descricao: "Diversos", valor: 500, tipo: "despesa", recorrencia: "variavel" },
];

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function Orcamento() {
  const totalReceitas = receitas.reduce((s, r) => s + r.valor, 0);
  const totalDespesas = despesas.reduce((s, d) => s + d.valor, 0);
  const saldo = totalReceitas - totalDespesas;

  return (
    <div className="min-h-screen gradient-mesh">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <PiggyBank className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Orçamento</h1>
            <p className="text-sm text-muted-foreground">
              Receitas e despesas por categoria — controle mensal
            </p>
          </div>
        </motion.header>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Receitas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatBRL(totalReceitas)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Entradas mensais</p>
            </CardContent>
          </Card>
          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{formatBRL(totalDespesas)}</div>
              <p className="text-xs text-muted-foreground mt-1">Saídas mensais</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Saldo do mês</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${saldo >= 0 ? "text-primary" : "text-destructive"}`}>
                {formatBRL(saldo)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Disponível para investir / quitar dívidas</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Receitas</CardTitle>
              <CardDescription>Fontes de renda mensal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receitas.map((r) => (
                      <TableRow key={r.categoria + r.descricao}>
                        <TableCell className="font-medium">{r.categoria}</TableCell>
                        <TableCell className="text-muted-foreground">{r.descricao}</TableCell>
                        <TableCell className="text-right font-mono text-emerald-600 dark:text-emerald-400">
                          {formatBRL(r.valor)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={r.recorrencia === "fixo" ? "default" : "secondary"} className="text-xs">
                            {r.recorrencia === "fixo" ? "Fixo" : "Variável"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Despesas</CardTitle>
              <CardDescription>Gastos por categoria</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {despesas.map((d) => (
                      <TableRow key={d.categoria + d.descricao}>
                        <TableCell className="font-medium">{d.categoria}</TableCell>
                        <TableCell className="text-muted-foreground">{d.descricao}</TableCell>
                        <TableCell className="text-right font-mono text-destructive">
                          {formatBRL(d.valor)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={d.recorrencia === "fixo" ? "default" : "outline"} className="text-xs">
                            {d.recorrencia === "fixo" ? "Fixo" : "Variável"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
