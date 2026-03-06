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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Zap, Check, X } from "lucide-react";
import { formatBRL, formatBRLForInput, parseBRL } from "@/lib/utils";
import { useContasFixas, useSaveContasFixas } from "@/hooks/use-caixa";
import type { Lancamento, TipoLancamento } from "@/types/caixa";
import { SortableTableRow } from "./SortableTableRow";

const TIPOS: TipoLancamento[] = ["giro", "entrada", "fixo", "poupança", "variavel"];

export function ContasFixasTemplateCard() {
  const { data: contas = [], isLoading } = useContasFixas();
  const saveMutation = useSaveContasFixas();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    tipo: TipoLancamento;
    item: string;
    valor: number;
    dia: number | null;
    debitoAutomatico: boolean;
  } | null>(null);
  const [inline, setInline] = useState({
    tipo: "fixo" as TipoLancamento,
    item: "",
    valor: 0,
    dia: null as number | null,
    debitoAutomatico: false,
  });

  const ordenados = useMemo(() => [...contas], [contas]);

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
    const newOrdenados = arrayMove(ordenados, oldIndex, newIndex);
    saveMutation.mutate(newOrdenados);
  };

  const handleSaveEdit = () => {
    if (!editingId || !editForm?.item?.trim()) return;
    const l = contas.find((x) => x.id === editingId);
    if (!l) return;
    const updated: Lancamento = {
      ...l,
      tipo: editForm.tipo,
      item: editForm.item.trim(),
      valor: editForm.valor,
      dia: editForm.dia,
      debitoAutomatico: editForm.debitoAutomatico ?? false,
    };
    saveMutation.mutate(
      contas.map((x) => (x.id === editingId ? updated : x))
    );
    setEditingId(null);
    setEditForm(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleDelete = (id: string) => {
    const updated = contas.filter((x) => x.id !== id);
    saveMutation.mutate(updated);
  };

  const handleEdit = (l: Lancamento) => {
    setEditingId(l.id);
    setEditForm({
      tipo: l.tipo,
      item: l.item,
      valor: l.valor,
      dia: l.dia ?? null,
      debitoAutomatico: l.debitoAutomatico ?? false,
    });
  };

  const clearInline = () => {
    setInline({ tipo: "fixo", item: "", valor: 0, dia: null, debitoAutomatico: false });
  };

  const handleSaveInline = () => {
    if (!inline.item.trim()) return;
    const novo: Lancamento = {
      id: crypto.randomUUID(),
      tipo: inline.tipo,
      item: inline.item.trim(),
      valor: inline.valor,
      executado: false,
      dia: inline.dia,
      debitoAutomatico: inline.debitoAutomatico,
    };
    saveMutation.mutate([...contas, novo]);
    clearInline();
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Contas fixas (template)</CardTitle>
            <CardDescription>
              Cadastro de contas fixas padrão para referência
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right w-32 min-w-[7rem]">Valor</TableHead>
                  <TableHead className="w-16">Dia</TableHead>
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordenados.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Nenhuma conta fixa cadastrada. Adicione na linha abaixo.
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
                              value={editForm.valor === 0 ? "" : formatBRLForInput(editForm.valor)}
                              onChange={(e) =>
                                setEditForm((p) =>
                                  p ? { ...p, valor: parseBRL(e.target.value) } : null
                                )
                              }
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
                              <Zap
                                className="w-4 h-4 text-amber-500"
                                title="Débito automático"
                              />
                            )
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
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
                      value={inline.valor === 0 ? "" : formatBRLForInput(inline.valor)}
                      onChange={(e) => {
                        const n = parseBRL(e.target.value);
                        setInline((p) => ({ ...p, valor: n }));
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
                  <TableCell>
                    <Checkbox
                      checked={inline.debitoAutomatico}
                      onCheckedChange={(v) =>
                        setInline((p) => ({ ...p, debitoAutomatico: !!v }))
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
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
                </TableRow>
              </TableBody>
            </Table>
            </DndContext>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
