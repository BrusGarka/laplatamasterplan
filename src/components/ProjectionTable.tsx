import { YearData, formatBRL } from "@/lib/financial-engine";
import { motion } from "framer-motion";

interface ProjectionTableProps {
  data: YearData[];
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
        <h2 className="text-lg font-semibold">Projeção Anual Detalhada</h2>
        <p className="text-xs text-muted-foreground mt-1">Aportes progressivos mensais • Taxa 10,77% a.a.</p>
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
              <th className="text-right p-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">% Meta</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const isCurrent = row.ano === currentYear;
              const isPast = row.ano < currentYear;
              const metaHit = row.pctMeta >= 100;

              return (
                <tr
                  key={row.ano}
                  className={`
                    border-b border-border/50 transition-colors
                    ${isCurrent ? "bg-primary/5 border-l-2 border-l-primary" : ""}
                    ${isPast ? "opacity-60" : ""}
                    ${metaHit ? "bg-accent/5" : ""}
                    hover:bg-secondary/30
                  `}
                >
                  <td className="p-3 font-mono font-semibold">
                    {row.ano}
                    {isCurrent && <span className="ml-2 text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded">ATUAL</span>}
                  </td>
                  <td className="p-3 text-muted-foreground">{row.idade}</td>
                  <td className="p-3 text-right font-mono">{formatBRL(row.saldoInicial)}</td>
                  <td className="p-3 text-right font-mono">{formatBRL(row.pmtMes)}</td>
                  <td className="p-3 text-right font-mono text-primary">{formatBRL(row.rendimentoTotal)}</td>
                  <td className="p-3 text-right font-mono font-semibold">{formatBRL(row.saldoFinal)}</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${metaHit ? "bg-accent" : "bg-primary"}`}
                          style={{ width: `${Math.min(row.pctMeta, 100)}%` }}
                        />
                      </div>
                      <span className={`font-mono text-xs ${metaHit ? "text-accent font-bold" : ""}`}>
                        {row.pctMeta}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
