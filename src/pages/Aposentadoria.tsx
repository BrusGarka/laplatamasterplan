import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Landmark } from "lucide-react";
import { Phase2Dashboard } from "@/components/Phase2Dashboard";
import { gerarProjecaoPadrao } from "@/lib/financial-engine";

export default function Aposentadoria() {
  const projecaoFase1 = useMemo(() => gerarProjecaoPadrao(), []);
  const final2033 = projecaoFase1.length > 0 ? projecaoFase1[projecaoFase1.length - 1] : null;

  if (!final2033) {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center">
        <p className="text-muted-foreground">Carregando projeção...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-mesh">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <Landmark className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Aposentadoria — Fase 2</h1>
            <p className="text-sm text-muted-foreground">
              Pós-meta patrimonial: sustentabilidade, gastos esperados e drawdown
            </p>
          </div>
        </motion.header>

        <Phase2Dashboard
          patrimonioFase1={final2033.saldoFinal}
          idadeFimFase1={final2033.idade}
          anoFimFase1={final2033.ano}
        />

        <Card>
          <CardHeader>
            <CardTitle>Sobre a Fase 2</CardTitle>
            <CardDescription>
              Após atingir a meta do Master Plan, a Fase 2 considera apenas os rendimentos do
              patrimônio (sem novos aportes). A taxa de retirada (SWR) e a expectativa de vida
              definem se o patrimônio é suficiente para manter o padrão desejado.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">SWR (Safe Withdrawal Rate):</strong> percentual
              retirado do patrimônio por ano. Valores entre 3,5% e 4,5% são usados em planejamentos
              conservadores para evitar esgotar o capital.
            </p>
            <p>
              <strong className="text-foreground">Independência financeira:</strong> quando a renda
              passiva (rendimentos do patrimônio) cobre seus gastos, você deixa de depender de
              salário ativo.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
