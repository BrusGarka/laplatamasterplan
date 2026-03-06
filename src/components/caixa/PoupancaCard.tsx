import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBRL } from "@/lib/utils";
import { useResumo } from "@/hooks/use-caixa";

interface PoupancaCardProps {
  anoMes: string;
}

export function PoupancaCard({ anoMes }: PoupancaCardProps) {
  const { data: resumo } = useResumo(anoMes);

  const acumuladoAnual = resumo?.acumuladoAnual ?? 0;
  const totalPoupanca = resumo?.totalPoupanca ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardHeader>
            <CardTitle>Acumulado anual</CardTitle>
            <CardDescription>Economia no ano</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatBRL(acumuladoAnual)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardHeader>
            <CardTitle>Total poupança</CardTitle>
            <CardDescription>Patrimônio em poupança</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatBRL(totalPoupanca)}
            </div>
          </CardContent>
        </Card>
      </div>
      {resumo?.porquinhos && Object.keys(resumo.porquinhos).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Porquinhos</CardTitle>
            <CardDescription>Reservas específicas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(resumo.porquinhos).map(([nome, valor]) => (
                <div
                  key={nome}
                  className="flex justify-between rounded-lg border p-3"
                >
                  <span className="font-medium capitalize">{nome}</span>
                  <span
                    className={`font-mono ${
                      valor >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-destructive"
                    }`}
                  >
                    {formatBRL(valor)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
