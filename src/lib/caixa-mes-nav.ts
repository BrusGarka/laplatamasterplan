import { format } from "date-fns";

export function anoMesAnterior(anoMes: string): string {
  const [y, m] = anoMes.split("-").map(Number);
  const d = new Date(y, m - 2, 1);
  return format(d, "yyyy-MM");
}

export function anoMesProximo(anoMes: string): string {
  const [y, m] = anoMes.split("-").map(Number);
  const d = new Date(y, m, 1);
  return format(d, "yyyy-MM");
}

/** Futuro: janela fixa (M+2, M+1, atual). Passado: só meses com dados no Redis. */
export function buildOpcoesMesNavegacao(
  atual: string,
  mesesComDados: string[]
): { opcoesMes: string[]; limiteProximo: string; limiteAnterior: string } {
  const proximo = anoMesProximo(atual);
  const proximoProximo = anoMesProximo(proximo);
  const janelaFutura = [proximoProximo, proximo, atual];
  const mesesPassado = mesesComDados.filter((m) => m < atual);
  const opcoes = [...new Set([...janelaFutura, ...mesesPassado])].sort().reverse();
  const limiteAnterior =
    mesesPassado.length > 0 ? mesesPassado.sort()[0]! : atual;

  return {
    opcoesMes: opcoes,
    limiteProximo: proximoProximo,
    limiteAnterior,
  };
}
