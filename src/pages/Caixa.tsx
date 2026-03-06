import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PiggyBank, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useMesesComDados } from "@/hooks/use-caixa";
import { ContasMesCard } from "@/components/caixa/ContasMesCard";
import { PosicaoBalancoCard } from "@/components/caixa/PosicaoBalancoCard";
import { FluxoMensalCard } from "@/components/caixa/FluxoMensalCard";

function anoMesAtual(): string {
  const now = new Date();
  return format(now, "yyyy-MM");
}

function anoMesAnterior(anoMes: string): string {
  const [y, m] = anoMes.split("-").map(Number);
  const d = new Date(y, m - 2, 1);
  return format(d, "yyyy-MM");
}

function anoMesProximo(anoMes: string): string {
  const [y, m] = anoMes.split("-").map(Number);
  const d = new Date(y, m, 1);
  return format(d, "yyyy-MM");
}

function labelMes(anoMes: string): string {
  const [y, m] = anoMes.split("-").map(Number);
  const d = new Date(y, m - 1, 1);
  return format(d, "MMMM yyyy", { locale: ptBR });
}

export default function Caixa() {
  const atual = anoMesAtual();
  const [anoMes, setAnoMes] = useState(atual);

  const { data: mesesComDados = [], isError, error } = useMesesComDados();

  const opcoesMes = useMemo(() => {
    const anterior = anoMesAnterior(atual);
    const proximo = anoMesProximo(atual);
    return [proximo, atual, anterior];
  }, [atual]);

  const podeVoltar = anoMes !== anoMesAnterior(atual);
  const podeAvancar = anoMes !== anoMesProximo(atual);

  return (
    <div className="min-h-screen gradient-mesh">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <PiggyBank className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Orçamento e Fluxo de Caixa
              </h1>
              <p className="text-sm text-muted-foreground">
                Contas do mês, posição de caixa e balanço ativo x passivo
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Mês:</span>
            <div className="flex items-center rounded-md border">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 rounded-r-none"
                onClick={() => podeVoltar && setAnoMes(anoMesAnterior(anoMes))}
                disabled={!podeVoltar}
                aria-label="Mês anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Select value={anoMes} onValueChange={setAnoMes}>
                <SelectTrigger className="h-9 w-[160px] border-0 rounded-none focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {opcoesMes.map((m) => (
                    <SelectItem key={m} value={m}>
                      {labelMes(m)}
                      {m === atual ? " (atual)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 rounded-l-none"
                onClick={() => podeAvancar && setAnoMes(anoMesProximo(anoMes))}
                disabled={!podeAvancar}
                aria-label="Próximo mês"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
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

        <Tabs defaultValue="contas" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3">
            <TabsTrigger value="contas">Contas do mês</TabsTrigger>
            <TabsTrigger value="posicao">Posição e balanço</TabsTrigger>
            <TabsTrigger value="fluxo">Fluxo mensal</TabsTrigger>
          </TabsList>
          <TabsContent value="contas" className="space-y-4">
            <ContasMesCard anoMes={anoMes} />
          </TabsContent>
          <TabsContent value="posicao" className="space-y-4">
            <PosicaoBalancoCard anoMes={anoMes} />
          </TabsContent>
          <TabsContent value="fluxo" className="space-y-4">
            <FluxoMensalCard anoMes={anoMes} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
