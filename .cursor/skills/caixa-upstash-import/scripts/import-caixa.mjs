#!/usr/bin/env node
/**
 * Importa tabela de lançamentos do Caixa para Upstash Redis.
 * Uso: node import-caixa.mjs <arquivo> [anoMes]
 * Formato: tipo\ttag\tcategoria\tItem\tValor\texecutado?\tdia (tab ou |)
 * Env: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN (ou VITE_*)
 *
 * Estrutura de saída: idêntica a Lancamento (caixa-schema.ts) e ao
 * handleSaveInline do ContasMesCard - mesmos campos e tipos.
 */

import { readFileSync, existsSync } from "fs";
import { randomUUID } from "crypto";

function loadEnv() {
  for (const p of [".env", "../.env", "../../.env"]) {
    if (existsSync(p)) {
      for (const line of readFileSync(p, "utf-8").split("\n")) {
        const m = line.match(/^\s*([^#=]+)=(.*)$/);
        if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
      }
      break;
    }
  }
}
loadEnv();

const TIPOS = ["giro", "entrada", "fixo", "poupança", "variavel"];

function parseValor(str) {
  if (!str || !str.trim()) return 0;
  const neg = /^-/.test(str.trim());
  const s = str
    .trim()
    .replace(/^-?\s*R\$\s*/gi, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const n = parseFloat(s);
  const val = Number.isNaN(n) ? 0 : Math.abs(n);
  return neg ? -val : val;
}

function parseExecutado(str) {
  return /^x$/i.test((str || "").trim());
}

function parseDia(str) {
  if (!str || !str.trim()) return null;
  const n = parseInt(str.trim(), 10);
  return n >= 1 && n <= 31 ? n : null;
}

function normalizarTipo(tipo) {
  const t = (tipo || "").trim().toLowerCase();
  if (t === "variável" || t === "variavel") return "variavel";
  return TIPOS.includes(t) ? t : "fixo";
}

function splitCells(line) {
  if (line.includes("|")) return line.split("|").map((c) => c.trim());
  if (line.includes("\t")) return line.split(/\t/).map((c) => c.trim());
  // Fallback: tabs viraram espaços no paste — 2+ espaços = separador
  return line.split(/\s{2,}/).map((c) => c.trim());
}

function parseLinha(linha, colunas) {
  const vals = splitCells(linha);
  if (vals.length < 2) return null;
  const get = (name) => {
    const key = name.toLowerCase();
    const i = colunas.indexOf(key);
    return i >= 0 ? (vals[i] ?? "") : "";
  };
  const item = get("Item") || get("item");
  if (!item) return null;

  const tipo = normalizarTipo(get("tipo"));
  const tagRaw = (get("tag") || "").trim();
  const tag = tagRaw || undefined;
  const valor = parseValor(get("Valor") || get("valor"));
  const executado = parseExecutado(get("executado?") || get("executado"));
  const dia = parseDia(get("dia"));

  // Estrutura idêntica ao inline new (ContasMesCard) e Lancamento (caixa-schema.ts)
  return {
    id: randomUUID(),
    tipo,
    ...(tag && { tag }),
    item: item.trim(),
    valor,
    executado,
    dia,
    debitoAutomatico: false,
  };
}

function parseArquivo(content) {
  const linhas = content.split(/\n/);
  if (linhas.length < 2) return [];

  // Primeira linha não-vazia = header
  let headerIdx = -1;
  for (let i = 0; i < linhas.length; i++) {
    if (linhas[i].trim()) {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx < 0) return [];

  const headerCells = splitCells(linhas[headerIdx].trim());
  const colunas = headerCells.map((c) => c.toLowerCase().trim());

  const lancamentos = [];
  // Processar linhas após o header, na ordem exata (preserva ordem do arquivo)
  for (let i = headerIdx + 1; i < linhas.length; i++) {
    const linha = linhas[i];
    if (!linha.trim()) continue; // pula vazias, mantém ordem das demais
    const cells = splitCells(linha);
    if (cells.every((c) => !c || /^-+$|^:?-+:?$/.test(c))) continue; // pula separador markdown
    const l = parseLinha(linha, colunas);
    if (l) lancamentos.push(l);
  }
  return lancamentos;
}

async function postUpstash(url, token, key, value) {
  const body = JSON.stringify(value);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(["SET", key, body]),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Upstash error ${res.status}: ${err}`);
  }
  const data = await res.json();
  if (data.error) throw new Error(`Upstash: ${data.error}`);
  return data;
}

async function main() {
  const args = process.argv.slice(2);
  const filePath = args[0];
  const anoMes = args[1] || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

  if (!filePath) {
    console.error("Uso: node import-caixa.mjs <arquivo|-> [anoMes]");
    console.error("  arquivo: caminho do arquivo TSV; - = ler de stdin");
    process.exit(1);
  }

  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.VITE_UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.VITE_UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.error("Defina UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN (ou VITE_*)");
    console.error("Valores em src/lib/redis.ts");
    process.exit(1);
  }

  let content;
  if (filePath === "-") {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    content = Buffer.concat(chunks).toString("utf-8");
  } else {
    try {
      content = readFileSync(filePath, "utf-8");
    } catch (e) {
      console.error("Erro ao ler arquivo:", e.message);
      process.exit(1);
    }
  }

  const lancamentos = parseArquivo(content);
  if (lancamentos.length === 0) {
    console.error("Nenhum lançamento válido encontrado.");
    process.exit(1);
  }

  const key = `laplatamasterplan:lancamentos:${anoMes}`;
  try {
    await postUpstash(url, token, key, lancamentos);
    console.log(`OK: ${lancamentos.length} lançamento(s) salvos em ${anoMes}`);
  } catch (e) {
    console.error("Erro ao postar no Upstash:", e.message);
    process.exit(1);
  }
}

main();
