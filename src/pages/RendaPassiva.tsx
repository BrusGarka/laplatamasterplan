import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coins, Layers, TrendingUp, Shield, Zap, Info } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { IF_ALVO_RENDA } from "@/lib/financial-engine";

// --- Constantes do cenário (adaptáveis) ---
const PATRIMONIO_EXEMPLO = 5_000_000; // R$5M como na lâmina
const RENDA_MENSAL_ALVO = IF_ALVO_RENDA; // R$15k — meta do Master Plan; pode usar 22_500 para exemplo “R$22,5k”
const ANOS_SIMULACAO = 35;

// Sequência de retornos adversos: -8% ano 1, depois fraco até ano 5, depois normal
function retornoAnual(ano: number): number {
  if (ano === 1) return -0.08;
  if (ano >= 2 && ano <= 5) return 0.02; // fraco
  return 0.06; // juro real ~6% após crise
}

// Gera dados para as 5 estratégias
interface AnoSimulacao {
  ano: number;
  bucket: number;
  rendaPerpetua: number;
  swr35: number;
  swr45: number;
  floorUpside: number;
}

function simularEstrategias(): AnoSimulacao[] {
  const rendaAnual = RENDA_MENSAL_ALVO * 12;
  const dados: AnoSimulacao[] = [];
  let pBucket = PATRIMONIO_EXEMPLO;
  let pRendaPerpetua = PATRIMONIO_EXEMPLO;
  let pSwr35 = PATRIMONIO_EXEMPLO;
  let pSwr45 = PATRIMONIO_EXEMPLO;
  let pFloor = PATRIMONIO_EXEMPLO;

  for (let a = 1; a <= ANOS_SIMULACAO; a++) {
    const r = retornoAnual(a);

    // Bucket: não saca de B3 em anos ruins; consome B1 (≈ 29 meses de reserva). Simplificado: saque = rendaAnual, crescimento aplicado ao total
    pBucket = pBucket * (1 + r) - rendaAnual;
    if (pBucket < 0) pBucket = 0;

    // Renda perpétua: saca só o yield (7.2% líquido), principal não é tocado; patrimônio cresce com retorno
    const yieldRendaPerpetua = 0.072;
    const saqueRendaPerpetua = pRendaPerpetua * yieldRendaPerpetua;
    pRendaPerpetua = pRendaPerpetua * (1 + r) - Math.min(saqueRendaPerpetua, rendaAnual);
    if (pRendaPerpetua < 0) pRendaPerpetua = 0;

    // SWR 3.5% e 4.5%
    const saque35 = pSwr35 * 0.035;
    const saque45 = pSwr45 * 0.045;
    pSwr35 = pSwr35 * (1 + r) - saque35;
    pSwr45 = pSwr45 * (1 + r) - saque45;
    if (pSwr35 < 0) pSwr35 = 0;
    if (pSwr45 < 0) pSwr45 = 0;

    // Floor & Upside: 15 anos de piso em IPCA+; simplificado como patrimônio que sustenta 15 anos de despesas e o resto rende
    const pisoAnos = 15;
    const pisoTotal = rendaAnual * pisoAnos;
    const parteRisco = Math.max(0, pFloor - pisoTotal);
    const partePiso = Math.min(pisoTotal, pFloor);
    const retornoPiso = 0.06; // IPCA+ real
    pFloor = partePiso * (1 + retornoPiso) + parteRisco * (1 + r) - rendaAnual;
    if (pFloor < 0) pFloor = 0;

    dados.push({
      ano: a,
      bucket: Math.round(pBucket),
      rendaPerpetua: Math.round(pRendaPerpetua),
      swr35: Math.round(pSwr35),
      swr45: Math.round(pSwr45),
      floorUpside: Math.round(pFloor),
    });
  }

  return dados;
}

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
  return String(value);
}

const chartConfig = {
  ano: { label: "Ano" },
  bucket: { label: "Bucket System", color: "hsl(220, 70%, 50%)" },
  rendaPerpetua: { label: "Renda Perpétua", color: "hsl(150, 60%, 40%)" },
  swr35: { label: "SWR 3,5%", color: "hsl(280, 60%, 55%)" },
  swr45: { label: "SWR 4,5%", color: "hsl(30, 80%, 55%)" },
  floorUpside: { label: "Floor & Upside", color: "hsl(180, 50%, 45%)" },
};

export default function RendaPassiva() {
  const [patrimonioInput, setPatrimonioInput] = useState(PATRIMONIO_EXEMPLO);
  const dadosSimulacao = useMemo(() => simularEstrategias(), []);

  // Bucket allocation para o patrimônio de exemplo
  const b1 = Math.round(patrimonioInput * 0.12);
  const b2 = Math.round(patrimonioInput * 0.28);
  const b3 = Math.round(patrimonioInput * 0.6);
  const mesesReservaB1 = Math.floor((b1 / RENDA_MENSAL_ALVO));
  const yieldB2Exemplo = 0.072; // 7.2% líquido isento
  const rendaB2Mensal = (b2 * yieldB2Exemplo) / 12;

  return (
    <div className="min-h-screen gradient-mesh">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <Coins className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Renda Passiva & Descumulação</h1>
            <p className="text-sm text-muted-foreground">
              Bucket System, estratégias de saque e simulação com sequência de retornos adversos
            </p>
          </div>
        </motion.header>

        <Tabs defaultValue="bucket" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid lg:grid-cols-3">
            <TabsTrigger value="bucket">Bucket System</TabsTrigger>
            <TabsTrigger value="estrategias">Estratégias</TabsTrigger>
            <TabsTrigger value="simulacao">Simulação</TabsTrigger>
          </TabsList>

          <TabsContent value="bucket" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-5 h-5" />
                  O que é o Bucket System?
                </CardTitle>
                <CardDescription>
                  Não é mensal, trimestral ou anual — é os três em camadas. Você separa o patrimônio em
                  três “velocidades” e nunca saca do crescimento (B3) em crise; o B1 aguenta até o mercado
                  se recuperar.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="border-blue-500/30 bg-blue-500/5">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Bucket 1 — Caixa</CardTitle>
                      <CardDescription>12% • Tesouro Selic + CDB DI</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                      <p>Seu &quot;salário&quot; mensal. Reserva para 12–18 meses (ou mais) de despesas.</p>
                      <p className="font-mono text-primary mt-2">
                        {formatBRL(b1)} ≈ {mesesReservaB1} meses de renda
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-emerald-500/30 bg-emerald-500/5">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Bucket 2 — Renda</CardTitle>
                      <CardDescription>28% • FIIs + LCI/LCA</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                      <p>Isento de IR. Abastece o B1 semestralmente (escada de LCI/LCA).</p>
                      <p className="font-mono text-emerald-600 dark:text-emerald-400 mt-2">
                        ~{formatBRL(rendaB2Mensal)}/mês só de B2 (exemplo)
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-amber-500/30 bg-amber-500/5">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Bucket 3 — Crescimento</CardTitle>
                      <CardDescription>60% • IPCA+ + CDB + ETFs</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                      <p>Rebalanceado 1x por ano; alimenta o B2. Nunca sacar do B3 mensalmente.</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Resgates &gt;720 dias: IR 15%. Evita risco de sequência.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    Escada de LCI/LCA no B2
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    4 tranches com vencimentos a cada 6 meses (6m, 12m, 18m, 24m), IPCA+6–7,5%, 100% isentas.
                    A cada vencimento: reinveste 80% e deposita 20% no B1. Renda previsível, isenta, sem
                    lacunas de caixa.
                  </p>
                </div>

                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary" />
                    Hack tributário
                  </h4>
                  <p className="text-sm">
                    Vendas de ações até <strong>R$20k/mês</strong> são isentas de IR — até{" "}
                    <strong>R$240k/ano</strong> livres com uma carteira de dividend payers bem estruturada.
                    Combine com FIIs e LCI/LCA para maximizar renda isenta.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm text-muted-foreground">Ver com patrimônio:</span>
                  <input
                    type="number"
                    min={500_000}
                    step={100_000}
                    value={patrimonioInput / 1_000_000}
                    onChange={(e) => setPatrimonioInput(Number(e.target.value) * 1_000_000)}
                    className="w-24 h-9 rounded-md border bg-background px-2 text-sm font-mono"
                  />
                  <span className="text-sm text-muted-foreground">milhões</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="estrategias" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>As 5 estratégias de descumulação</CardTitle>
                <CardDescription>
                  Comparação resumida. Na simulação, todas partem do mesmo patrimônio e enfrentam
                  sequência de retornos adversos nos primeiros 5 anos (-8% no ano 1, depois fraco).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3 text-sm">
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 font-semibold text-xs">1</span>
                    <div>
                      <strong>Bucket System</strong> — Estrutura operacional: B1 protege (29+ meses de reserva),
                      B2 rende isento, B3 cresce e só rebalanceia 1x/ano. Você nunca vende B3 em crise.
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">2</span>
                    <div>
                      <strong>Renda Perpétua</strong> — 75% em isentos (FIIs + LCI/LCA + CRI/CRA). Yield líquido
                      ~7,2%. O patrimônio gera a renda sem nunca tocar o principal; ideal para legado.
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400 font-semibold text-xs">3</span>
                    <div>
                      <strong>SWR 3,5%</strong> — Saque seguro conservador. Sustentável por 40+ anos; no gráfico
                      acompanha ou supera as melhores estratégias no longo prazo.
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500/20 text-orange-600 dark:text-orange-400 font-semibold text-xs">4</span>
                    <div>
                      <strong>SWR 4,5%</strong> — Plano original mais agressivo. Em cenários de sequência
                      adversa fica atrás; risco maior de esgotar o capital.
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-semibold text-xs">5</span>
                    <div>
                      <strong>Floor & Upside</strong> — Tesouro IPCA+ escalonado cobre 15 anos de despesas;
                      o restante pode ser mais agressivo. Reduz ansiedade; você tem piso garantido.
                    </div>
                  </li>
                </ul>

                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      O que faz sentido para você
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p>
                      Híbrido: use o <strong>Bucket System</strong> como arquitetura operacional (B1 protege,
                      B2 rende isento, B3 cresce) e dentro do B2 aplique a filosofia da <strong>Renda Perpétua</strong> —
                      maximize FIIs + LCI/LCA, minimize a necessidade de resgatar B3. Assim você junta proteção
                      contra sequência de retornos, yield isento alto e crescimento real. Se o patrimônio chegar
                      a R$7M+, pode simplificar para SWR 3,5% puro — zero gestão ativa.
                    </p>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="simulacao" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Simulação: sequência de retornos adversos</CardTitle>
                <CardDescription>
                  Cenário de stress: -8% no ano 1, retorno fraco (2% a.a.) até o ano 5, depois 6% a.a. real.
                  Patrimônio inicial: {formatBRL(PATRIMONIO_EXEMPLO)}. Renda alvo: {formatBRL(RENDA_MENSAL_ALVO)}/mês.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[360px] w-full">
                  <LineChart data={dadosSimulacao} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="ano" tick={{ fontSize: 11 }} />
                    <YAxis
                      tickFormatter={(v) => formatCompact(v)}
                      tick={{ fontSize: 11 }}
                      label={{ value: "Patrimônio (R$)", angle: -90, position: "insideLeft", fontSize: 11 }}
                    />
                    <ChartTooltip content={<ChartTooltipContent formatter={(v) => formatBRL(Number(v))} />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <ReferenceLine y={0} stroke="hsl(var(--destructive))" strokeDasharray="2 2" />
                    <Line type="monotone" dataKey="bucket" stroke="var(--color-bucket)" strokeWidth={2} dot={false} name="bucket" />
                    <Line type="monotone" dataKey="rendaPerpetua" stroke="var(--color-rendaPerpetua)" strokeWidth={2} strokeDasharray="5 5" dot={false} name="rendaPerpetua" />
                    <Line type="monotone" dataKey="swr35" stroke="var(--color-swr35)" strokeWidth={2} dot={false} name="swr35" />
                    <Line type="monotone" dataKey="swr45" stroke="var(--color-swr45)" strokeWidth={2} dot={false} name="swr45" />
                    <Line type="monotone" dataKey="floorUpside" stroke="var(--color-floorUpside)" strokeWidth={2} dot={false} name="floorUpside" />
                  </LineChart>
                </ChartContainer>
                <p className="text-xs text-muted-foreground mt-3">
                  Renda Perpétua (linha tracejada verde) e SWR 3,5% tendem a dominar no longo prazo neste
                  cenário. SWR 4,5% fica atrás. O Bucket System protege nos primeiros anos ao não forçar
                  venda de B3 na queda.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
