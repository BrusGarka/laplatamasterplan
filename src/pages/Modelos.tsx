import { motion } from "framer-motion";
import { Percent } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ANOS_APORTE,
  ANOS_HOLD,
  ANOS_SAQUE,
  APORTE_ANUAL_NOMINAL,
  IPCA,
  JURO_REAL_CHEIO,
  modeloVencedor,
  pisoIsentoParaEmpatarTesouro,
  simularModelos,
  type FaseResultado,
  type ModeloResultado,
} from "@/lib/modelos-remuneracao";

const modelos = simularModelos();
const vencedor = modeloVencedor(modelos);
const pisoIsento = pisoIsentoParaEmpatarTesouro();

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

function formatPct(value: number): string {
  return `${(value * 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
}

function detalheCusto(fase: FaseResultado): string {
  const partes = [`juro real bruto ${formatPct(fase.juroRealBruto)}`, `IR ${formatPct(fase.ir)}`];
  if (fase.fee > 0) partes.push(`fee ${formatPct(fase.fee)}`);
  if (fase.custodia > 0) partes.push(`custódia ${formatPct(fase.custodia)}`);
  return partes.join(" · ");
}

function FaseBloco({ fase, rendaMensal }: { fase: FaseResultado; rendaMensal?: number }) {
  const ehRenda = fase.nome === "Renda passiva";

  return (
    <div className="rounded-lg border bg-background/60 p-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-semibold">{fase.nome}</p>
        <p className="text-xs text-muted-foreground">{fase.anos} anos</p>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight">
        {ehRenda ? `${formatBRL(rendaMensal ?? 0)}/mês` : formatBRL(fase.patrimonioReal)}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {ehRenda
          ? "renda real, principal parado em termos reais"
          : "patrimônio real ao fim da fase, em reais de hoje"}
      </p>
      <p className="mt-3 text-sm">
        Taxa real líquida{" "}
        <span className="font-semibold">{formatPct(fase.taxaRealLiquida)}</span>
      </p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{detalheCusto(fase)}</p>
    </div>
  );
}

function ColunaModelo({ modelo, destaque }: { modelo: ModeloResultado; destaque: boolean }) {
  return (
    <Card className={destaque ? "h-full border-primary shadow-sm" : "h-full"}>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-xl">{modelo.nome}</CardTitle>
          {destaque && <Badge>Maior renda real</Badge>}
        </div>
        <CardDescription className="leading-relaxed">{modelo.resumo}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {modelo.fases.map((fase) => (
          <FaseBloco
            key={fase.nome}
            fase={fase}
            rendaMensal={fase.nome === "Renda passiva" ? modelo.rendaMensalReal : undefined}
          />
        ))}
        <p className="text-xs text-muted-foreground">
          Em {ANOS_SAQUE} anos de saque, {formatBRL(modelo.totalSacadoReal)} em reais de hoje, com o
          principal real preservado.
        </p>
      </CardContent>
    </Card>
  );
}

export default function Modelos() {
  return (
    <div className="min-h-screen gradient-mesh">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
        <motion.header initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-primary/20 bg-primary/10 p-2">
              <Percent className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Modelos</h1>
              <p className="text-sm text-muted-foreground">
                Comissão, Fee fixo e Tesouro Direto no mesmo risco
              </p>
            </div>
          </div>
        </motion.header>

        <Card className="border-primary/40">
          <CardHeader>
            <CardTitle className="text-lg">
              Na renda passiva, {vencedor.nome} leva
            </CardTitle>
            <CardDescription className="text-sm leading-relaxed text-foreground/80">
              {formatPct(vencedor.taxaRealLiquidaRenda)} ao ano líquido real, cerca de{" "}
              {formatBRL(vencedor.rendaMensalReal)} por mês em reais de hoje. Fee fixo é o mesmo
              título público menos 1% ao ano. Comissão fica no meio porque o spread come 1 ponto
              do juro, e o IR menor não recupera isso.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Cenário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Fase 1: {ANOS_APORTE} anos aportando {formatBRL(APORTE_ANUAL_NOMINAL)} nominais por
              ano, sem corrigir pela inflação.
            </p>
            <p>
              Fase 2: {ANOS_HOLD} anos de hold, o mesmo horizonte da Fase 2 do Master Plan. Sem
              aporte e sem saque.
            </p>
            <p>
              Fase 3: saque da renda passiva por {ANOS_SAQUE} anos. Sai só o juro real líquido.
            </p>
            <p>
              Régua comum: IPCA {formatPct(IPCA)} e juro real cheio {formatPct(JURO_REAL_CHEIO)}{" "}
              (nominal bruto {formatPct((1 + IPCA) * (1 + JURO_REAL_CHEIO) - 1)}). IR do Tesouro e
              do Fee incide sobre o ganho nominal.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 items-stretch gap-4">
          {modelos.map((modelo) => (
            <ColunaModelo
              key={modelo.id}
              modelo={modelo}
              destaque={modelo.id === vencedor.id}
            />
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Onde a comissão ainda pode ganhar</CardTitle>
            <CardDescription className="leading-relaxed">
              Um CRA ou LCI isento supera o Tesouro na taxa se o juro real que sobra para o cliente
              passar de {formatPct(pisoIsento)} e o emissor pagar. Isso é outro risco, não o mesmo
              título. A carteira atual está nessa prateleira (IPCA+7% a 8% isento) justamente com o
              crédito que o Cleiton já marcou para sair aos poucos.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
