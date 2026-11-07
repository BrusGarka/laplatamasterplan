import { Fragment } from "react";
import { motion } from "framer-motion";
import { usePremissas } from "@/contexts/PremissasContext";
import { UnifiedYearData, formatBRL, formatCompact } from "@/lib/financial-engine";

interface TresFasesTableProps {
  data: UnifiedYearData[];
  currentYear?: number;
}

function rotuloFase(fase: 1 | 2 | 3): string {
  switch (fase) {
    case 1:
      return "FASE 1";
    case 2:
      return "FASE 2";
    case 3:
      return "FASE 3";
    default: {
      const nunca: never = fase;
      return nunca;
    }
  }
}

export function TresFasesTable({ data, currentYear = 2026 }: TresFasesTableProps) {
  const { taxaReal } = usePremissas();
  const juroReal = taxaReal.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="stat-glow rounded-lg overflow-hidden"
    >
      <div className="p-5 border-b border-border">
        <h2 className="text-lg font-semibold">Projeção — 3 Fases</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Fase 1: aportes de 2024 a 2033 • Fase 2: hold até 2043 • Fase 3: renda passiva de 2044 em
          diante • Juro real {juroReal}% a.a.
        </p>
      </div>
      <div className="overflow-x-auto max-h-[70vh]">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="bg-secondary/95">
              <th className="text-left p-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">Ano</th>
              <th className="text-left p-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">Idade</th>
              <th className="text-right p-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">Saldo Inicial</th>
              <th className="text-right p-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">PMT/Mês</th>
              <th
                className="text-right p-3 text-xs uppercase tracking-wider text-muted-foreground font-medium"
                title="R$ 100 mil de 2024 corrigidos pela inflação de cada ano anterior"
              >
                Aporte anual
              </th>
              <th className="text-right p-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">Rendimento</th>
              <th className="text-right p-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">Saldo Final</th>
              <th className="text-right p-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">Renda Líq./Mês</th>
              <th className="text-left p-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const isCurrent = row.ano === currentYear;
              const isPast = row.ano < currentYear;
              const hasMilestone = !!row.marco;
              const isPhase2Start = row.fase === 2 && row.ano === 2034;
              const isPhase3Start = row.fase === 3 && row.ano === 2044;
              const aporteEntraNoSaldo = row.fase === 1;

              return (
                <Fragment key={row.ano}>
                  {isPhase2Start && (
                    <tr className="bg-sky-500/10">
                      <td colSpan={9} className="p-2 text-center text-xs font-semibold text-sky-400 uppercase tracking-widest">
                        Fase 2 — Hold até 2043, sem aporte
                      </td>
                    </tr>
                  )}
                  {isPhase3Start && (
                    <tr className="bg-emerald/10">
                      <td colSpan={9} className="p-2 text-center text-xs font-semibold text-emerald uppercase tracking-widest">
                        Fase 3 — Renda passiva, de 2044 em diante
                      </td>
                    </tr>
                  )}
                  <tr
                    className={`
                      border-b border-border/50 transition-colors
                      ${isCurrent ? "bg-primary/5 border-l-2 border-l-primary" : ""}
                      ${isPast ? "opacity-60" : ""}
                      ${hasMilestone ? "bg-accent/10 border-l-2 border-l-accent" : ""}
                      hover:bg-secondary/30
                    `}
                  >
                    <td className="p-3 font-mono font-semibold">
                      {row.ano}
                      {isCurrent && (
                        <span className="ml-2 text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                          ATUAL
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-muted-foreground">{row.idade}</td>
                    <td className="p-3 text-right font-mono">{formatCompact(row.saldoInicial)}</td>
                    <td className="p-3 text-right font-mono">
                      {row.pmtMes > 0 ? (
                        formatBRL(row.pmtMes)
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </td>
                    <td
                      className={`p-3 text-right font-mono ${aporteEntraNoSaldo ? "" : "text-muted-foreground"}`}
                      title={
                        aporteEntraNoSaldo
                          ? "Aporte do ano, corrigido pela inflação. Vira o PMT mensal."
                          : "Referência: R$ 100 mil de 2024 corrigidos. Não entra no saldo nesta fase."
                      }
                    >
                      {formatBRL(row.aporteAnual)}
                    </td>
                    <td className="p-3 text-right font-mono text-primary">{formatCompact(row.rendimentoTotal)}</td>
                    <td className="p-3 text-right font-mono font-semibold">{formatCompact(row.saldoFinal)}</td>
                    <td className="p-3 text-right font-mono">
                      {row.rendaLiquidaMes ? (
                        <span className="text-accent">{formatBRL(row.rendaLiquidaMes)}</span>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </td>
                    <td className="p-3">
                      {hasMilestone ? (
                        <span className="text-[10px] bg-accent/20 text-accent px-2 py-1 rounded font-bold">
                          {row.marco}
                        </span>
                      ) : (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            row.fase === 1
                              ? "bg-accent/15 text-accent"
                              : row.fase === 2
                                ? "bg-sky-500/15 text-sky-400"
                                : "bg-emerald/15 text-emerald"
                          }`}
                        >
                          {rotuloFase(row.fase)}
                        </span>
                      )}
                    </td>
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
