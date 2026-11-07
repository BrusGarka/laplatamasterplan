import { useMemo } from "react";
import { motion } from "framer-motion";
import { Layers } from "lucide-react";
import { TresFasesResumo } from "@/components/TresFasesResumo";
import { TresFasesTable } from "@/components/TresFasesTable";
import { usePremissas } from "@/contexts/PremissasContext";
import { APORTE_BASE, formatBRL, gerarProjecaoTresFases } from "@/lib/financial-engine";

export default function TresFases() {
  const { rentabilidade, inflacaoPorAno, taxaReal } = usePremissas();
  const taxaAnual = rentabilidade / 100;
  const taxaRealAnual = taxaReal / 100;
  const projecao = useMemo(
    () => gerarProjecaoTresFases(inflacaoPorAno, taxaAnual, taxaRealAnual),
    [inflacaoPorAno, taxaAnual, taxaRealAnual]
  );
  const aporte2025 = projecao.find((linha) => linha.ano === 2025)?.aporteAnual ?? APORTE_BASE;

  return (
    <div className="min-h-screen gradient-mesh">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <Layers className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">3 Fases</h1>
            </div>
            <p className="text-sm text-muted-foreground ml-12">
              Fase 1 até 2033, fase 2 até 2043 e renda passiva a partir de 2044. O aporte anual
              começa em {formatBRL(APORTE_BASE)} em 2024 e acompanha a inflação de cada ano.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-4 text-xs text-muted-foreground">
            <span className="font-mono bg-secondary px-3 py-1.5 rounded-md">
              Taxa: <span className="text-primary font-semibold">{rentabilidade.toFixed(2)}% a.a.</span>
            </span>
            <span className="font-mono bg-secondary px-3 py-1.5 rounded-md">
              2025: <span className="text-accent font-semibold">{formatBRL(aporte2025)}</span>
            </span>
          </div>
        </motion.header>

        <TresFasesResumo data={projecao} />

        <TresFasesTable data={projecao} />
      </div>
    </div>
  );
}
