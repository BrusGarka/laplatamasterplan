import { Fragment, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Calculator,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronRight,
  Search,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  contajaTributosManifest,
  tributosDocumentos,
  type DocumentoTributo,
} from "@/data/contaja-tributos-data";
import { NotasFiscaisDataTable } from "@/components/planejamento-tributario/NotasFiscaisDataTable";
import { DiagnosticoTributario } from "@/components/planejamento-tributario/DiagnosticoTributario";
import { InformacoesGerais } from "@/components/planejamento-tributario/InformacoesGerais";

type SortField =
  | "competencia"
  | "vencimento"
  | "tipoDocumento"
  | "valorNumero"
  | "status"
  | "anexo"
  | "aliquota"
  | "receita"
  | "imposto"
  | null;
type SortDirection = "asc" | "desc" | null;

function formatBRL(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function competenciaSortKey(competencia: string): number {
  const [mm, yyyy] = competencia.split("/").map(Number);
  if (!mm || !yyyy) return 0;
  return yyyy * 100 + mm;
}

function vencimentoSortKey(vencimento: string): number {
  const [dd, mm, yyyy] = vencimento.split("/").map(Number);
  if (!dd || !mm || !yyyy) return 0;
  return yyyy * 10000 + mm * 100 + dd;
}

function primeiroItemCalculo(doc: DocumentoTributo) {
  return doc.metodoCalculo?.itens?.[0] ?? null;
}

function compareDocs(a: DocumentoTributo, b: DocumentoTributo, field: SortField): number {
  if (!field) return 0;
  const ia = primeiroItemCalculo(a);
  const ib = primeiroItemCalculo(b);
  switch (field) {
    case "competencia":
      return competenciaSortKey(a.competencia) - competenciaSortKey(b.competencia);
    case "vencimento":
      return vencimentoSortKey(a.vencimento) - vencimentoSortKey(b.vencimento);
    case "tipoDocumento":
      return a.tipoDocumento.localeCompare(b.tipoDocumento, "pt-BR");
    case "valorNumero":
      return (a.valorNumero ?? -1) - (b.valorNumero ?? -1);
    case "status":
      return a.status.localeCompare(b.status, "pt-BR");
    case "anexo":
      return (ia?.anexo ?? "").localeCompare(ib?.anexo ?? "", "pt-BR");
    case "aliquota": {
      const pa = parseFloat((a.metodoCalculo?.aliquotaEfetiva ?? "0").replace(",", "."));
      const pb = parseFloat((b.metodoCalculo?.aliquotaEfetiva ?? "0").replace(",", "."));
      return pa - pb;
    }
    case "receita":
      return (a.metodoCalculo?.receitaCompetenciaNumero ?? -1) - (b.metodoCalculo?.receitaCompetenciaNumero ?? -1);
    case "imposto":
      return (a.metodoCalculo?.impostoDevidoNumero ?? -1) - (b.metodoCalculo?.impostoDevidoNumero ?? -1);
    default:
      return 0;
  }
}

function statusBadgeVariant(slug: string): "default" | "secondary" | "destructive" | "outline" {
  if (slug === "paid") return "default";
  if (slug === "overdue" || slug === "expired") return "destructive";
  return "secondary";
}

function SortableHead({
  label,
  field,
  sortField,
  sortDirection,
  onSort,
  className,
}: {
  label: string;
  field: SortField;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (f: SortField) => void;
  className?: string;
}) {
  const icon =
    sortField !== field ? (
      <ArrowUpDown className="ml-1 inline h-3 w-3 opacity-40" />
    ) : sortDirection === "asc" ? (
      <ArrowUp className="ml-1 inline h-3 w-3" />
    ) : (
      <ArrowDown className="ml-1 inline h-3 w-3" />
    );
  return (
    <TableHead className={className}>
      <button
        type="button"
        className="inline-flex items-center whitespace-nowrap text-left font-medium hover:text-foreground"
        onClick={() => onSort(field)}
      >
        {label}
        {icon}
      </button>
    </TableHead>
  );
}

function TributosDataTable() {
  const [search, setSearch] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<string>("todos");
  const [apenasComCalculo, setApenasComCalculo] = useState(false);
  const [sortField, setSortField] = useState<SortField>("competencia");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const tipos = useMemo(() => {
    const set = new Set(tributosDocumentos.map((d) => d.tipoDocumento));
    return [...set].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === "asc") setSortDirection("desc");
      else if (sortDirection === "desc") {
        setSortField(null);
        setSortDirection(null);
      } else setSortDirection("asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filtrados = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = tributosDocumentos.filter((d) => {
      if (tipoFiltro !== "todos" && d.tipoDocumento !== tipoFiltro) return false;
      if (apenasComCalculo && !d.metodoCalculo?.calculoId) return false;
      if (!q) return true;
      const blob = [
        d.tipoDocumento,
        d.competencia,
        d.vencimento,
        d.status,
        d.metodoCalculo?.itens?.[0]?.anexo,
        d.valor,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
    if (sortField && sortDirection) {
      const dir = sortDirection === "asc" ? 1 : -1;
      rows = [...rows].sort((a, b) => compareDocs(a, b, sortField) * dir);
    }
    return rows;
  }, [search, tipoFiltro, apenasComCalculo, sortField, sortDirection]);

  const totais = useMemo(() => {
    const comValor = filtrados.filter((d) => d.valorNumero != null);
    return {
      count: filtrados.length,
      comCalculo: filtrados.filter((d) => d.metodoCalculo?.calculoId).length,
      somaValor: comValor.reduce((s, d) => s + (d.valorNumero ?? 0), 0),
    };
  }, [filtrados]);

  const coletaEm = new Date(contajaTributosManifest.scrapedAt).toLocaleString("pt-BR");

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Registros</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totais.count}</p>
            <p className="text-xs text-muted-foreground">de {contajaTributosManifest.totalDocumentos} na coleta</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Com cálculo DAS</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totais.comCalculo}</p>
            <p className="text-xs text-muted-foreground">método Simples Nacional</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Soma valores (filtro)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatBRL(totais.somaValor)}</p>
            <p className="text-xs text-muted-foreground">linhas com valor na tabela</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filtros</CardTitle>
          <CardDescription>Coleta Contajá em {coletaEm}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="flex-1 min-w-[200px] space-y-1">
            <Label htmlFor="busca-tributos">Buscar</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="busca-tributos"
                placeholder="Tipo, competência, anexo…"
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full sm:w-[220px] space-y-1">
            <Label>Tipo de documento</Label>
            <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {tipos.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 pb-0.5">
            <Switch
              id="apenas-calculo"
              checked={apenasComCalculo}
              onCheckedChange={setApenasComCalculo}
            />
            <Label htmlFor="apenas-calculo" className="cursor-pointer">
              Só com método de cálculo
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <ScrollArea className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8" />
                  <SortableHead
                    label="Competência"
                    field="competencia"
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <SortableHead
                    label="Vencimento"
                    field="vencimento"
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <SortableHead
                    label="Documento"
                    field="tipoDocumento"
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    className="min-w-[160px]"
                  />
                  <SortableHead
                    label="Valor"
                    field="valorNumero"
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <SortableHead
                    label="Status"
                    field="status"
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <TableHead>Pago</TableHead>
                  <SortableHead
                    label="Anexo"
                    field="anexo"
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <SortableHead
                    label="Alíq. ef."
                    field="aliquota"
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <SortableHead
                    label="Receita"
                    field="receita"
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <SortableHead
                    label="Imposto"
                    field="imposto"
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <TableHead>Fator R</TableHead>
                  <TableHead>Fonte</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrados.map((doc) => {
                  const item = primeiroItemCalculo(doc);
                  const isOpen = expanded[doc.contajaId];
                  return (
                    <Fragment key={doc.contajaId}>
                        <TableRow className="group">
                          <TableCell className="p-1">
                              <button
                                type="button"
                                className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
                                aria-label="Detalhes do cálculo"
                                onClick={() =>
                                  setExpanded((prev) => ({
                                    ...prev,
                                    [doc.contajaId]: !prev[doc.contajaId],
                                  }))
                                }
                              >
                                {isOpen ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </button>
                          </TableCell>
                          <TableCell className="font-mono text-xs whitespace-nowrap">
                            {doc.competencia}
                          </TableCell>
                          <TableCell className="font-mono text-xs whitespace-nowrap">
                            {doc.vencimento}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{doc.tipoDocumento}</span>
                          </TableCell>
                          <TableCell className="font-mono text-xs whitespace-nowrap">
                            {doc.valorNumero != null ? formatBRL(doc.valorNumero) : doc.valor}
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusBadgeVariant(doc.statusSlug)} className="text-xs">
                              {doc.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-muted-foreground">
                              {doc.voceJaPagou ? "Sim" : "Não"}
                              {doc.voceJaPagouPeloSistema ? " (auto)" : ""}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs">{item?.anexo ?? "—"}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {doc.metodoCalculo?.aliquotaEfetiva
                              ? `${doc.metodoCalculo.aliquotaEfetiva}%`
                              : "—"}
                          </TableCell>
                          <TableCell className="font-mono text-xs whitespace-nowrap">
                            {doc.metodoCalculo?.receitaCompetencia ?? "—"}
                          </TableCell>
                          <TableCell className="font-mono text-xs whitespace-nowrap">
                            {doc.metodoCalculo?.impostoDevido ?? "—"}
                          </TableCell>
                          <TableCell className="text-xs">
                            {item?.fatorR === true ? "Sim" : item?.fatorR === false ? "Não" : "—"}
                          </TableCell>
                          <TableCell className="max-w-[120px] truncate text-xs text-muted-foreground">
                            {doc.visualizar}
                          </TableCell>
                        </TableRow>
                        {isOpen && (
                          <TableRow className="bg-muted/30 hover:bg-muted/30">
                            <TableCell colSpan={13} className="p-4">
                              <div className="grid gap-3 text-sm md:grid-cols-2">
                                <div>
                                  <p className="font-medium mb-1">Identificação</p>
                                  <ul className="space-y-0.5 text-muted-foreground font-mono text-xs">
                                    <li>ID Contajá: {doc.contajaId}</li>
                                    <li>Hash: {doc.hash}</li>
                                    <li>Slug: {doc.tipoSlug}</li>
                                    {doc.nationalSimpleTaxCalculationId != null && (
                                      <li>
                                        Cálculo Simples: {doc.nationalSimpleTaxCalculationId}
                                      </li>
                                    )}
                                  </ul>
                                </div>
                                <div>
                                  <p className="font-medium mb-1">Método de cálculo (JSON)</p>
                                  <pre className="max-h-48 overflow-auto rounded-md border bg-background p-2 text-xs">
                                    {doc.metodoCalculo
                                      ? JSON.stringify(doc.metodoCalculo, null, 2)
                                      : "Sem dados estruturados — documento abre como PDF na Contajá."}
                                  </pre>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PlanejamentoTributario() {
  return (
    <div className="min-h-screen gradient-mesh">
      <div className="max-w-[1600px] mx-auto px-4 py-8 space-y-6">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <Calculator className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Planejamento Tributário</h1>
            <p className="text-sm text-muted-foreground">
              Tributos, notas fiscais e projeções da empresa (Contajá)
            </p>
          </div>
        </motion.header>

        <Tabs defaultValue="diagnostico" className="space-y-4">
          <TabsList>
            <TabsTrigger value="diagnostico">Planejamento</TabsTrigger>
            <TabsTrigger value="tributos">Tributos</TabsTrigger>
            <TabsTrigger value="notas-fiscais">Notas Fiscais</TabsTrigger>
            <TabsTrigger value="informacoes">Informações gerais</TabsTrigger>
          </TabsList>
          <TabsContent value="diagnostico">
            <DiagnosticoTributario />
          </TabsContent>
          <TabsContent value="tributos">
            <TributosDataTable />
          </TabsContent>
          <TabsContent value="notas-fiscais">
            <NotasFiscaisDataTable />
          </TabsContent>
          <TabsContent value="informacoes">
            <InformacoesGerais />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
