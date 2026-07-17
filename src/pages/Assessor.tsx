import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  ListChecks,
  Mail,
  MessageCircle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarkdownContent } from "@/components/assessor/MarkdownContent";
import {
  ASSESSOR_MESES,
  ASSESSOR_MESES_DISPONIVEIS,
  getAssessorMes,
} from "@/data/assessor-data";
import { anoMesAnterior, anoMesProximo } from "@/lib/caixa-mes-nav";

function labelMes(anoMes: string): string {
  const [y, m] = anoMes.split("-").map(Number);
  const d = new Date(y, m - 1, 1);
  return format(d, "MMMM yyyy", { locale: ptBR });
}

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatData(iso: string): string {
  return format(parseISO(iso), "dd/MM/yyyy", { locale: ptBR });
}

function formatPercent(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}

export default function Assessor() {
  const mesesOrdenados = ASSESSOR_MESES_DISPONIVEIS;
  const [anoMes, setAnoMes] = useState(mesesOrdenados[0] ?? "");
  const [aba, setAba] = useState("relatorio");

  const mes = getAssessorMes(anoMes);

  const { limiteAnterior, limiteProximo } = useMemo(() => {
    const sorted = [...mesesOrdenados].sort();
    return {
      limiteAnterior: sorted[0] ?? anoMes,
      limiteProximo: sorted[sorted.length - 1] ?? anoMes,
    };
  }, [mesesOrdenados, anoMes]);

  const podeVoltar = anoMes > limiteAnterior;
  const podeAvancar = anoMes < limiteProximo;

  if (!mes) {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center">
        <p className="text-muted-foreground">Nenhum conteúdo do assessor disponível.</p>
      </div>
    );
  }

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
              <Briefcase className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Assessor</h1>
              <p className="text-sm text-muted-foreground">
                {mes.assessor} · Conta {mes.conta}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={!podeVoltar}
              onClick={() => setAnoMes(anoMesAnterior(anoMes))}
              aria-label="Mês anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Select value={anoMes} onValueChange={setAnoMes}>
              <SelectTrigger className="w-[180px] capitalize">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mesesOrdenados.map((m) => (
                  <SelectItem key={m} value={m} className="capitalize">
                    {labelMes(m)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              disabled={!podeAvancar}
              onClick={() => setAnoMes(anoMesProximo(anoMes))}
              aria-label="Próximo mês"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Patrimônio total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{formatBRL(mes.resumo.patrimonioTotal)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Ref. {formatData(mes.dataReferencia)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Rentabilidade do mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{formatPercent(mes.resumo.rentabilidadeMes)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatPercent(mes.resumo.percentualCDI)} do CDI
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Ganho do mês</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{formatBRL(mes.resumo.ganhoMes)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Rentabilidade no ano
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{formatPercent(mes.resumo.rentabilidadeAno)}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="capitalize">{labelMes(anoMes)}</CardTitle>
            <CardDescription>
              Relatório XP, e-mail, WhatsApp e análise de decisão — competência{" "}
              {formatData(mes.dataReferencia)}
              {mes.dataEmail && ` · e-mail em ${formatData(mes.dataEmail)}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={aba} onValueChange={setAba}>
              <TabsList className="mb-4">
                <TabsTrigger value="relatorio" className="gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  Relatório
                </TabsTrigger>
                <TabsTrigger value="email" className="gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  E-mail
                </TabsTrigger>
                <TabsTrigger value="whatsapp" className="gap-1.5">
                  <MessageCircle className="h-3.5 w-3.5" />
                  WhatsApp
                </TabsTrigger>
                {mes.analise && (
                  <TabsTrigger value="analise" className="gap-1.5">
                    <ListChecks className="h-3.5 w-3.5" />
                    Análise
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="relatorio" className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-muted-foreground">
                    Relatório de Investimentos XP — XPerformance
                  </p>
                  <a
                    href={mes.relatorioPdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    Abrir PDF
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
                <div className="rounded-md border overflow-hidden">
                  <iframe
                    title={`Relatório XP ${labelMes(anoMes)}`}
                    src={`${mes.relatorioPdf}#toolbar=1`}
                    className="w-full h-[720px]"
                  />
                </div>
              </TabsContent>

              <TabsContent value="email">
                <MarkdownContent content={mes.email} />
              </TabsContent>

              <TabsContent value="whatsapp">
                <MarkdownContent content={mes.whatsapp} />
              </TabsContent>

              {mes.analise && (
                <TabsContent value="analise">
                  <MarkdownContent content={mes.analise} />
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>

        {ASSESSOR_MESES.length > 1 && (
          <p className="text-xs text-center text-muted-foreground">
            {ASSESSOR_MESES.length} meses registrados
          </p>
        )}
      </div>
    </div>
  );
}
