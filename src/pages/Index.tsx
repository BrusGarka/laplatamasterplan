import { useMemo } from "react";
import { motion } from "framer-motion";
import { gerarProjecaoPadrao, META } from "@/lib/financial-engine";
import { StatsGrid } from "@/components/StatsGrid";
import { ProjectionTable } from "@/components/ProjectionTable";
import { ProjectionCharts } from "@/components/ProjectionCharts";
import { Phase2Dashboard } from "@/components/Phase2Dashboard";
import { Simulator } from "@/components/Simulator";
import { Shield } from "lucide-react";

const Index = () => {
  const projecao = useMemo(() => gerarProjecaoPadrao(), []);
  const atual = projecao.find((d) => d.ano === 2026);
  const final2033 = projecao[projecao.length - 1];
  const anoMeta = projecao.find((d) => d.saldoFinal >= META);
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
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Master Plan Financeiro 360°</h1>
            </div>
            <p className="text-sm text-muted-foreground ml-12">
              Planejamento Patrimonial Estratégico • 2024–2033
            </p>
          </div>
          <div className="hidden md:flex items-center gap-4 text-xs text-muted-foreground">
            <span className="font-mono bg-secondary px-3 py-1.5 rounded-md">
              Taxa: <span className="text-primary font-semibold">10,77% a.a.</span>
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
        <ProjectionCharts data={projecao} />

        {/* Table */}
        <ProjectionTable data={projecao} />

        {/* === FASE 2 === */}
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
          <p className="mt-1">Metodologia: aportes progressivos mensais • IPCA 4,5% + Juro Real 6%</p>
        </motion.footer>
      </div>
    </div>
  );
};

export default Index;
