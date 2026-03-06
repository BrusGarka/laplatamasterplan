/**
 * Cliente Upstash Redis - API REST
 * https://upstash.com/docs/redis
 * Namespace laplatamasterplan para reusar o mesmo Redis em outros projetos.
 */

import { Redis } from "@upstash/redis";

const UPSTASH_REDIS_REST_URL = "https://relaxed-bullfrog-64911.upstash.io";
const UPSTASH_REDIS_REST_TOKEN =
  "Af2PAAIncDIyMDQ0ZWI4YWIwODk0NmZjYjQ2YTY2OGRiZTRhYzkyZHAyNjQ5MTE";

const NAMESPACE = "laplatamasterplan";

const redis = new Redis({
  url: UPSTASH_REDIS_REST_URL,
  token: UPSTASH_REDIS_REST_TOKEN,
});

function ns(key: string): string {
  return `${NAMESPACE}:${key}`;
}

/** Remove o namespace das chaves retornadas */
function stripNs(fullKey: string): string {
  const prefix = `${NAMESPACE}:`;
  return fullKey.startsWith(prefix) ? fullKey.slice(prefix.length) : fullKey;
}

export async function get<T = unknown>(key: string): Promise<T | null> {
  const raw = await redis.get(ns(key));
  if (raw === null || raw === undefined) return null;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  }
  return raw as T;
}

export async function set<T>(key: string, value: T): Promise<void> {
  const body =
    typeof value === "object" ? JSON.stringify(value) : String(value);
  await redis.set(ns(key), body);
}

export async function del(key: string): Promise<void> {
  await redis.del(ns(key));
}

/** Lista chaves com prefixo (ex: "lancamentos:*" -> ["lancamentos:2025-03", ...]) */
export async function keys(pattern: string): Promise<string[]> {
  const result = await redis.keys(ns(pattern));
  return (Array.isArray(result) ? result : []).map(stripNs);
}
