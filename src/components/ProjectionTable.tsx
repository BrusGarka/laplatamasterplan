import { UnifiedYearData, formatBRL, formatCompact } from "@/lib/financial-engine";
import { motion } from "framer-motion";

interface ProjectionTableProps {
  data: UnifiedYearData[];
  currentYear?: number;
}

export function ProjectionTable({ data, currentYear = 2026 }: ProjectionTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="stat-glow rounded-lg overflow-hidden"
    >
      <div className="p-5 border-b border-border">
        <h2 className="text-lg font-semibold">Projeção Completa — Fase 1 & 2</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Fase 1: aportes progressivos (2024–2033) • Fase 2: hold sem aportes (2034+) • Juro real 6% a.a.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-secondary/50">
              <th className="text-left p-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">Ano</th>
              <th className="text-left p-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">Idade</th>
              <th className="text-right p-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">Saldo Inicial</th>
              <th className="text-right p-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">PMT/Mês</th>
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

              return (
                <>
                  {isPhase2Start && (
                    <tr key="phase-divider" className="bg-accent/10">
                      <td colSpan={8} className="p-2 text-center text-xs font-semibold text-accent uppercase tracking-widest">
                        ━━━ Fase 2 — Hold & Independência (sem aportes) ━━━
                      </td>
                    </tr>
                  )}
                  <tr
                    key={row.ano}
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
                      {isCurrent && <span className="ml-2 text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded">ATUAL</span>}
                    </td>
                    <td className="p-3 text-muted-foreground">{row.idade}</td>
                    <td className="p-3 text-right font-mono">{formatCompact(row.saldoInicial)}</td>
                    <td className="p-3 text-right font-mono">
                      {row.pmtMes > 0 ? formatBRL(row.pmtMes) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
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
                      {row.fase === 1 && !hasMilestone && (
                        <span className="text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded font-medium">FASE 1</span>
                      )}
                      {hasMilestone && (
                        <span className="text-[10px] bg-accent/20 text-accent px-2 py-1 rounded font-bold">
                          🎯 {row.marco}
                        </span>
                      )}
                    </td>
                  </tr>
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
