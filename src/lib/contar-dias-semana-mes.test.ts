import { describe, expect, it } from "vitest";
import {
  calcularValorRepeticao,
  contarDiasSemanaNoMes,
  resolverAnoMesCalculadora,
} from "./contar-dias-semana-mes";

describe("contarDiasSemanaNoMes", () => {
  it("conta segundas em fev/2026", () => {
    expect(contarDiasSemanaNoMes("2026-02", [1])).toBe(4);
  });

  it("soma segundas e quartas", () => {
    expect(contarDiasSemanaNoMes("2026-02", [1, 3])).toBe(8);
  });

  it("retorna 0 sem dias selecionados", () => {
    expect(contarDiasSemanaNoMes("2026-02", [])).toBe(0);
  });
});

describe("resolverAnoMesCalculadora", () => {
  it("resolve mês passado", () => {
    expect(resolverAnoMesCalculadora("2026-03", "passado")).toBe("2026-02");
  });

  it("resolve mês atual", () => {
    expect(resolverAnoMesCalculadora("2026-03", "atual")).toBe("2026-03");
  });
});

describe("calcularValorRepeticao", () => {
  it("multiplica valor por evento pela contagem", () => {
    expect(
      calcularValorRepeticao("2026-02", {
        mesRef: "atual",
        diasSemana: [1],
        valorPorEvento: 50,
      })
    ).toBe(200);
  });
});
