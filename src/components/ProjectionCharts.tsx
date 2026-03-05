import { YearData, formatBRL } from "@/lib/financial-engine";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend,
} from "recharts";
import { motion } from "framer-motion";

interface ProjectionChartsProps {
  data: YearData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-xl">
      <p className="font-mono font-semibold text-sm mb-2">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-xs flex justify-between gap-4">
          <span style={{ color: entry.color }}>{entry.name}</span>
          <span className="font-mono">{formatBRL(entry.value)}</span>
        </p>
      ))}
    </div>
  );
};

export function ProjectionCharts({ data }: ProjectionChartsProps) {
  const chartData = data.map((d) => ({
    ano: d.ano,
    saldo: d.saldoFinal,
    aportes: d.aporteAnual,
    jurosSI: d.jurosSaldoInicial,
    jurosAportes: d.jurosAportes,
    rendimento: d.rendimentoTotal,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="stat-glow rounded-lg p-5"
      >
        <h3 className="text-sm font-semibold mb-1">Evolução Patrimonial</h3>
        <p className="text-xs text-muted-foreground mb-4">Saldo final por ano</p>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="gradSaldo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(160, 60%, 45%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(160, 60%, 45%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
            <XAxis dataKey="ano" tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 11 }} />
            <YAxis
              tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 11 }}
              tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={2_000_000} stroke="hsl(45, 90%, 55%)" strokeDasharray="6 4" label={{ value: "Meta R$ 2M", fill: "hsl(45, 90%, 55%)", fontSize: 10 }} />
            <Area
              type="monotone"
              dataKey="saldo"
              name="Saldo Final"
              stroke="hsl(160, 60%, 45%)"
              fill="url(#gradSaldo)"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "hsl(160, 60%, 45%)", strokeWidth: 2, stroke: "hsl(220, 20%, 6%)" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="stat-glow rounded-lg p-5"
      >
        <h3 className="text-sm font-semibold mb-1">Composição Anual</h3>
        <p className="text-xs text-muted-foreground mb-4">Aportes vs Juros (saldo + aportes)</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
            <XAxis dataKey="ano" tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 11 }} />
            <YAxis
              tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 11 }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 11, color: "hsl(215, 12%, 50%)" }}
            />
            <Bar dataKey="aportes" name="Aportes" fill="hsl(220, 15%, 30%)" stackId="a" radius={[0, 0, 0, 0]} />
            <Bar dataKey="jurosSI" name="Juros s/ Saldo" fill="hsl(160, 60%, 45%)" stackId="a" />
            <Bar dataKey="jurosAportes" name="Juros s/ Aportes" fill="hsl(45, 90%, 55%)" stackId="a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
