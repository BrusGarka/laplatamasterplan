import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";
import { Progress } from "@/components/ui/progress";

// Exemplo: 6 meses de despesas (soma das despesas do Orçamento)
const DESPESAS_MENSAIS_ESTIMADAS = 8_500;
const MESES_META = 6;
const META_RESERVA = DESPESAS_MENSAIS_ESTIMADAS * MESES_META;
// Valor atual em aplicações de alta liquidez (ex.: conta, CDB D+0)
const VALOR_ATUAL_RESERVA = 25_000;

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function ReservaEmergencia() {
  const pctMeta = Math.min(100, (VALOR_ATUAL_RESERVA / META_RESERVA) * 100);
  const falta = Math.max(0, META_RESERVA - VALOR_ATUAL_RESERVA);

  return (
    <div className="min-h-screen gradient-mesh">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Reserva de Emergência</h1>
            <p className="text-sm text-muted-foreground">
              Meta: {MESES_META} meses de despesas — proteção antes de investir pesado
            </p>
          </div>
        </motion.header>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Meta (6 meses)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatBRL(META_RESERVA)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Base: {formatBRL(DESPESAS_MENSAIS_ESTIMADAS)}/mês
              </p>
            </CardContent>
          </Card>
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Valor atual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{formatBRL(VALOR_ATUAL_RESERVA)}</div>
              <p className="text-xs text-muted-foreground mt-1">Alocado em liquidez (conta, CDB D+0)</p>
            </CardContent>
          </Card>
          <Card className={falta <= 0 ? "border-emerald-500/20 bg-emerald-500/5" : ""}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {falta <= 0 ? "Status" : "Falta"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${falta <= 0 ? "text-emerald-600 dark:text-emerald-400" : ""}`}>
                {falta <= 0 ? "Meta atingida" : formatBRL(falta)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {falta <= 0 ? "Reserva de emergência completa" : "Para completar a reserva"}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Progresso da reserva</CardTitle>
            <CardDescription>
              Recomendação: manter 3 a 6 meses de despesas em aplicações de alta liquidez antes de
              comprometer com investimentos de longo prazo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progresso</span>
                <span className="font-mono font-medium">{pctMeta.toFixed(1)}%</span>
              </div>
              <Progress value={pctMeta} className="h-3" />
            </div>
            <p className="text-xs text-muted-foreground">
              Onde está sua reserva: conta corrente, poupança, CDB liquidez D+0 ou fundos
              referenciados. Evite aplicar a reserva em renda variável ou prazos longos.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
