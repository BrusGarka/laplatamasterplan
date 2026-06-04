import { parseBRL } from "./contaja-parse.mjs";

export function parseApiPayload(raw) {
  const v = raw.result?.value ?? raw;
  return {
    scrapedAt: v.scrapedAt ?? new Date().toISOString(),
    docs: v.docs ?? [],
    calcs: v.calcs ?? {},
  };
}

export function normalizeCalculoSimples(calc) {
  if (!calc) return null;
  const itens = (calc.nationalSimpleTaxCalculationItems ?? []).map((item) => ({
    anexo: item.annex?.description ?? null,
    anexoSlug: item.annex?.slug ?? null,
    aliquotaEfetiva: item.aliquot,
    receitaCompetencia: item.totalValue,
    impostoDevido: item.taxTotalValue,
    receitaCompetenciaNumero: parseBRL(item.totalValue),
    impostoDevidoNumero: parseBRL(item.taxTotalValue),
    fatorR: item.isFatorR,
    retencao: item.hasRetention,
  }));
  return {
    calculoId: calc.id,
    aliquotaEfetiva: calc.aliquot,
    fatorR: calc.isFatorR,
    receitaCompetencia: calc.totalValue,
    impostoDevido: calc.taxTotalValue,
    receitaCompetenciaNumero: parseBRL(calc.totalValue),
    impostoDevidoNumero: parseBRL(calc.taxTotalValue),
    itens,
    fonte: "api/national-simple-tax-calculation",
  };
}

export function mergeDocumentosApi(docs, calcs) {
  return docs.map((doc) => {
    const calcId = doc.nationalSimpleTaxCalculationId;
    const calcRaw = calcId ? calcs[String(calcId)] ?? calcs[calcId] : null;
    const metodoCalculo = calcRaw
      ? normalizeCalculoSimples(calcRaw)
      : doc.type?.slug === "das-simples-nacional"
        ? { erro: "sem nationalSimpleTaxCalculationId na API" }
        : null;

    return {
      contajaId: doc.id,
      hash: doc.hash,
      tipoDocumento: doc.description ?? doc.type?.description,
      tipoSlug: doc.type?.slug,
      competencia: doc.competency,
      vencimento: doc.dueDate,
      valor: doc.value,
      valorNumero: parseBRL(doc.value),
      status: doc.status?.description,
      statusSlug: doc.status?.slug,
      voceJaPagou: Boolean(doc.wasPaid),
      voceJaPagouPeloSistema: Boolean(doc.wasPaidBySystem),
      nationalSimpleTaxCalculationId: calcId,
      metodoCalculo,
      visualizar: calcId
        ? "icone-info / API calculo Simples"
        : ["holerite", "darf-folha"].includes(doc.type?.slug)
          ? "PDF (demonstrativo)"
          : "documento sem API de calculo mapeada",
      id: `${doc.description ?? doc.type?.description}|${doc.competency}|${doc.dueDate}`,
    };
  });
}
