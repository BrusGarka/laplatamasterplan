import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { RepeticaoDiasSemana } from "@/data/caixa-schema";
import {
  calcularValorRepeticao,
  contarDiasSemanaNoMes,
  resolverAnoMesCalculadora,
} from "@/lib/contar-dias-semana-mes";
import { formatBRL, formatBRLForInput, parseBRLExpression } from "@/lib/utils";

const DIAS_SEMANA = [
  { value: 0, label: "D", nome: "Domingo" },
  { value: 1, label: "S", nome: "Segunda" },
  { value: 2, label: "T", nome: "Terça" },
  { value: 3, label: "Q", nome: "Quarta" },
  { value: 4, label: "Q", nome: "Quinta" },
  { value: 5, label: "S", nome: "Sexta" },
  { value: 6, label: "S", nome: "Sábado" },
] as const;

function labelMes(anoMes: string): string {
  const [y, m] = anoMes.split("-").map(Number);
  return format(new Date(y, m - 1, 1), "MMMM yyyy", { locale: ptBR });
}

export interface CalculadoraDiasSemanaResult {
  valor: number;
  repeticao: RepeticaoDiasSemana;
}

interface CalculadoraDiasSemanaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  anoMesTela: string;
  initial?: RepeticaoDiasSemana;
  onApply: (result: CalculadoraDiasSemanaResult) => void;
  onClear?: () => void;
}

export function CalculadoraDiasSemanaDialog({
  open,
  onOpenChange,
  anoMesTela,
  initial,
  onApply,
  onClear,
}: CalculadoraDiasSemanaDialogProps) {
  const [mesRef, setMesRef] = useState<RepeticaoDiasSemana["mesRef"]>("atual");
  const [diasSemana, setDiasSemana] = useState<number[]>([]);
  const [valorPorEventoStr, setValorPorEventoStr] = useState("");

  useEffect(() => {
    if (!open) return;
    setMesRef(initial?.mesRef ?? "atual");
    setDiasSemana(initial?.diasSemana ?? []);
    setValorPorEventoStr(
      initial?.valorPorEvento != null && initial.valorPorEvento !== 0
        ? formatBRLForInput(initial.valorPorEvento)
        : ""
    );
  }, [open, initial]);

  const configPreview = useMemo((): RepeticaoDiasSemana | null => {
    const valorPorEvento = parseBRLExpression(valorPorEventoStr);
    if (diasSemana.length === 0 || valorPorEvento === 0) return null;
    return { mesRef, diasSemana, valorPorEvento };
  }, [mesRef, diasSemana, valorPorEventoStr]);

  const anoMesContagem = configPreview
    ? resolverAnoMesCalculadora(anoMesTela, configPreview.mesRef)
    : null;

  const totalEventos =
    configPreview && anoMesContagem
      ? contarDiasSemanaNoMes(anoMesContagem, configPreview.diasSemana)
      : 0;

  const valorTotal = configPreview ? calcularValorRepeticao(anoMesTela, configPreview) : 0;

  const podeAplicar = configPreview != null && totalEventos > 0;

  const handleApply = () => {
    if (!configPreview || totalEventos === 0) return;
    onApply({
      valor: calcularValorRepeticao(anoMesTela, configPreview),
      repeticao: configPreview,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Valor por repetição semanal</DialogTitle>
          <DialogDescription>
            Multiplica o valor por evento pela quantidade de ocorrências dos dias escolhidos no
            mês de referência.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Mês de referência</Label>
            <RadioGroup
              value={mesRef}
              onValueChange={(v) => setMesRef(v as RepeticaoDiasSemana["mesRef"])}
              className="flex flex-col gap-2 sm:flex-row sm:gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="atual" id="mes-atual" />
                <Label htmlFor="mes-atual" className="font-normal cursor-pointer">
                  Mês atual ({labelMes(anoMesTela)})
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="passado" id="mes-passado" />
                <Label htmlFor="mes-passado" className="font-normal cursor-pointer">
                  Mês passado ({labelMes(resolverAnoMesCalculadora(anoMesTela, "passado"))})
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Dias da semana</Label>
            <ToggleGroup
              type="multiple"
              value={diasSemana.map(String)}
              onValueChange={(vals) => setDiasSemana(vals.map((v) => parseInt(v, 10)))}
              className="flex flex-wrap justify-start gap-1"
            >
              {DIAS_SEMANA.map((d) => (
                <ToggleGroupItem
                  key={d.value}
                  value={String(d.value)}
                  className="h-9 w-9 px-0 font-medium"
                  aria-label={d.nome}
                >
                  {d.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="valor-por-evento">Valor por evento</Label>
            <Input
              id="valor-por-evento"
              type="text"
              inputMode="decimal"
              className="font-mono text-right"
              placeholder="0,00"
              value={valorPorEventoStr}
              onChange={(e) => setValorPorEventoStr(e.target.value)}
              onBlur={(e) => {
                const parsed = parseBRLExpression(e.target.value);
                if (parsed !== 0) setValorPorEventoStr(formatBRLForInput(parsed));
              }}
            />
          </div>

          {configPreview && anoMesContagem && (
            <p className="text-sm text-muted-foreground rounded-md bg-muted/50 p-3">
              {totalEventos} evento{totalEventos !== 1 ? "s" : ""} em {labelMes(anoMesContagem)} ×{" "}
              {formatBRL(configPreview.valorPorEvento)} ={" "}
              <span className="font-mono font-medium text-foreground">
                {formatBRL(valorTotal)}
              </span>
            </p>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
          {onClear && initial ? (
            <Button
              type="button"
              variant="ghost"
              className="text-destructive hover:text-destructive sm:mr-auto"
              onClick={() => {
                onClear();
                onOpenChange(false);
              }}
            >
              Remover repetição
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2 justify-end w-full sm:w-auto">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleApply} disabled={!podeAplicar}>
              Aplicar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
