import type { AtivoRendaFixa, Fundo } from "@/data/investimentos-data";

export type CarteiraLinha =
  | { tipo: "rendaFixa"; ativo: AtivoRendaFixa; indice: number }
  | { tipo: "fundo"; fundo: Fundo; indice: number };

export interface GrupoCarteira {
  grupo: string;
  linhas: CarteiraLinha[];
}

/** Agrupa na ordem da XP: RF na ordem do scrape, depois fundos (grupo 20,8% | Pós-Fixado). */
export function buildGruposCarteira(
  rendaFixa: AtivoRendaFixa[],
  fundosLista: Fundo[]
): GrupoCarteira[] {
  const map = new Map<string, CarteiraLinha[]>();
  const ordem: string[] = [];

  const add = (grupo: string, linha: CarteiraLinha) => {
    const g = grupo.trim() || "Outros";
    if (!map.has(g)) {
      map.set(g, []);
      ordem.push(g);
    }
    map.get(g)!.push(linha);
  };

  rendaFixa.forEach((ativo, indice) =>
    add(ativo.grupo ?? "Renda fixa", { tipo: "rendaFixa", ativo, indice })
  );
  fundosLista.forEach((fundo, indice) =>
    add(fundo.grupo ?? "Fundos", { tipo: "fundo", fundo, indice })
  );

  return ordem.map((grupo) => ({ grupo, linhas: map.get(grupo)! }));
}

export function grupoEhSomenteFundos(linhas: CarteiraLinha[]): boolean {
  return linhas.length > 0 && linhas.every((l) => l.tipo === "fundo");
}

export function totalGrupo(
  linhas: CarteiraLinha[],
  marcacaoMercado: boolean
): number {
  return linhas.reduce((sum, linha) => {
    if (linha.tipo === "fundo") return sum + linha.fundo.atual;
    const a = linha.ativo;
    const valor =
      marcacaoMercado && a.valorMercado !== undefined
        ? a.valorMercado
        : a.posicaoAtual;
    return sum + valor;
  }, 0);
}

export function expandRowKey(grupo: string, ativo: AtivoRendaFixa): string {
  return `${grupo}|${ativo.nome}|${ativo.vencimento}`;
}

export function parseGrupoLabel(grupo: string): {
  pctXp: number | null;
  nome: string;
} {
  const m = grupo.match(/^([\d,]+)%\s*\|\s*(.+)$/);
  if (m) {
    return {
      pctXp: parseFloat(m[1].replace(",", ".")),
      nome: m[2].trim(),
    };
  }
  return { pctXp: null, nome: grupo };
}

export interface ResumoGrupo {
  grupo: string;
  nomeGrupo: string;
  pctXp: number | null;
  somenteFundos: boolean;
  qtdPapeis: number;
  posicao: number;
  aplicado: number;
  rendimento: number;
  pctRealCarteira: number;
  rentabilidadeSobreAplicado: number;
  /** Média das rent. líquidas % (só fundos, quando disponível). */
  rentMediaLiquidaPct: number | null;
}

function parsePctStr(str?: string): number | null {
  if (!str) return null;
  const m = String(str).match(/([\d,]+)/);
  return m ? parseFloat(m[1].replace(",", ".")) : null;
}

export function calcularResumoGrupo(
  { grupo, linhas }: GrupoCarteira,
  totalCarteira: number,
  marcacaoMercado: boolean
): ResumoGrupo {
  const { pctXp, nome } = parseGrupoLabel(grupo);
  const somenteFundos = grupoEhSomenteFundos(linhas);

  let aplicado = 0;
  let posicao = 0;
  let rendimento = 0;
  const rentsLiq: number[] = [];

  for (const linha of linhas) {
    if (linha.tipo === "fundo") {
      const f = linha.fundo;
      aplicado += f.aplicado;
      posicao += f.atual;
      rendimento += f.atual - f.aplicado;
      const rl = parsePctStr(f.rentabilidadeLiquida);
      if (rl !== null) rentsLiq.push(rl);
    } else {
      const a = linha.ativo;
      aplicado += a.valorAplicado;
      const pos =
        marcacaoMercado && a.valorMercado !== undefined
          ? a.valorMercado
          : a.posicaoAtual;
      posicao += pos;
      rendimento += pos - a.valorAplicado;
    }
  }

  const pctRealCarteira =
    totalCarteira > 0 ? Math.round((posicao / totalCarteira) * 1000) / 10 : 0;
  const rentabilidadeSobreAplicado =
    aplicado > 0 ? Math.round((rendimento / aplicado) * 10000) / 100 : 0;
  const rentMediaLiquidaPct =
    rentsLiq.length > 0
      ? Math.round((rentsLiq.reduce((s, v) => s + v, 0) / rentsLiq.length) * 100) / 100
      : null;

  return {
    grupo,
    nomeGrupo: nome,
    pctXp,
    somenteFundos,
    qtdPapeis: linhas.length,
    posicao: Math.round(posicao * 100) / 100,
    aplicado: Math.round(aplicado * 100) / 100,
    rendimento: Math.round(rendimento * 100) / 100,
    pctRealCarteira,
    rentabilidadeSobreAplicado,
    rentMediaLiquidaPct,
  };
}

export function calcularResumosPorGrupo(
  grupos: GrupoCarteira[],
  totalCarteira: number,
  marcacaoMercado: boolean
): ResumoGrupo[] {
  return grupos.map((g) => calcularResumoGrupo(g, totalCarteira, marcacaoMercado));
}
