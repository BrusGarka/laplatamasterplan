import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from "date-fns";
import { useMesesComDados } from "@/hooks/use-caixa";
import { FluxoMensalCard } from "@/components/caixa/FluxoMensalCard";

function anoMesAtual(): string {
  return format(new Date(), "yyyy-MM");
}

export default function FluxoMensal() {
  const atual = anoMesAtual();
  const { data: mesesComDados = [], isError, error } = useMesesComDados();

  const meses = useMemo(
    () =>
      [...new Set([...mesesComDados, atual])]
        .filter((m) => m <= atual)
        .sort(),
    [mesesComDados, atual]
  );

  return (
    <div className="min-h-screen gradient-mesh">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Fluxo mensal</h1>
            <p className="text-sm text-muted-foreground">
              Receita, despesa e aporte de todos os meses monitorados
            </p>
          </div>
        </motion.header>

        {isError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erro ao conectar ao Redis</AlertTitle>
            <AlertDescription>
              Verifique a conexão com o Upstash Redis.{" "}
              {error instanceof Error ? error.message : ""}
            </AlertDescription>
          </Alert>
        )}

        <FluxoMensalCard meses={meses} />
      </div>
    </div>
  );
}
