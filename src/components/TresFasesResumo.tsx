import type { ReactNode } from "react";
import { motion } from "framer-motion";
import type { UnifiedYearData } from "@/lib/financial-engine";
import {
  ANO_FIM_FASE_1,
  ANO_FIM_FASE_2,
  ANO_PROJECAO_FIM,
  ANO_PROJECAO_INICIO,
  APORTE_BASE,
  formatBRL,
  formatCompact,
} from "@/lib/financial-engine";
import { ArrowDownToLine, ArrowUpFromLine, Hourglass, Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface TresFasesResumoProps {
  data: UnifiedYearData[];
}

const FASE2_INICIO = ANO_FIM_FASE_1 + 1;
const FASE3_INICIO = ANO_FIM_FASE_2 + 1;

function ResumoColuna({
  fase,
  titulo,
  subtitulo,
  destaque,
  descricaoPopover,
  icon,
  accent,
  delay,
}: {
  fase: string;
  titulo: string;
  subtitulo: string;
  destaque: string;
  descricaoPopover: string;
  icon: ReactNode;
  accent: "accent" | "blue" | "emerald";
  delay: number;
}) {
  const estilos = {
    accent: {
      icon: "bg-accent/15 text-accent border-accent/20",
      badge: "bg-accent/15 text-accent",
      tint: "from-accent/10 via-transparent to-transparent",
    },
    blue: {
      icon: "bg-sky-500/15 text-sky-400 border-sky-500/25",
      badge: "bg-sky-500/15 text-sky-400",
      tint: "from-sky-500/10 via-transparent to-transparent",
    },
    emerald: {
      icon: "bg-emerald/15 text-emerald border-emerald/20",
      badge: "bg-emerald/15 text-emerald",
      tint: "from-emerald/10 via-transparent to-transparent",
    },
  }[accent];

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`relative flex flex-col gap-4 p-5 md:p-6 min-h-full bg-gradient-to-b ${estilos.tint}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${estilos.badge}`}>
          {fase}
        </span>
        <div className={`p-2.5 rounded-lg border ${estilos.icon}`}>{icon}</div>
      </div>
      <div>
        <h3 className="text-lg font-semibold tracking-tight">{titulo}</h3>
        <p className="text-sm text-muted-foreground mt-0.5">{subtitulo}</p>
      </div>
      <div className="flex items-end gap-2">
        <p className="text-2xl font-bold font-mono leading-none">{destaque}</p>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="mb-0.5 rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`Detalhes: ${titulo}`}
            >
              <Info className="h-4 w-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 text-sm leading-relaxed" align="start">
            {descricaoPopover}
          </PopoverContent>
        </Popover>
      </div>
    </motion.article>
  );
}

export function TresFasesResumo({ data }: TresFasesResumoProps) {
  const fase1 = data.filter((linha) => linha.fase === 1);
  const fase2 = data.filter((linha) => linha.fase === 2);
  const fase3 = data.filter((linha) => linha.fase === 3);

  const fimFase1 = fase1.at(-1);
  const inicioFase2 = fase2[0];
  const fimFase2 = fase2.at(-1);
  const inicioFase3 = fase3[0];
  const renda2044 = inicioFase3?.rendaLiquidaMes;
  const marcoIf = fase3.find((linha) => linha.marco?.includes("Alvo")) ?? fase3.find((linha) => linha.rendaLiquidaMes);

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="stat-glow rounded-xl border border-border/80 overflow-hidden"
      aria-label="Resumo das três fases"
    >
      <header className="px-5 md:px-6 pt-5 md:pt-6 pb-4 border-b border-border/60 bg-secondary/20">
        <h2 className="text-lg font-semibold">Resumo do plano</h2>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-0 md:divide-x md:divide-border/60">
        <ResumoColuna
          fase="Fase 1"
          titulo="Aportes"
          subtitulo="Alavancagem"
          destaque="100 mil/ano"
          descricaoPopover={`Base em ${formatBRL(APORTE_BASE)} em 2024, corrigida pela inflação cada ano. Patrimônio ao fim: ${
            fimFase1 ? formatCompact(fimFase1.saldoFinal) : "—"
          } (${fimFase1?.idade ?? "—"} anos).`}
          icon={<ArrowUpFromLine className="w-5 h-5" />}
          accent="accent"
          delay={0.05}
        />
        <ResumoColuna
          fase="Fase 2"
          titulo="Espera"
          subtitulo="Hold & Compound"
          destaque={fimFase2 ? formatCompact(fimFase2.saldoFinal) : "—"}
          descricaoPopover={`Hold sem novos aportes nem saques. De ${
            inicioFase2 ? formatCompact(inicioFase2.saldoInicial) : "—"
          } para ${fimFase2 ? formatCompact(fimFase2.saldoFinal) : "—"} só com rendimento.`}
          icon={<Hourglass className="w-5 h-5" />}
          accent="blue"
          delay={0.1}
        />
        <ResumoColuna
          fase="Fase 3"
          titulo="Saques"
          subtitulo="Renda passiva"
          destaque={renda2044 ? `${formatBRL(renda2044)}/mês` : "—"}
          descricaoPopover={`Renda passiva (SWR 4,5%): saca o rendimento e mantém o patrimônio em ${
            fimFase2 ? formatCompact(fimFase2.saldoFinal) : "—"
          }. ${
            marcoIf
              ? `IF alvo por volta de ${marcoIf.ano} (${formatBRL(marcoIf.rendaLiquidaMes ?? 0)}/mês).`
              : ""
          }`}
          icon={<ArrowDownToLine className="w-5 h-5" />}
          accent="emerald"
          delay={0.15}
        />
      </div>

      <div className="hidden sm:block px-5 md:px-6 pb-6 md:pb-7 pt-4 md:pt-5 border-t border-border/40 bg-secondary/10">
        <div
          className="h-1.5 w-full rounded-full"
          style={{
            background: `linear-gradient(90deg,
              hsl(45, 90%, 55%) 0%,
              hsl(44, 88%, 54%) 16%,
              hsl(42, 86%, 53%) 22%,
              hsl(40, 84%, 52%) 26%,
              hsl(38, 80%, 51%) 28.5%,
              hsl(36, 70%, 50%) 30.5%,
              hsl(34, 48%, 52%) 32%,
              hsl(215, 28%, 54%) 33.5%,
              hsl(210, 42%, 55%) 35%,
              hsl(205, 58%, 55%) 37%,
              hsl(202, 66%, 55%) 39.5%,
              hsl(200, 70%, 55%) 42%,
              hsl(200, 70%, 55%) 56%,
              hsl(198, 68%, 53%) 61%,
              hsl(192, 64%, 50%) 64%,
              hsl(186, 58%, 47%) 66.5%,
              hsl(170, 56%, 43%) 70%,
              hsl(160, 55%, 40%) 76%,
              hsl(160, 55%, 40%) 100%)`,
          }}
          role="presentation"
        />
        <div className="relative mt-3 h-6 text-[10px] font-mono font-semibold tabular-nums">
          <span className="absolute left-0 top-0 text-accent">{ANO_PROJECAO_INICIO}</span>
          <span
            className="absolute top-0 -translate-x-1/2 text-sky-400"
            style={{ left: "33.333%" }}
          >
            {FASE2_INICIO}
          </span>
          <span
            className="absolute top-0 -translate-x-1/2 text-emerald"
            style={{ left: "66.666%" }}
          >
            {FASE3_INICIO}
          </span>
          <span className="absolute right-0 top-0 text-muted-foreground font-normal" aria-hidden>
            →
          </span>
        </div>
      </div>

      <div className="sm:hidden px-5 md:px-6 pb-5 pt-3 border-t border-border/40 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-mono text-muted-foreground">
        <span className="text-accent font-semibold">{ANO_PROJECAO_INICIO}</span>
        <span>→</span>
        <span className="text-sky-400 font-semibold">{FASE2_INICIO}</span>
        <span>→</span>
        <span className="text-emerald font-semibold">{FASE3_INICIO}</span>
        <span>→</span>
      </div>
    </motion.section>
  );
}
