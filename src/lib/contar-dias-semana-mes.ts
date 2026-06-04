import { getDaysInMonth } from "date-fns";
import type { RepeticaoDiasSemana } from "@/data/caixa-schema";
import { anoMesAnterior } from "@/lib/caixa-mes-nav";

export function resolverAnoMesCalculadora(
  anoMesTela: string,
  mesRef: RepeticaoDiasSemana["mesRef"]
): string {
  return mesRef === "passado" ? anoMesAnterior(anoMesTela) : anoMesTela;
}

export function contarDiasSemanaNoMes(anoMes: string, diasSemana: number[]): number {
  if (diasSemana.length === 0) return 0;
  const set = new Set(diasSemana);
  const [y, m] = anoMes.split("-").map(Number);
  const totalDias = getDaysInMonth(new Date(y, m - 1, 1));
  let count = 0;
  for (let dia = 1; dia <= totalDias; dia++) {
    if (set.has(new Date(y, m - 1, dia).getDay())) count++;
  }
  return count;
}

export function calcularValorRepeticao(
  anoMesTela: string,
  config: RepeticaoDiasSemana
): number {
  const anoMes = resolverAnoMesCalculadora(anoMesTela, config.mesRef);
  const eventos = contarDiasSemanaNoMes(anoMes, config.diasSemana);
  return config.valorPorEvento * eventos;
}
