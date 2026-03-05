import { motion } from "framer-motion";
import { formatCompact } from "@/lib/financial-engine";
import { TrendingUp, Target, Percent, Calendar } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  delay?: number;
  variant?: "emerald" | "gold" | "default";
}

function StatCard({ label, value, subtitle, icon, delay = 0, variant = "default" }: StatCardProps) {
  const borderClass = variant === "emerald" 
    ? "border-emerald/20 glow-emerald" 
    : variant === "gold" 
    ? "border-accent/20 glow-gold" 
    : "border-border";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={`stat-glow rounded-lg p-5 ${borderClass}`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-md bg-secondary">
          {icon}
        </div>
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold font-mono text-foreground animate-count-up">{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </motion.div>
  );
}

interface StatsGridProps {
  saldoAtual: number;
  projecao2033: number;
  pctMeta: number;
  anosRestantes: number;
}

export function StatsGrid({ saldoAtual, projecao2033, pctMeta, anosRestantes }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Patrimônio Atual"
        value={formatCompact(saldoAtual)}
        subtitle="Março 2026"
        icon={<TrendingUp className="w-4 h-4 text-primary" />}
        delay={0}
        variant="emerald"
      />
      <StatCard
        label="Projeção 2033"
        value={formatCompact(projecao2033)}
        subtitle="Meta ultrapassada"
        icon={<Target className="w-4 h-4 text-accent" />}
        delay={0.1}
        variant="gold"
      />
      <StatCard
        label="% da Meta"
        value={`${pctMeta}%`}
        subtitle={`Meta: R$ 2M`}
        icon={<Percent className="w-4 h-4 text-primary" />}
        delay={0.2}
      />
      <StatCard
        label="Anos p/ Meta"
        value={`~${anosRestantes}`}
        subtitle="com aportes atuais"
        icon={<Calendar className="w-4 h-4 text-accent" />}
        delay={0.3}
      />
    </div>
  );
}
