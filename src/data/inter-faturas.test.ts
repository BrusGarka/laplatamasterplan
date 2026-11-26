import { describe, expect, it } from "vitest";
import { faturasInter } from "./inter-faturas";

describe("faturas Inter", () => {
  it("soma dos gastos de cada fatura bate com as despesas do PDF", () => {
    expect(faturasInter).toHaveLength(6);
    for (const fatura of faturasInter) {
      const gastos = fatura.lancamentos
        .filter((l) => l.tipo === "gasto")
        .reduce((s, l) => s + l.valor, 0);
      expect(Math.round(gastos * 100) / 100).toBe(fatura.despesasMes);
    }
  });
});
