# Coleções Contajá (Tributos e Folhas)

Cada coleta grava uma pasta com timestamp ISO:

```
data/contaja-collections/2026-06-04T21-39-58/
  manifest.json
  tributos.json           # documentos + metodoCalculo (DAS via API)
  tributos.csv
  calculos-simples.json   # payloads brutos national-simple-tax-calculation
  api-raw.json            # docs + calcs da API (sessão logada)
```

Coleta da tabela (DOM):

```bash
npm run sync:contaja:browser -- --input /caminho/para/scrape-tabela.json
```

Coleta com método de cálculo (API no browser logado — equivale a clicar no ícone ℹ / Visualizar do DAS):

```bash
npm run sync:contaja:api -- --input /caminho/para/scrape-api.json
```

Endpoints usados: `GET /api/tax-payroll-document`, `GET /api/tax-payroll-document/national-simple-tax-calculation?nationalSimpleTaxCalculationId=…`

### Notas fiscais

```
data/contaja-collections/2026-06-04T21-50-42/
  manifest-nf.json
  notas-fiscais.json    # emitidas + projeções jul–dez/2026 (R$ 27k)
  notas-fiscais.csv
  nf-api-raw.json
```

```bash
npm run sync:contaja:nf -- --input /caminho/scrape-nf.json --update-app
```

A pasta é versionada no git (dados da empresa — revise se o repositório for público).
