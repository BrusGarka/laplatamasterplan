import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePremissas } from "@/contexts/PremissasContext";
import {
  ANO_PROJECAO_FIM,
  ANO_PROJECAO_INICIO,
  aporteAnualCorrigido,
  formatBRL,
} from "@/lib/financial-engine";

const ANOS = Array.from(
  { length: ANO_PROJECAO_FIM - ANO_PROJECAO_INICIO + 1 },
  (_, indice) => ANO_PROJECAO_INICIO + indice
);

function lerTaxa(texto: string): number {
  const limpo = texto.trim().replace(/\s/g, "");
  if (limpo.includes(",") && limpo.includes(".")) {
    return Number(limpo.replace(/\./g, "").replace(",", "."));
  }
  if (limpo.includes(",")) return Number(limpo.replace(",", "."));
  return Number(limpo);
}

function textoTaxa(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function InflacaoAnoInput({
  ano,
  valor,
  onChange,
}: {
  ano: number;
  valor: number;
  onChange: (ano: number, valor: number) => void;
}) {
  const [texto, setTexto] = useState(() => textoTaxa(valor));
  const editando = useRef(false);

  useEffect(() => {
    if (!editando.current) setTexto(textoTaxa(valor));
  }, [valor]);

  function aplicar(bruto: string) {
    const numero = lerTaxa(bruto);
    if (!Number.isFinite(numero)) return;
    onChange(ano, numero);
  }

  return (
    <Input
      inputMode="decimal"
      aria-label={`Inflação de ${ano}`}
      value={texto}
      onFocus={() => {
        editando.current = true;
      }}
      onChange={(evento) => {
        editando.current = true;
        setTexto(evento.target.value);
        aplicar(evento.target.value);
      }}
      onBlur={(evento) => {
        editando.current = false;
        const numero = lerTaxa(evento.currentTarget.value);
        if (!Number.isFinite(numero)) {
          setTexto(textoTaxa(valor));
          return;
        }
        aplicar(evento.currentTarget.value);
        setTexto(textoTaxa(numero));
      }}
      onKeyDown={(evento) => {
        if (evento.key === "Enter") evento.currentTarget.blur();
      }}
      className="font-mono h-8 w-24 text-right"
    />
  );
}

export function InflacaoAnosCard() {
  const { inflacao, inflacaoPorAno, setInflacaoAno, restaurarInflacaoAnos } = usePremissas();
  const [versao, setVersao] = useState(0);

  function restaurar() {
    restaurarInflacaoAnos();
    setVersao((atual) => atual + 1);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-1.5">
          <CardTitle>Inflação por ano</CardTitle>
          <CardDescription>
            2024 e 2025 entram com o IPCA fechado pelo IBGE (4,83% e 4,26%). De 2026 até{" "}
            {ANO_PROJECAO_FIM} a tabela começa com a inflação prevista de {textoTaxa(inflacao)}% ao
            ano. O aporte de cada ano é os R$ 100 mil de 2024 corrigidos pela inflação acumulada
            dos anos anteriores: 2025 usa a inflação de 2024, 2026 usa 2024 e 2025, e assim por
            diante.
          </CardDescription>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={restaurar}>
          Restaurar padrão
        </Button>
      </CardHeader>
      <CardContent>
        <div className="max-h-[32rem] overflow-auto rounded-md border border-border">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-secondary/95">
              <tr>
                <th className="text-left p-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Ano
                </th>
                <th className="text-left p-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Origem
                </th>
                <th className="text-right p-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Inflação %
                </th>
                <th className="text-right p-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Aporte teórico
                </th>
              </tr>
            </thead>
            <tbody>
              {ANOS.map((ano) => {
                const taxa = inflacaoPorAno[ano] ?? inflacao;
                const realizada = ano === 2024 || ano === 2025;
                return (
                  <tr key={ano} className="border-t border-border/60">
                    <td className="p-3 font-mono font-semibold">{ano}</td>
                    <td className="p-3">
                      <Badge variant="outline">
                        {realizada ? "IPCA realizado" : "Prevista"}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end">
                        <InflacaoAnoInput
                          key={`${ano}-${versao}`}
                          ano={ano}
                          valor={taxa}
                          onChange={setInflacaoAno}
                        />
                      </div>
                    </td>
                    <td className="p-3 text-right font-mono">
                      {formatBRL(aporteAnualCorrigido(ano, inflacaoPorAno))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
