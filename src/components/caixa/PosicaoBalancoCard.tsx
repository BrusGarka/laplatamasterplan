import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBRL } from "@/lib/utils";
import { useLancamentos, useResumo } from "@/hooks/use-caixa";
import type { ResumoMes } from "@/types/caixa";

interface PosicaoBalancoCardProps {
  anoMes: string;
}

function calcularResumo(lancamentos: { valor: number }[]): Partial<ResumoMes> {
  const totalEntradas = lancamentos
    .filter((l) => l.valor > 0)
    .reduce((s, l) => s + l.valor, 0);
  const totalSaidas = lancamentos
    .filter((l) => l.valor < 0)
    .reduce((s, l) => s + Math.abs(l.valor), 0);
  const balanco = totalEntradas - totalSaidas;
  return {
    posicao: balanco,
    ativoCirculante: totalEntradas,
    passivoCirculante: -totalSaidas,
    balancoPrevisto: balanco,
  };
}

export function PosicaoBalancoCard({ anoMes }: PosicaoBalancoCardProps) {
  const { data: lancamentos = [] } = useLancamentos(anoMes);
  const { data: resumoSalvo } = useResumo(anoMes);

  const calculado = useMemo(
    () => calcularResumo(lancamentos),
    [lancamentos]
  );

  const resumo: ResumoMes = useMemo(() => {
    if (resumoSalvo) {
      return {
        posicao: resumoSalvo.posicao,
        ativoCirculante: resumoSalvo.ativoCirculante,
        passivoCirculante: resumoSalvo.passivoCirculante,
        balancoPrevisto: resumoSalvo.balancoPrevisto,
        acumuladoAnual: resumoSalvo.acumuladoAnual,
        totalPoupanca: resumoSalvo.totalPoupanca,
        porquinhos: resumoSalvo.porquinhos,
      };
    }
    return {
      posicao: calculado.posicao ?? 0,
      ativoCirculante: calculado.ativoCirculante ?? 0,
      passivoCirculante: calculado.passivoCirculante ?? 0,
      balancoPrevisto: calculado.balancoPrevisto ?? 0,
      acumuladoAnual: 0,
      totalPoupanca: 0,
    };
  }, [resumoSalvo, calculado]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Posição atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                resumo.posicao >= 0 ? "text-primary" : "text-destructive"
              }`}
            >
              {formatBRL(resumo.posicao)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Caixa disponível
            </p>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ativo circulante
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatBRL(resumo.ativoCirculante)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Entradas</p>
          </CardContent>
        </Card>
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Passivo circulante
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatBRL(resumo.passivoCirculante)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Saídas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Balanço previsto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                resumo.balancoPrevisto >= 0 ? "text-primary" : "text-destructive"
              }`}
            >
              {formatBRL(resumo.balancoPrevisto)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Ativo − Passivo
            </p>
          </CardContent>
        </Card>
      </div>
      {resumo.porquinhos && Object.keys(resumo.porquinhos).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Porquinhos</CardTitle>
            <CardDescription>Reservas e metas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(resumo.porquinhos).map(([nome, valor]) => (
                <div
                  key={nome}
                  className="flex justify-between rounded-lg border p-3"
                >
                  <span className="font-medium capitalize">{nome}</span>
                  <span
                    className={`font-mono ${
                      valor >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-destructive"
                    }`}
                  >
                    {formatBRL(valor)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
