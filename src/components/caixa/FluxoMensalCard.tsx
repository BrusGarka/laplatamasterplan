import { useMemo } from "react";
import { motion } from "framer-motion";
import { useQueries } from "@tanstack/react-query";
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
import { getLancamentosMes } from "@/services/caixa-service";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Lancamento } from "@/types/caixa";

interface FluxoMensalCardProps {
  meses: string[];
}

function totaisDoMes(lancamentos: Lancamento[]) {
  const receita = lancamentos.filter((l) => l.valor > 0).reduce((s, l) => s + l.valor, 0);
  const despesa = lancamentos
    .filter((l) => l.valor < 0)
    .reduce((s, l) => s + Math.abs(l.valor), 0);
  const aporte = lancamentos
    .filter((l) => l.tipo === "poupança" && l.valor > 0)
    .reduce((s, l) => s + l.valor, 0);
  return { receita, despesa, aporte, saldo: receita - despesa };
}

export function FluxoMensalCard({ meses }: FluxoMensalCardProps) {
  const results = useQueries({
    queries: meses.map((m) => ({
      queryKey: ["caixa", "lancamentos", m] as const,
      queryFn: () => getLancamentosMes(m),
      enabled: !!m,
    })),
  });

  const linhas = useMemo(
    () =>
      meses.map((m, i) => {
        const lanc = (results[i]?.data ?? []) as Lancamento[];
        return {
          anoMes: m,
          nome: format(new Date(m + "-01T00:00:00"), "MMM/yy", { locale: ptBR }),
          nomeLongo: format(new Date(m + "-01T00:00:00"), "MMMM yyyy", { locale: ptBR }),
          ...totaisDoMes(lanc),
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [meses, results.map((r) => r.dataUpdatedAt).join(",")]
  );

  const acumulado = useMemo(() => {
    return linhas.reduce(
      (acc, l) => ({
        receita: acc.receita + l.receita,
        despesa: acc.despesa + l.despesa,
        aporte: acc.aporte + l.aporte,
        saldo: acc.saldo + l.saldo,
      }),
      { receita: 0, despesa: 0, aporte: 0, saldo: 0 }
    );
  }, [linhas]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receita total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatBRL(acumulado.receita)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Despesa total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatBRL(acumulado.despesa)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Aporte total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBRL(acumulado.aporte)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Saldo acumulado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                acumulado.saldo >= 0 ? "text-primary" : "text-destructive"
              }`}
            >
              {formatBRL(acumulado.saldo)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fluxo mês a mês</CardTitle>
          <CardDescription>
            Receita, despesa e aporte de todos os meses monitorados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={linhas}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="nome" className="text-xs" />
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
          <CardTitle>Detalhamento</CardTitle>
          <CardDescription>Todos os meses monitorados</CardDescription>
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
                {linhas.map((l) => (
                  <TableRow key={l.anoMes}>
                    <TableCell className="font-medium capitalize">{l.nomeLongo}</TableCell>
                    <TableCell className="text-right font-mono text-emerald-600 dark:text-emerald-400">
                      {formatBRL(l.receita)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-destructive">
                      {formatBRL(l.despesa)}
                    </TableCell>
                    <TableCell className="text-right font-mono">{formatBRL(l.aporte)}</TableCell>
                    <TableCell
                      className={`text-right font-mono ${
                        l.saldo < 0 ? "text-destructive" : ""
                      }`}
                    >
                      {formatBRL(l.saldo)}
                    </TableCell>
                  </TableRow>
                ))}
                {linhas.length > 0 && (
                  <TableRow className="bg-muted/50 font-semibold">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right font-mono">{formatBRL(acumulado.receita)}</TableCell>
                    <TableCell className="text-right font-mono">{formatBRL(acumulado.despesa)}</TableCell>
                    <TableCell className="text-right font-mono">{formatBRL(acumulado.aporte)}</TableCell>
                    <TableCell className="text-right font-mono">{formatBRL(acumulado.saldo)}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
