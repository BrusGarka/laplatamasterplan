import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  gerarProjecaoFase2,
  formatBRL,
  formatCompact,
  IF_MINIMA_RENDA,
  IF_ALVO_RENDA,
  Phase2YearData,
} from "@/lib/financial-engine";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell,
} from "recharts";
import { Landmark, TrendingUp, CheckCircle2 } from "lucide-react";

interface Phase2DashboardProps {
  patrimonioFase1: number;
  idadeFimFase1: number;
  anoFimFase1: number;
}

export function Phase2Dashboard({ patrimonioFase1, idadeFimFase1, anoFimFase1 }: Phase2DashboardProps) {
  const projecao = useMemo(
    () => gerarProjecaoFase2(patrimonioFase1, idadeFimFase1, anoFimFase1, 25),
    [patrimonioFase1, idadeFimFase1, anoFimFase1]
  );

  const anoIFMinima = projecao.find(d => d.marco === "IF Mínima R$12k");
  const anoIFAlvo = projecao.find(d => d.marco === "IF Alvo R$15k");
  const final = projecao[projecao.length - 1];

  // Color gradient: red → orange → green based on renda vs meta
  const getBarColor = (rendaLiq: number) => {
    const ratio = rendaLiq / IF_ALVO_RENDA;
    if (ratio >= 1) return "hsl(160, 60%, 45%)";
    if (ratio >= 0.8) return "hsl(120, 50%, 50%)";
    if (ratio >= 0.6) return "hsl(45, 90%, 55%)";
    if (ratio >= 0.4) return "hsl(25, 90%, 55%)";
    return "hsl(0, 70%, 55%)";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="space-y-4"
    >
      {/* Phase 2 Header */}
      <div className="stat-glow rounded-lg p-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-accent/10 border border-accent/20">
            <Landmark className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Fase 2 — Hold & Independência</h2>
            <p className="text-xs text-muted-foreground">
              Sem aportes após {anoFimFase1} • Juro real 6% a.a. • SWR 4,5%
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniStat
          label="IF Mínima (R$12k/mês)"
          value={anoIFMinima ? `${anoIFMinima.ano} (${anoIFMinima.idade} anos)` : "—"}
          icon={<CheckCircle2 className="w-4 h-4 text-primary" />}
          highlight={!!anoIFMinima}
        />
        <MiniStat
          label="IF Alvo (R$15k/mês)"
          value={anoIFAlvo ? `${anoIFAlvo.ano} (${anoIFAlvo.idade} anos)` : "—"}
          icon={<CheckCircle2 className="w-4 h-4 text-accent" />}
          highlight={!!anoIFAlvo}
        />
        <MiniStat
          label="Patrimônio aos 64"
          value={formatCompact(final.patrimonio)}
          icon={<TrendingUp className="w-4 h-4 text-primary" />}
        />
        <MiniStat
          label="Renda Passiva aos 64"
          value={`${formatBRL(final.rendaLiquidaMes)}/mês`}
          icon={<Landmark className="w-4 h-4 text-accent" />}
        />
      </div>

      {/* Bar Chart — like reference image */}
      <div className="stat-glow rounded-lg p-5">
        <h3 className="text-sm font-semibold mb-1">Renda Passiva Líquida/Mês por Idade</h3>
        <p className="text-xs text-muted-foreground mb-4">Sem aportes após idade {idadeFimFase1} • SWR 4,5% • IR ~12%</p>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={projecao}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
            <XAxis
              dataKey="idade"
              tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 11 }}
              label={{ value: "Idade", position: "insideBottom", offset: -2, fill: "hsl(215, 12%, 50%)", fontSize: 11 }}
            />
            <YAxis
              tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 11 }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              label={{ value: "Renda (R$/mês)", angle: -90, position: "insideLeft", fill: "hsl(215, 12%, 50%)", fontSize: 11 }}
            />
            <Tooltip
              content={({ active, payload }) =>
                active && payload?.[0] ? (
                  <div className="bg-card border border-border rounded-lg p-3 shadow-xl">
                    <p className="font-mono font-semibold text-sm mb-1">
                      Idade {(payload[0].payload as Phase2YearData).idade} ({(payload[0].payload as Phase2YearData).ano})
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Patrimônio: <span className="font-mono text-foreground">{formatBRL((payload[0].payload as Phase2YearData).patrimonio)}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Renda líq.: <span className="font-mono text-accent">{formatBRL((payload[0].payload as Phase2YearData).rendaLiquidaMes)}/mês</span>
                    </p>
                    {(payload[0].payload as Phase2YearData).marco && (
                      <p className="text-xs font-semibold text-primary mt-1">🎯 {(payload[0].payload as Phase2YearData).marco}</p>
                    )}
                  </div>
                ) : null
              }
            />
            <ReferenceLine
              y={IF_MINIMA_RENDA}
              stroke="hsl(120, 50%, 50%)"
              strokeDasharray="8 4"
              strokeWidth={1.5}
              label={{ value: "Meta R$12k", fill: "hsl(120, 50%, 50%)", fontSize: 10, position: "right" }}
            />
            <ReferenceLine
              y={IF_ALVO_RENDA}
              stroke="hsl(45, 90%, 55%)"
              strokeDasharray="8 4"
              strokeWidth={1.5}
              label={{ value: "Meta R$15k", fill: "hsl(45, 90%, 55%)", fontSize: 10, position: "right" }}
            />
            <Bar dataKey="rendaLiquidaMes" name="Renda Líq./mês" radius={[4, 4, 0, 0]}>
              {projecao.map((entry, index) => (
                <Cell key={index} fill={getBarColor(entry.rendaLiquidaMes)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

function MiniStat({ label, value, icon, highlight }: { label: string; value: string; icon: React.ReactNode; highlight?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`stat-glow rounded-lg p-4 ${highlight ? "border-accent/20 glow-gold" : ""}`}
    >
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</span>
      </div>
      <p className="text-lg font-bold font-mono">{value}</p>
    </motion.div>
  );
}
