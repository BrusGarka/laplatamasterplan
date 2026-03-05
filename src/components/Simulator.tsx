import { useState, useMemo } from "react";
import { simularProjecao, formatBRL, formatCompact, META } from "@/lib/financial-engine";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import { Sliders } from "lucide-react";

export function Simulator() {
  const [saldoInicial, setSaldoInicial] = useState(224_000);
  const [pmtMes, setPmtMes] = useState(9_117);
  const [taxaAnual, setTaxaAnual] = useState(10.77);
  const [anos, setAnos] = useState(8);

  const projecao = useMemo(
    () => simularProjecao(saldoInicial, pmtMes, taxaAnual / 100, anos),
    [saldoInicial, pmtMes, taxaAnual, anos]
  );

  const saldoFinal = projecao.length > 0 ? projecao[projecao.length - 1].saldoFinal : 0;
  const totalAportes = pmtMes * 12 * anos;
  const totalJuros = saldoFinal - saldoInicial - totalAportes;
  const anoMeta = projecao.find((d) => d.saldoFinal >= META);

  const chartData = projecao.map((d) => ({ ano: d.ano, saldo: d.saldoFinal }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="stat-glow rounded-lg p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Sliders className="w-4 h-4 text-accent" />
        <h2 className="text-lg font-semibold">Simulador de Cenários</h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SliderInput label="Saldo Inicial" value={saldoInicial} onChange={setSaldoInicial} min={0} max={1_000_000} step={10_000} format={formatCompact} />
        <SliderInput label="Aporte Mensal" value={pmtMes} onChange={setPmtMes} min={1_000} max={30_000} step={500} format={formatCompact} />
        <SliderInput label="Taxa Anual (%)" value={taxaAnual} onChange={setTaxaAnual} min={4} max={18} step={0.25} format={(v) => `${v.toFixed(2)}%`} />
        <SliderInput label="Horizonte (anos)" value={anos} onChange={setAnos} min={1} max={30} step={1} format={(v) => `${v} anos`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-secondary/50 rounded-lg p-4 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Saldo Final</p>
          <p className="text-xl font-bold font-mono text-primary">{formatCompact(saldoFinal)}</p>
        </div>
        <div className="bg-secondary/50 rounded-lg p-4 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Juros</p>
          <p className="text-xl font-bold font-mono text-accent">{formatCompact(totalJuros)}</p>
        </div>
        <div className="bg-secondary/50 rounded-lg p-4 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Meta R$ 2M</p>
          <p className="text-xl font-bold font-mono">
            {anoMeta ? (
              <span className="text-accent">{anoMeta.ano} (idade {anoMeta.idade})</span>
            ) : (
              <span className="text-destructive">Não atinge</span>
            )}
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="gradSim" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(45, 90%, 55%)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="hsl(45, 90%, 55%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
          <XAxis dataKey="ano" tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 11 }} />
          <YAxis tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 11 }} tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`} />
          <Tooltip
            content={({ active, payload, label }) =>
              active && payload ? (
                <div className="bg-card border border-border rounded-lg p-3 shadow-xl">
                  <p className="font-mono font-semibold text-sm">{label}</p>
                  <p className="text-xs font-mono text-accent">{formatBRL(payload[0]?.value as number)}</p>
                </div>
              ) : null
            }
          />
          <ReferenceLine y={META} stroke="hsl(160, 60%, 45%)" strokeDasharray="6 4" />
          <Area type="monotone" dataKey="saldo" stroke="hsl(45, 90%, 55%)" fill="url(#gradSim)" strokeWidth={2} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

function SliderInput({
  label, value, onChange, min, max, step, format,
}: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step: number; format: (v: number) => string;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-xs text-muted-foreground uppercase tracking-wider">{label}</label>
        <span className="text-xs font-mono text-foreground font-medium">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-secondary rounded-full appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer
          [&::-webkit-slider-thumb]:shadow-[0_0_10px_hsl(160,60%,45%,0.4)]"
      />
    </div>
  );
}
