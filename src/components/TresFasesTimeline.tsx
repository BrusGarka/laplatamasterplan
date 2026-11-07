import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowDownToLine, ArrowUpFromLine, Hourglass } from "lucide-react";
import {
  ANO_FIM_FASE_1,
  ANO_FIM_FASE_2,
  ANO_PROJECAO_FIM,
  ANO_PROJECAO_INICIO,
  formatBRL,
  formatCompact,
  type UnifiedYearData,
} from "@/lib/financial-engine";

const ANOS_CHAVE = [ANO_PROJECAO_INICIO, ANO_FIM_FASE_1, ANO_FIM_FASE_2, ANO_FIM_FASE_2 + 1, ANO_PROJECAO_FIM] as const;

const DURACAO_TOTAL = ANO_PROJECAO_FIM - ANO_PROJECAO_INICIO;

function posicaoAno(ano: number): number {
  return ((ano - ANO_PROJECAO_INICIO) / DURACAO_TOTAL) * 100;
}

interface TresFasesTimelineProps {
  data: UnifiedYearData[];
}

export function TresFasesTimeline({ data }: TresFasesTimelineProps) {
  const fimFase1 = data.find((linha) => linha.ano === ANO_FIM_FASE_1);
  const fimFase2 = data.find((linha) => linha.ano === ANO_FIM_FASE_2);
  const inicioFase3 = data.find((linha) => linha.ano === ANO_FIM_FASE_2 + 1);

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="stat-glow rounded-xl p-5 md:p-6 space-y-8"
      aria-label="Linha do tempo das três fases"
    >
      <div>
        <h2 className="text-lg font-semibold">Jornada em três atos</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Três blocos de igual destaque no plano. Abaixo, a linha do tempo real com os anos-chave de{" "}
          {ANO_PROJECAO_INICIO} a {ANO_PROJECAO_FIM}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-0 md:divide-x md:divide-border/60">
        <FasePainel
          ordem={1}
          titulo="Aportes"
          subtitulo="Alavancagem"
          anos={`${ANO_PROJECAO_INICIO} – ${ANO_FIM_FASE_1}`}
          detalhe="Aporte mensal corrigido pela inflação."
          metrica={fimFase1 ? formatCompact(fimFase1.saldoFinal) : "—"}
          metricaLegenda="Patrimônio ao fim"
          tom="accent"
          icon={<ArrowUpFromLine className="w-5 h-5" />}
          delay={0.05}
        />
        <FasePainel
          ordem={2}
          titulo="Espera"
          subtitulo="Hold & compound"
          anos={`${ANO_FIM_FASE_1 + 1} – ${ANO_FIM_FASE_2}`}
          detalhe="Sem aporte nem saque — só juro real."
          metrica={fimFase2 ? formatCompact(fimFase2.saldoFinal) : "—"}
          metricaLegenda="Patrimônio ao fim"
          tom="blue"
          icon={<Hourglass className="w-5 h-5" />}
          delay={0.12}
        />
        <FasePainel
          ordem={3}
          titulo="Saques"
          subtitulo="Renda passiva"
          anos={`${ANO_FIM_FASE_2 + 1} – ${ANO_PROJECAO_FIM}`}
          detalhe="SWR 4,5% — rendimento vira renda; patrimônio em patamar."
          metrica={inicioFase3?.rendaLiquidaMes ? `${formatBRL(inicioFase3.rendaLiquidaMes)}/mês` : "—"}
          metricaLegenda="Renda líq. (início)"
          tom="emerald"
          icon={<ArrowDownToLine className="w-5 h-5" />}
          delay={0.19}
        />
      </div>

      <div className="relative pt-2 pb-10 px-1 md:px-2">
        <div
          className="h-2 rounded-full"
          style={{
            background: `linear-gradient(90deg,
              hsl(45, 90%, 55%) 0%,
              hsl(45, 90%, 55%) ${posicaoAno(ANO_FIM_FASE_1)}%,
              hsl(200, 70%, 55%) ${posicaoAno(ANO_FIM_FASE_1)}%,
              hsl(200, 70%, 55%) ${posicaoAno(ANO_FIM_FASE_2 + 1)}%,
              hsl(160, 55%, 40%) ${posicaoAno(ANO_FIM_FASE_2 + 1)}%,
              hsl(160, 55%, 40%) 100%)`,
          }}
          role="presentation"
        />

        {ANOS_CHAVE.map((ano) => {
          const pos = posicaoAno(ano);
          const ehFronteira = ano === ANO_FIM_FASE_1 || ano === ANO_FIM_FASE_2;
          const ehInicioSaques = ano === ANO_FIM_FASE_2 + 1;
          let rotulo = "";
          if (ano === ANO_PROJECAO_INICIO) rotulo = "Início";
          else if (ano === ANO_FIM_FASE_1) rotulo = "Fim aportes";
          else if (ano === ANO_FIM_FASE_2) rotulo = "Fim espera";
          else if (ehInicioSaques) rotulo = "Saques";
          else if (ano === ANO_PROJECAO_FIM) rotulo = "Horizonte";

          return (
            <MarcoAno
              key={ano}
              ano={ano}
              posicaoPct={pos}
              rotulo={rotulo}
              destaque={ehFronteira || ehInicioSaques || ano === ANO_PROJECAO_INICIO || ano === ANO_PROJECAO_FIM}
            />
          );
        })}
      </div>
    </motion.section>
  );
}

function FasePainel({
  ordem,
  titulo,
  subtitulo,
  anos,
  detalhe,
  metrica,
  metricaLegenda,
  tom,
  icon,
  delay,
}: {
  ordem: number;
  titulo: string;
  subtitulo: string;
  anos: string;
  detalhe: string;
  metrica: string;
  metricaLegenda: string;
  tom: "accent" | "blue" | "emerald";
  icon: ReactNode;
  delay: number;
}) {
  const estilo = {
    accent: {
      badge: "bg-accent/15 text-accent border-accent/25",
      icon: "bg-accent/10 text-accent border-accent/20",
      barra: "bg-accent",
    },
    blue: {
      badge: "bg-sky-500/15 text-sky-400 border-sky-500/25",
      icon: "bg-sky-500/10 text-sky-400 border-sky-500/20",
      barra: "bg-sky-500",
    },
    emerald: {
      badge: "bg-emerald/15 text-emerald border-emerald/25",
      icon: "bg-emerald/10 text-emerald border-emerald/20",
      barra: "bg-emerald",
    },
  }[tom];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="flex flex-col gap-3 py-2 md:py-1 md:px-5"
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${estilo.badge}`}>
          Fase {ordem}
        </span>
        <div className={`p-2 rounded-lg border ${estilo.icon}`}>{icon}</div>
      </div>
      <div>
        <h3 className="text-base font-semibold">{titulo}</h3>
        <p className="text-xs text-muted-foreground">{subtitulo}</p>
      </div>
      <p className="text-xs font-mono text-foreground/90">{anos}</p>
      <p className="text-xs text-muted-foreground leading-relaxed flex-1">{detalhe}</p>
      <div className="pt-1">
        <p className="text-xl font-bold font-mono">{metrica}</p>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{metricaLegenda}</p>
      </div>
      <div className={`h-1 rounded-full ${estilo.barra} opacity-70`} />
    </motion.div>
  );
}

function MarcoAno({
  ano,
  posicaoPct,
  rotulo,
  destaque,
}: {
  ano: number;
  posicaoPct: number;
  rotulo: string;
  destaque: boolean;
}) {
  const alinhamento =
    posicaoPct <= 8 ? "items-start text-left -translate-x-0" : posicaoPct >= 92 ? "items-end text-right -translate-x-full" : "items-center text-center -translate-x-1/2";

  return (
    <div
      className={`absolute top-0 flex flex-col ${alinhamento}`}
      style={{ left: `${posicaoPct}%` }}
    >
      <span
        className={`mt-0.5 w-3 h-3 rounded-full border-2 border-background shadow-sm ${
          destaque ? "bg-foreground scale-110" : "bg-muted-foreground/80"
        }`}
      />
      <span className="mt-3 font-mono text-xs font-semibold whitespace-nowrap">{ano}</span>
      {rotulo && (
        <span className={`text-[10px] whitespace-nowrap ${destaque ? "text-foreground" : "text-muted-foreground"}`}>
          {rotulo}
        </span>
      )}
    </div>
  );
}
