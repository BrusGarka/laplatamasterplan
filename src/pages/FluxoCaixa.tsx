import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeftRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Dados mensais ilustrativos (receita - despesa - aporte)
const meses = [
  { mes: "Jan", receita: 17_000, despesa: 8_500, aporte: 5_000, saldo: 3_500 },
  { mes: "Fev", receita: 17_000, despesa: 8_200, aporte: 5_500, saldo: 3_300 },
  { mes: "Mar", receita: 17_000, despesa: 9_100, aporte: 4_800, saldo: 3_100 },
  { mes: "Abr", receita: 17_000, despesa: 8_400, aporte: 5_200, saldo: 3_400 },
  { mes: "Mai", receita: 17_000, despesa: 8_600, aporte: 5_100, saldo: 3_300 },
  { mes: "Jun", receita: 17_000, despesa: 8_500, aporte: 5_200, saldo: 3_300 },
];

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export default function FluxoCaixa() {
  const totais = meses.reduce(
    (acc, m) => ({
      receita: acc.receita + m.receita,
      despesa: acc.despesa + m.despesa,
      aporte: acc.aporte + m.aporte,
    }),
    { receita: 0, despesa: 0, aporte: 0 }
  );

  return (
    <div className="min-h-screen gradient-mesh">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <ArrowLeftRight className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Fluxo de Caixa</h1>
            <p className="text-sm text-muted-foreground">
              Entradas e saídas no tempo — visão mensal
            </p>
          </div>
        </motion.header>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Receitas (6 meses)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatBRL(totais.receita)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Despesas (6 meses)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{formatBRL(totais.despesa)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Aportes (6 meses)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{formatBRL(totais.aporte)}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Fluxo mensal</CardTitle>
            <CardDescription>
              Comparativo de receitas, despesas e aportes. Ajuste os valores conforme seu orçamento.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full" role="img" aria-label="Gráfico de barras: receita, despesa e aporte por mês">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={meses}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="mes" className="text-xs" />
                  <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} className="text-xs" />
                  <Tooltip
                    formatter={(value: number) => formatBRL(value)}
                    contentStyle={{ borderRadius: "8px" }}
                  />
                  <Legend />
                  <Bar dataKey="receita" name="Receita" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="despesa" name="Despesa" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="aporte" name="Aporte" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detalhamento por mês</CardTitle>
            <CardDescription>Saldo = Receita − Despesa (valor disponível para aportes e reserva)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mês</TableHead>
                    <TableHead className="text-right">Receita</TableHead>
                    <TableHead className="text-right">Despesa</TableHead>
                    <TableHead className="text-right">Aporte</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {meses.map((m, idx) => (
                    <TableRow key={`${m.mes}-${idx}`}>
                      <TableCell className="font-medium">{m.mes}</TableCell>
                      <TableCell className="text-right font-mono text-emerald-600 dark:text-emerald-400">
                        {formatBRL(m.receita)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-destructive">
                        {formatBRL(m.despesa)}
                      </TableCell>
                      <TableCell className="text-right font-mono">{formatBRL(m.aporte)}</TableCell>
                      <TableCell className="text-right font-mono">{formatBRL(m.saldo)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
