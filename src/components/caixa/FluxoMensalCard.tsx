import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { formatBRL } from "@/lib/utils";
import { useLancamentos } from "@/hooks/use-caixa";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface FluxoMensalCardProps {
  anoMes: string;
}

export function FluxoMensalCard({ anoMes }: FluxoMensalCardProps) {
  const { data: lancamentos = [] } = useLancamentos(anoMes);

  const totais = useMemo(() => {
    const receita = lancamentos
      .filter((l) => l.valor > 0)
      .reduce((s, l) => s + l.valor, 0);
    const despesa = lancamentos
      .filter((l) => l.valor < 0)
      .reduce((s, l) => s + Math.abs(l.valor), 0);
    const saldo = receita - despesa;
    const aporte = lancamentos
      .filter((l) => l.tipo === "poupança" && l.valor > 0)
      .reduce((s, l) => s + l.valor, 0);
    return { receita, despesa, saldo, aporte };
  }, [lancamentos]);

  const chartData = useMemo(
    () => [
      {
        nome: format(new Date(anoMes + "-01"), "MMM yyyy", { locale: ptBR }),
        receita: totais.receita,
        despesa: totais.despesa,
        aporte: totais.aporte,
        saldo: totais.saldo,
      },
    ],
    [anoMes, totais]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receita
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatBRL(totais.receita)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Despesa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatBRL(totais.despesa)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Saldo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                totais.saldo >= 0 ? "text-primary" : "text-destructive"
              }`}
            >
              {formatBRL(totais.saldo)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fluxo do mês</CardTitle>
          <CardDescription>
            Receita, despesa e aporte baseados nos lançamentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="nome" className="text-xs" />
                <YAxis
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  className="text-xs"
                />
                <Tooltip
                  formatter={(value: number) => formatBRL(value)}
                  contentStyle={{ borderRadius: "8px" }}
                />
                <Legend />
                <Bar
                  dataKey="receita"
                  name="Receita"
                  fill="hsl(var(--chart-1))"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="despesa"
                  name="Despesa"
                  fill="hsl(var(--destructive))"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="aporte"
                  name="Aporte"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalhamento</CardTitle>
          <CardDescription>
            Resumo do mês selecionado
          </CardDescription>
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
                <TableRow>
                  <TableCell className="font-medium">
                    {format(new Date(anoMes + "-01"), "MMMM yyyy", {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell className="text-right font-mono text-emerald-600 dark:text-emerald-400">
                    {formatBRL(totais.receita)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-destructive">
                    {formatBRL(totais.despesa)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatBRL(totais.aporte)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatBRL(totais.saldo)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
