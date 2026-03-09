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
import { Pencil, Trash2, Zap, Check, X, Copy } from "lucide-react";
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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatBRL, formatBRLForInput, parseBRL } from "@/lib/utils";
import { useLancamentos, useSaveLancamentos, useClearMesInteiro, useResumo, useTagsCaixa, useAddTagCaixa } from "@/hooks/use-caixa";
import { toast } from "sonner";
import { getLancamentosMes } from "@/services/caixa-service";
import type { Lancamento, TipoLancamento, ResumoMes } from "@/types/caixa";
import { SortableTableRow } from "./SortableTableRow";
import { TagCombobox } from "./TagCombobox";

const TIPOS: TipoLancamento[] = ["giro", "entrada", "fixo", "poupança", "variavel"];

function anoMesAnterior(anoMes: string): string {
  const [y, m] = anoMes.split("-").map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

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
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
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
    if (filtroTipo === "todos") return lancamentos;
    return lancamentos.filter((l) => l.tipo === filtroTipo);
  }, [lancamentos, filtroTipo]);

  const ordenados = useMemo(() => [...filtrados], [filtrados]);

  const calculado = useMemo(
    () => calcularResumo(lancamentos),
    [lancamentos]
  );

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
    if (filtroTipo === "todos") {
      saveMutation.mutate(newFiltrados);
    } else {
      const filteredIds = new Set(newFiltrados.map((l) => l.id));
      const filteredIndices = lancamentos
        .map((l, i) => (filteredIds.has(l.id) ? i : -1))
        .filter((i) => i >= 0);
      const newLancamentos = [...lancamentos];
      newFiltrados.forEach((item, i) => {
        newLancamentos[filteredIndices[i]] = item;
      });
      saveMutation.mutate(newLancamentos);
    }
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
    const valorFinal = editValorStr ? parseBRL(editValorStr) : (editForm.valor ?? l.valor);
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
    const valorFinal = inlineValorStr ? parseBRL(inlineValorStr) : inline.valor;
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

  const [copiando, setCopiando] = useState(false);
  const handleCopiarMesAnterior = async () => {
    const mesAnterior = anoMesAnterior(anoMes);
    setCopiando(true);
    try {
      const anteriores = await getLancamentosMes(mesAnterior);
      if (anteriores.length === 0) {
        toast.info("Mês anterior vazio", {
          description: `Nenhum lançamento em ${format(new Date(mesAnterior + "-01"), "MMMM yyyy", { locale: ptBR })}.`,
        });
        return;
      }
      const clonados: Lancamento[] = anteriores.map((l) => ({
        ...l,
        id: crypto.randomUUID(),
        executado: false,
      }));
      saveMutation.mutate(clonados);
      toast.success("Copiado do mês anterior", {
        description: `${clonados.length} lançamento(s) clonado(s). Status "executado" zerado.`,
      });
    } catch (err) {
      toast.error("Erro ao copiar", {
        description: err instanceof Error ? err.message : "Não foi possível buscar o mês anterior.",
      });
    } finally {
      setCopiando(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Carregando...
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Posição atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  resumo.posicao >= 0 ? "text-primary" : "text-destructive"
                }`}
              >
                {formatBRL(resumo.posicao)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Caixa disponível
              </p>
            </CardContent>
          </Card>
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ativo circulante
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatBRL(resumo.ativoCirculante)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Entradas</p>
            </CardContent>
          </Card>
          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Passivo circulante
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {formatBRL(resumo.passivoCirculante)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Saídas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Balanço previsto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  resumo.balancoPrevisto >= 0 ? "text-primary" : "text-destructive"
                }`}
              >
                {formatBRL(resumo.balancoPrevisto)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Ativo − Passivo
              </p>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Contas do mês</CardTitle>
              <CardDescription>
                Lançamentos com marcação de pagamento (executado)
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopiarMesAnterior}
                disabled={copiando || saveMutation.isPending}
              >
                <Copy className="w-4 h-4 mr-1" />
                Copiar do mês passado
              </Button>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {TIPOS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {total > 0 && (
              <div className="space-y-2">
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
                <Table>
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
                              l.tag ?? "—"
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
                                  const parsed = parseBRL(e.target.value);
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
                                <Zap className="w-4 h-4 text-amber-500" title="Débito automático" />
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
                            const parsed = parseBRL(e.target.value);
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
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
}
