import { describe, expect, it } from "vitest";
import { parseBRLExpression } from "./utils";

describe("parseBRLExpression", () => {
  it("soma e subtração", () => {
    expect(parseBRLExpression("1+1")).toBe(2);
    expect(parseBRLExpression("100-20")).toBe(80);
    expect(parseBRLExpression("-50+10")).toBe(-40);
  });

  it("multiplicação e precedência", () => {
    expect(parseBRLExpression("2*2")).toBe(4);
    expect(parseBRLExpression("10+2*3")).toBe(16);
    expect(parseBRLExpression("100-20*2")).toBe(60);
    expect(parseBRLExpression("2*2+3")).toBe(7);
    expect(parseBRLExpression("10*2*3")).toBe(60);
  });

  it("valores em formato BRL", () => {
    expect(parseBRLExpression("50,00+40*2")).toBe(130);
  });
});
