# Coleções XP (Carteira)

Cada coleta grava uma pasta com timestamp ISO:

```
data/xp-collections/2026-06-04T21-07-51/
  manifest.json
  carteira.json           # merge XLS (lista) + collapses
  xls-grid.json / .csv    # grade XLS estruturada
  carteira-export.xlsx    # arquivo da XP (botão Exportar), quando Playwright
  carteira-export-parsed.json
  renda-fixa.json / .csv
  renda-fixa-detalhes.csv # Minha Posição + Características + Eventos
  fundos.json / .csv
  fundos-detalhes.csv
```

Comandos:

- `npm run sync:xp:browser` — processa scrape do browser aberto (log em `.cursor/debug-5c96b9.log`)
- `npm run sync:xp -- --scrape --update-investimentos` — Playwright (sessão em `.xp-storage-state.json`)
- `npm run sync:xp:login` — salva sessão após login manual

A pasta é versionada no git (dados financeiros pessoais — revise se for repositório público).

Sessão Playwright (login manual): `.xp-storage-state.json` (gitignored).
