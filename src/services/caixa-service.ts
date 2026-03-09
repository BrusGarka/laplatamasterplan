import * as redis from "@/lib/redis";
import { REDIS_KEYS } from "@/data/caixa-schema";
import type { Lancamento, ResumoMes } from "@/types/caixa";

export async function getLancamentosMes(anoMes: string): Promise<Lancamento[]> {
  const data = await redis.get<Lancamento[]>(REDIS_KEYS.LANCAMENTOS(anoMes));
  return Array.isArray(data) ? data : [];
}

export async function saveLancamentosMes(
  anoMes: string,
  lancamentos: Lancamento[]
): Promise<void> {
  await redis.set(REDIS_KEYS.LANCAMENTOS(anoMes), lancamentos);
}

export async function getResumoMes(anoMes: string): Promise<ResumoMes | null> {
  const data = await redis.get<ResumoMes>(REDIS_KEYS.RESUMO(anoMes));
  return data ?? null;
}

export async function saveResumoMes(
  anoMes: string,
  resumo: ResumoMes
): Promise<void> {
  await redis.set(REDIS_KEYS.RESUMO(anoMes), resumo);
}

export async function getContasFixas(): Promise<Lancamento[]> {
  const data = await redis.get<Lancamento[]>(REDIS_KEYS.CONFIG_CONTAS_FIXAS);
  return Array.isArray(data) ? data : [];
}

export async function saveContasFixas(contas: Lancamento[]): Promise<void> {
  await redis.set(REDIS_KEYS.CONFIG_CONTAS_FIXAS, contas);
}

/** Lista de tags para autocomplete (persistente entre meses) */
export async function getTagsCaixa(): Promise<string[]> {
  const data = await redis.get<string[]>(REDIS_KEYS.TAGS);
  return Array.isArray(data) ? data : [];
}

/** Adiciona tag à lista se ainda não existir */
export async function addTagCaixa(tag: string): Promise<void> {
  const trimmed = tag.trim();
  if (!trimmed) return;
  const tags = await getTagsCaixa();
  const lower = trimmed.toLowerCase();
  if (tags.some((t) => t.toLowerCase() === lower)) return;
  await redis.set(REDIS_KEYS.TAGS, [...tags, trimmed]);
}

/** Lista meses que têm lançamentos no Redis (prefix lancamentos:) */
export async function listMesesComDados(): Promise<string[]> {
  const keyList = await redis.keys("lancamentos:*");
  return keyList
    .map((key) => {
      const match = key.match(/^lancamentos:(.+)$/);
      return match ? match[1] : null;
    })
    .filter((m): m is string => m !== null)
    .sort()
    .reverse();
}

/** Remove todos os dados do mês (lançamentos e resumo) */
export async function clearMesInteiro(anoMes: string): Promise<void> {
  await Promise.all([
    redis.del(REDIS_KEYS.LANCAMENTOS(anoMes)),
    redis.del(REDIS_KEYS.RESUMO(anoMes)),
  ]);
}
