import { useMemo } from "react";
import { motion } from "framer-motion";
import { gerarProjecaoPadrao, gerarProjecaoUnificada, META } from "@/lib/financial-engine";
import { StatsGrid } from "@/components/StatsGrid";
import { ProjectionTable } from "@/components/ProjectionTable";
import { ProjectionCharts } from "@/components/ProjectionCharts";
import { Phase2Dashboard } from "@/components/Phase2Dashboard";
import { Simulator } from "@/components/Simulator";
import { TrendingUp } from "lucide-react";
import { usePremissas } from "@/contexts/PremissasContext";

export default function MasterPlan() {
  const { rentabilidade, inflacao, taxaReal } = usePremissas();
  const projecaoFase1 = useMemo(() => gerarProjecaoPadrao(), []);
  const projecaoUnificada = useMemo(() => gerarProjecaoUnificada(), []);
  const atual = projecaoFase1.find((d) => d.ano === 2026);
  const final2033 = projecaoFase1[projecaoFase1.length - 1];
  const anoMeta = projecaoFase1.find((d) => d.saldoFinal >= META);
  const anosRestantes = anoMeta ? anoMeta.ano - 2026 : 99;

  return (
    <div className="min-h-screen gradient-mesh">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Master Plan Financeiro 360°</h1>
            </div>
            <p className="text-sm text-muted-foreground ml-12">
              Planejamento Patrimonial Estratégico • Fase 1 & 2
            </p>
          </div>
          <div className="hidden md:flex items-center gap-4 text-xs text-muted-foreground">
            <span className="font-mono bg-secondary px-3 py-1.5 rounded-md">
              Taxa: <span className="text-primary font-semibold">{rentabilidade.toFixed(2)}% a.a.</span>
            </span>
            <span className="font-mono bg-secondary px-3 py-1.5 rounded-md">
              Meta: <span className="text-accent font-semibold">R$ 2M</span>
            </span>
          </div>
        </motion.header>

        {/* Stats */}
        <StatsGrid
          saldoAtual={atual?.saldoInicial ?? 224_000}
          projecao2033={final2033.saldoFinal}
          pctMeta={final2033.pctMeta}
          anosRestantes={anosRestantes}
        />

        {/* Charts */}
        <ProjectionCharts data={projecaoFase1} />

        {/* Unified Table */}
        <ProjectionTable data={projecaoUnificada} />

        {/* Phase 2 Charts */}
        <Phase2Dashboard
          patrimonioFase1={final2033.saldoFinal}
          idadeFimFase1={final2033.idade}
          anoFimFase1={final2033.ano}
        />

        {/* Simulator */}
        <Simulator />

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-xs text-muted-foreground py-6 border-t border-border"
        >
          <p>⚠ Documento confidencial — uso exclusivo do cliente</p>
          <p className="mt-1">
            Metodologia: aportes progressivos mensais • IPCA {inflacao.toFixed(1)}% + Juro Real {taxaReal.toFixed(2)}%
          </p>
        </motion.footer>
      </div>
    </div>
  );
}
