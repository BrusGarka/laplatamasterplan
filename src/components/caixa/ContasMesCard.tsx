import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Zap, Check, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatBRL, formatBRLForInput, parseBRLExpression } from "@/lib/utils";
import { useLancamentos, useSaveLancamentos, useClearMesInteiro, useResumo, useTagsCaixa, useAddTagCaixa } from "@/hooks/use-caixa";
import { toast } from "sonner";
import type { Lancamento, TipoLancamento, ResumoMes } from "@/types/caixa";
import { SortableTableRow } from "./SortableTableRow";
import { TagCombobox } from "./TagCombobox";
import { TagBadge } from "./TagBadge";

const TIPOS: TipoLancamento[] = ["giro", "entrada", "fixo", "poupança", "variavel"];

function calcularResumo(lancamentos: { valor: number; executado: boolean }[]): Partial<ResumoMes> {
  const totalEntradas = lancamentos
    .filter((l) => l.valor > 0)
    .reduce((s, l) => s + l.valor, 0);
  const totalSaidas = lancamentos
    .filter((l) => l.valor < 0)
    .reduce((s, l) => s + Math.abs(l.valor), 0);
  const balanco = totalEntradas - totalSaidas;
  
  // Posição atual considera apenas lançamentos executados
  const entradasExecutadas = lancamentos
    .filter((l) => l.valor > 0 && l.executado)
    .reduce((s, l) => s + l.valor, 0);
  const saidasExecutadas = lancamentos
    .filter((l) => l.valor < 0 && l.executado)
    .reduce((s, l) => s + Math.abs(l.valor), 0);
  const posicaoAtual = entradasExecutadas - saidasExecutadas;
  
  return {
    posicao: posicaoAtual,
    ativoCirculante: totalEntradas,
    passivoCirculante: -totalSaidas,
    balancoPrevisto: balanco,
  };
}

interface ContasMesCardProps {
  anoMes: string;
}

export function ContasMesCard({ anoMes }: ContasMesCardProps) {
  const { data: lancamentos = [], isLoading } = useLancamentos(anoMes);
  const { data: resumoSalvo } = useResumo(anoMes);
  const { data: tagsCaixa = [] } = useTagsCaixa();
  const addTagMutation = useAddTagCaixa();
  const saveMutation = useSaveLancamentos(anoMes);
  const clearMutation = useClearMesInteiro(anoMes);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    tipo: TipoLancamento;
    tag: string;
    item: string;
    valor: number;
    dia: number | null;
    debitoAutomatico: boolean;
  } | null>(null);
  const [editValorStr, setEditValorStr] = useState("");
  const [inline, setInline] = useState({
    tipo: "fixo" as TipoLancamento,
    tag: "",
    item: "",
    valor: 0,
    dia: null as number | null,
    debitoAutomatico: false,
  });
  const [inlineValorStr, setInlineValorStr] = useState("");

  const filtrados = useMemo(() => {
    return lancamentos;
  }, [lancamentos]);

  const ordenados = useMemo(() => [...filtrados], [filtrados]);

  const calculado = useMemo(
    () => calcularResumo(lancamentos),
    [lancamentos]
  );

  const { entradasExecutadas, saidasExecutadas } = useMemo(() => {
    const entradas = lancamentos
      .filter((l) => l.valor > 0 && l.executado)
      .reduce((s, l) => s + l.valor, 0);
    const saidas = lancamentos
      .filter((l) => l.valor < 0 && l.executado)
      .reduce((s, l) => s + Math.abs(l.valor), 0);
    return { entradasExecutadas: entradas, saidasExecutadas: saidas };
  }, [lancamentos]);

  const resumo: ResumoMes = useMemo(() => {
    if (resumoSalvo) {
      return {
        posicao: resumoSalvo.posicao,
        ativoCirculante: resumoSalvo.ativoCirculante,
        passivoCirculante: resumoSalvo.passivoCirculante,
        balancoPrevisto: resumoSalvo.balancoPrevisto,
        acumuladoAnual: resumoSalvo.acumuladoAnual,
        totalPoupanca: resumoSalvo.totalPoupanca,
        porquinhos: resumoSalvo.porquinhos,
      };
    }
    return {
      posicao: calculado.posicao ?? 0,
      ativoCirculante: calculado.ativoCirculante ?? 0,
      passivoCirculante: calculado.passivoCirculante ?? 0,
      balancoPrevisto: calculado.balancoPrevisto ?? 0,
      acumuladoAnual: 0,
      totalPoupanca: 0,
    };
  }, [resumoSalvo, calculado]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ordenados.findIndex((l) => l.id === active.id);
    const newIndex = ordenados.findIndex((l) => l.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const newFiltrados = arrayMove(ordenados, oldIndex, newIndex);
    saveMutation.mutate(newFiltrados);
  };

  const pagas = lancamentos.filter((l) => l.executado).length;
  const total = lancamentos.length;
  const progresso = total > 0 ? (pagas / total) * 100 : 0;

  const toggleExecutado = (l: Lancamento) => {
    const updated = lancamentos.map((x) =>
      x.id === l.id ? { ...x, executado: !x.executado } : x
    );
    saveMutation.mutate(updated);
  };

  const handleDelete = (id: string) => {
    const updated = lancamentos.filter((x) => x.id !== id);
    saveMutation.mutate(updated);
  };

  const handleSaveEdit = () => {
    if (!editingId || !editForm.item?.trim()) return;
    const l = lancamentos.find((x) => x.id === editingId);
    if (!l) return;
    const valorFinal = editValorStr ? parseBRLExpression(editValorStr) : (editForm.valor ?? l.valor);
    const tagFinal = (editForm.tag ?? l.tag ?? "").trim() || undefined;
    const updated: Lancamento = {
      ...l,
      tipo: (editForm.tipo ?? l.tipo) as TipoLancamento,
      tag: tagFinal,
      item: editForm.item.trim(),
      valor: valorFinal,
      dia: editForm.dia ?? l.dia ?? null,
      debitoAutomatico: editForm.debitoAutomatico ?? l.debitoAutomatico ?? false,
    };
    if (tagFinal) addTagMutation.mutate(tagFinal);
    saveMutation.mutate(
      lancamentos.map((x) => (x.id === editingId ? updated : x))
    );
    setEditingId(null);
    setEditForm(null);
    setEditValorStr("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
    setEditValorStr("");
  };

  const clearInline = () => {
    setInline({ tipo: "fixo", tag: "", item: "", valor: 0, dia: null, debitoAutomatico: false });
    setInlineValorStr("");
  };

  const handleSaveInline = () => {
    if (!inline.item.trim()) return;
    const valorFinal = inlineValorStr ? parseBRLExpression(inlineValorStr) : inline.valor;
    const tagFinal = inline.tag?.trim() || undefined;
    const novo: Lancamento = {
      id: crypto.randomUUID(),
      tipo: inline.tipo,
      tag: tagFinal,
      item: inline.item.trim(),
      valor: valorFinal,
      executado: false,
      dia: inline.dia,
      debitoAutomatico: inline.debitoAutomatico,
    };
    if (tagFinal) addTagMutation.mutate(tagFinal);
    saveMutation.mutate([...lancamentos, novo]);
    clearInline();
  };

  const handleEdit = (l: Lancamento) => {
    setEditingId(l.id);
    setEditForm({
      tipo: l.tipo,
      tag: l.tag ?? "",
      item: l.item,
      valor: l.valor,
      dia: l.dia ?? null,
      debitoAutomatico: l.debitoAutomatico ?? false,
    });
    setEditValorStr(l.valor === 0 ? "" : formatBRLForInput(l.valor));
  };

  const tagSuggestions = useMemo(() => {
    const fromLancamentos = lancamentos
      .map((l) => l.tag)
      .filter((t): t is string => !!t?.trim());
    const seen = new Set<string>();
    return [...tagsCaixa, ...fromLancamentos]
      .filter((t) => {
        const key = t.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [tagsCaixa, lancamentos]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Carregando...
        </CardContent>
      </Card>
    );
  }

  const entradas = resumo.ativoCirculante;
  const saidas = Math.abs(resumo.passivoCirculante);
  const somaEntradasSaidas = entradas + saidas;
  const entradasPct = somaEntradasSaidas > 0 ? (entradas / somaEntradasSaidas) * 100 : 50;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <Card>
          <CardContent className="space-y-4">
            {total > 0 && (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {pagas} de {total} contas executadas
                  </span>
                  <span>{Math.round(progresso)}%</span>
                </div>
                <Progress value={progresso} className="h-2" />
              </div>
            )}
            <div className="rounded-md border">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <Table className="[&_th]:h-9 [&_th]:py-2 [&_th]:px-3 [&_td]:py-2 [&_td]:px-3">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10" />
                    <TableHead>Tipo</TableHead>
                    <TableHead>Tag</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right w-32 min-w-[7rem]">Valor</TableHead>
                    <TableHead className="w-16">Dia</TableHead>
                    <TableHead className="w-12" />
                    <TableHead className="w-20">
                      <div className="flex justify-end">
                        <AlertDialog>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  disabled={clearMutation.isPending}
                                  aria-label="Apagar tudo"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                            </TooltipTrigger>
                            <TooltipContent>Apagar tudo</TooltipContent>
                          </Tooltip>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Limpar mês inteiro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Isso vai apagar todos os lançamentos e o resumo de{" "}
                                <strong>{format(new Date(anoMes + "-01"), "MMMM yyyy", { locale: ptBR })}</strong>.
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => clearMutation.mutate()}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {clearMutation.isPending ? "Limpando..." : "Limpar tudo"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableHead>
                    <TableHead className="w-12">Executado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordenados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        Nenhum lançamento.
                      </TableCell>
                    </TableRow>
                  ) : (
                    <SortableContext
                      items={ordenados.map((l) => l.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {ordenados.map((l) => {
                        const isEditing = editingId === l.id && editForm;
                        return (
                          <SortableTableRow
                            key={l.id}
                            id={l.id}
                            className={isEditing ? "bg-muted/50" : ""}
                          >
                            <TableCell>
                            {isEditing && editForm ? (
                              <Select
                                value={editForm.tipo}
                                onValueChange={(v) =>
                                  setEditForm((p) => (p ? { ...p, tipo: v as TipoLancamento } : null))
                                }
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {TIPOS.map((t) => (
                                    <SelectItem key={t} value={t}>
                                      {t}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                {l.tipo}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {isEditing && editForm ? (
                              <TagCombobox
                                value={editForm.tag}
                                onChange={(v) =>
                                  setEditForm((p) => (p ? { ...p, tag: v } : null))
                                }
                                suggestions={tagSuggestions}
                                placeholder="Tag"
                                onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                              />
                            ) : (
                              <TagBadge tag={l.tag ?? ""} />
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            {isEditing && editForm ? (
                              <Input
                                className="h-8"
                                value={editForm.item}
                                onChange={(e) =>
                                  setEditForm((p) => (p ? { ...p, item: e.target.value } : null))
                                }
                                onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                              />
                            ) : (
                              l.item
                            )}
                          </TableCell>
                          <TableCell
                            className={`text-right font-mono ${
                              l.valor >= 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-destructive"
                            }`}
                          >
                            {isEditing && editForm ? (
                              <Input
                                type="text"
                                inputMode="decimal"
                                className="h-8 w-full min-w-[7rem] max-w-[8rem] text-right font-mono"
                                value={editValorStr}
                                onChange={(e) => setEditValorStr(e.target.value)}
                                onBlur={(e) => {
                                  const parsed = parseBRLExpression(e.target.value);
                                  if (parsed !== 0) {
                                    setEditValorStr(formatBRLForInput(parsed));
                                  }
                                }}
                                onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                              />
                            ) : (
                              formatBRL(l.valor)
                            )}
                          </TableCell>
                          <TableCell>
                            {isEditing && editForm ? (
                              <Input
                                type="number"
                                min={1}
                                max={31}
                                className="h-8 w-14"
                                placeholder="—"
                                value={editForm.dia ?? ""}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  setEditForm((p) =>
                                    p
                                      ? {
                                          ...p,
                                          dia: v === "" ? null : parseInt(v, 10) || null,
                                        }
                                      : null
                                  );
                                }}
                                onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                              />
                            ) : (
                              l.dia ?? "—"
                            )}
                          </TableCell>
                          <TableCell>
                            {isEditing && editForm ? (
                              <Checkbox
                                checked={editForm.debitoAutomatico}
                                onCheckedChange={(v) =>
                                  setEditForm((p) =>
                                    p ? { ...p, debitoAutomatico: !!v } : null
                                  )
                                }
                              />
                            ) : (
                              l.debitoAutomatico && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Zap className="w-4 h-4 text-amber-500" />
                                  </TooltipTrigger>
                                  <TooltipContent>Débito automático</TooltipContent>
                                </Tooltip>
                              )
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-1">
                              {isEditing && editForm ? (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-primary"
                                    onClick={handleSaveEdit}
                                    disabled={!editForm.item.trim()}
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={handleCancelEdit}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleEdit(l)}
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => handleDelete(l.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {!isEditing && (
                              <Checkbox
                                checked={l.executado}
                                onCheckedChange={() => toggleExecutado(l)}
                              />
                            )}
                          </TableCell>
                        </SortableTableRow>
                      );
                    })}
                    </SortableContext>
                  )}
                  <TableRow className="bg-muted/30">
                      <TableCell className="w-10" />
                      <TableCell>
                        <Select
                          value={inline.tipo}
                          onValueChange={(v) =>
                            setInline((p) => ({ ...p, tipo: v as TipoLancamento }))
                          }
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TIPOS.map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <TagCombobox
                          value={inline.tag}
                          onChange={(v) => setInline((p) => ({ ...p, tag: v }))}
                          suggestions={tagSuggestions}
                          placeholder="Tag"
                          onKeyDown={(e) => e.key === "Enter" && handleSaveInline()}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          className="h-8"
                          placeholder="Item"
                          value={inline.item}
                          onChange={(e) =>
                            setInline((p) => ({ ...p, item: e.target.value }))
                          }
                          onKeyDown={(e) => e.key === "Enter" && handleSaveInline()}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="text"
                          inputMode="decimal"
                          className="h-8 w-full min-w-[7rem] max-w-[8rem] text-right font-mono"
                          placeholder="0,00"
                          value={inlineValorStr}
                          onChange={(e) => setInlineValorStr(e.target.value)}
                          onBlur={(e) => {
                            const parsed = parseBRLExpression(e.target.value);
                            if (parsed !== 0) {
                              setInlineValorStr(formatBRLForInput(parsed));
                            }
                          }}
                          onKeyDown={(e) => e.key === "Enter" && handleSaveInline()}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={1}
                          max={31}
                          className="h-8 w-14"
                          placeholder="—"
                          value={inline.dia ?? ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            setInline((p) => ({
                              ...p,
                              dia: v === "" ? null : parseInt(v, 10) || null,
                            }));
                          }}
                          onKeyDown={(e) => e.key === "Enter" && handleSaveInline()}
                        />
                      </TableCell>
                      <TableCell className="w-12" />
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary"
                            onClick={handleSaveInline}
                            disabled={!inline.item.trim()}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={clearInline}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell />
                    </TableRow>
                </TableBody>
              </Table>
              </DndContext>
            </div>
            <div
              className="sticky bottom-0 z-10 mt-4 flex flex-col gap-2 rounded-md border bg-card py-2 px-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]"
              aria-label="Resumo financeiro"
            >
              <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="bg-emerald-500 transition-all"
                  style={{ width: `${entradasPct}%` }}
                />
                <div
                  className="bg-destructive transition-all"
                  style={{ width: `${100 - entradasPct}%` }}
                />
              </div>
              <div className="flex justify-end gap-6 text-sm">
                <div className="flex flex-col gap-1 text-right pr-20 opacity-80">
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Previsto
                  </span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {formatBRL(entradas)}
                      </span>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto py-2 px-3 animate-none duration-0" align="end">
                      Entradas
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <span className="text-destructive">
                        {formatBRL(-saidas)}
                      </span>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto py-2 px-3 animate-none duration-0" align="end">
                      Saídas
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <span
                        className={
                          resumo.balancoPrevisto >= 0
                            ? "text-primary"
                            : "text-destructive"
                        }
                      >
                        {formatBRL(resumo.balancoPrevisto)}
                      </span>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto py-2 px-3 animate-none duration-0" align="end">
                      Balanço
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex flex-col gap-1 text-right pl-20">
                  <span className="text-xs font-medium uppercase tracking-wide">
                    Executado
                  </span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        {formatBRL(entradasExecutadas)}
                      </span>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto py-2 px-3 animate-none duration-0" align="end">
                      Entradas
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <span className="text-destructive font-medium">
                        {formatBRL(-saidasExecutadas)}
                      </span>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto py-2 px-3 animate-none duration-0" align="end">
                      Saídas
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <span
                        className={
                          resumo.posicao >= 0
                            ? "text-primary font-medium"
                            : "text-destructive font-medium"
                        }
                      >
                        {formatBRL(resumo.posicao)}
                      </span>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto py-2 px-3 animate-none duration-0" align="end">
                      Posição
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
}
