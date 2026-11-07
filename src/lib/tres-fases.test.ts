import { describe, expect, it } from "vitest";
import {
  ANO_PROJECAO_FIM,
  aporteAnualCorrigido,
  gerarProjecaoTresFases,
  serieInflacaoPadrao,
} from "./financial-engine";

describe("aporte corrigido pela inflação", () => {
  it("começa em 100 mil e corrige pelo IPCA do ano anterior", () => {
    const inflacao = { 2024: 4.83, 2025: 4.26, 2026: 4.5 };
    expect(aporteAnualCorrigido(2024, inflacao)).toBe(100_000);
    expect(aporteAnualCorrigido(2025, inflacao)).toBe(104_830);
    expect(aporteAnualCorrigido(2026, inflacao)).toBe(109_296);
  });
});

describe("projeção em 3 fases", () => {
  it("segura a fase 2 em 2043 e abre a renda passiva em 2044", () => {
    const tabela = gerarProjecaoTresFases(serieInflacaoPadrao(4.5), 0.1077, 0.06);
    expect(tabela.find((linha) => linha.ano === 2033)?.fase).toBe(1);
    expect(tabela.find((linha) => linha.ano === 2034)?.fase).toBe(2);
    expect(tabela.find((linha) => linha.ano === 2043)?.fase).toBe(2);
    expect(tabela.find((linha) => linha.ano === 2043)?.pmtMes).toBe(0);
    expect(tabela.find((linha) => linha.ano === 2044)?.fase).toBe(3);
    expect(tabela.find((linha) => linha.ano === 2044)?.aporteAnual).toBeGreaterThan(100_000);
    expect(tabela.at(-1)?.ano).toBe(ANO_PROJECAO_FIM);
    expect(tabela.at(-1)?.fase).toBe(3);

    const fimEspera = tabela.find((linha) => linha.ano === 2043);
    const inicioSaques = tabela.find((linha) => linha.ano === 2044);
    const fimHorizonte = tabela.at(-1);
    expect(inicioSaques?.saldoInicial).toBe(fimEspera?.saldoFinal);
    expect(inicioSaques?.saldoFinal).toBe(inicioSaques?.saldoInicial);
    expect(fimHorizonte?.saldoFinal).toBe(inicioSaques?.saldoFinal);
  });
});
