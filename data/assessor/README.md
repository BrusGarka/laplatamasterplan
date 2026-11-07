# Conteúdo mensal do assessor

Registro organizado por competência (`yyyy-MM`) do material enviado pelo assessor Cleiton Lopes (XP).

## Estrutura por mês

```
data/assessor/2026-06/
├── manifest.json    # metadados e resumo numérico
├── email.md         # e-mail mensal com comentários de mercado
├── whatsapp.md      # transcrições e movimentações sugeridas
└── analise.md       # análise de decisão (opcional)

public/assessor/2026-06/
└── xperformance.pdf # relatório XP de performance
```

## Como adicionar um novo mês

1. Criar pasta `data/assessor/YYYY-MM/` com `manifest.json`, `email.md` e `whatsapp.md` (e `analise.md` se houver)
2. Copiar o PDF para `public/assessor/YYYY-MM/xperformance.pdf` (opcional — meses sem XPerformance podem usar só `slides`)
3. Se houver slides/apresentação, colocar em `public/assessor/YYYY-MM/slides/` e listar em `manifest.slides`
4. Registrar o mês em `src/data/assessor-data.ts`

## Meses registrados

| Competência | Destaque |
|-------------|----------|
| 2026-06 | Relatório XP + movimentações de crédito privado |
| 2026-11 | Migração Comissão → Fee Fixo |
