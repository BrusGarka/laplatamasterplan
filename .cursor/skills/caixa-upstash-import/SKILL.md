---
name: caixa-upstash-import
description: Importa dados do Caixa para o Upstash Redis. Use quando o usuário enviar uma tabela de lançamentos financeiros (tipo, categoria, Item, Valor, executado?, dia) para publicar no Upstash.
---

# Importar Caixa para Upstash

Importa lançamentos financeiros no formato da planilha para o Upstash Redis (app Caixa do laplatamasterplan).

## Formato esperado

Tabela com colunas (separadas por tab ou espaços):

| Coluna     | Descrição                          | Exemplo              |
|------------|------------------------------------|----------------------|
| tipo       | giro, entrada, fixo, poupança, variavel | fixo                 |
| categoria  | (ignorada, pode estar vazia)        | —                    |
| Item       | Nome do lançamento                 | terapia - rosana     |
| Valor      | R$ 1.234,56 ou -R$ 1.234,56        | -R$ 313,50           |
| executado? | x = pago, vazio = não pago         | x                    |
| dia        | 1–31 ou vazio                      | 15                   |

**Regras de parsing:**
- `variável` → normalizar para `variavel` (sem acento)
- Valor: remover R$, trocar vírgula por ponto, parsear número
- executado: `x` ou `X` = true, vazio = false
- dia: número 1–31 ou null se vazio
- Linhas sem Item válido são ignoradas

**Tabela Markdown** (com `|`): o script detecta e parseia automaticamente.

## Fluxo

1. Salvar os dados em arquivo temporário (ex: `.caixa-import.txt`).
   - **CRÍTICO — Ordem**: Manter a ordem exata das linhas como o usuário enviou. Não reordenar.
   - **CRÍTICO — Tabs**: Preservar tabs (`\t`) entre colunas. Se o paste converter tabs em espaços, o script aceita 2+ espaços como separador.
2. O script carrega `.env` da raiz do projeto automaticamente (VITE_UPSTASH_* ou UPSTASH_*)
3. Executar o script de importação:

```bash
node .cursor/skills/caixa-upstash-import/scripts/import-caixa.mjs .caixa-import.txt 2025-03
```

O segundo argumento é o ano-mês (YYYY-MM). Se omitido, usa o mês atual.

4. O script parseia, converte para `Lancamento[]` e faz POST no Upstash via REST API.

## Estrutura de saída (idêntica ao inline new/edit)

O script produz objetos **exatamente** no formato de `Lancamento` usado pelo `ContasMesCard` (handleSaveInline / handleSaveEdit) e `caixa-schema.ts`:

```ts
// src/data/caixa-schema.ts
interface Lancamento {
  id: string;                    // crypto.randomUUID()
  tipo: TipoLancamento;          // "giro" | "entrada" | "fixo" | "poupança" | "variavel"
  item: string;
  valor: number;
  executado: boolean;
  dia: number | null;            // 1–31 ou null
  debitoAutomatico?: boolean;    // false na importação (não há coluna na tabela)
}
```

- Chave Redis: `laplatamasterplan:lancamentos:{anoMes}` (mesma de `saveLancamentosMes`)
- Sem campos extras; estrutura compatível com leitura/edição na UI
