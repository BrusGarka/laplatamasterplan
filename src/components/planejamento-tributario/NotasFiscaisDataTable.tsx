import { Fragment, useMemo, useState } from "react";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronRight,
  Search,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { contajaNfManifest, notasFiscais, type NotaFiscal } from "@/data/contaja-nf-data";

type SortField =
  | "dataEmissao"
  | "competencia"
  | "tomador"
  | "valorNumero"
  | "status"
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

function dataEmissaoSortKey(data: string | null): number {
  if (!data) return 0;
  const [d, m, y] = data.split(/[/\s]/).map(Number);
  const time = data.includes(":") ? data.split(" ")[1] : "00:00:00";
  const [hh, mi, ss] = time.split(":").map(Number);
  if (!d || !m || !y) return 0;
  return y * 1e10 + m * 1e8 + d * 1e6 + (hh || 0) * 1e4 + (mi || 0) * 100 + (ss || 0);
}

function compareNotas(a: NotaFiscal, b: NotaFiscal, field: SortField): number {
  if (!field) return 0;
  switch (field) {
    case "competencia":
      return competenciaSortKey(a.competencia) - competenciaSortKey(b.competencia);
    case "dataEmissao":
      return dataEmissaoSortKey(a.dataEmissao) - dataEmissaoSortKey(b.dataEmissao);
    case "tomador":
      return a.tomador.localeCompare(b.tomador, "pt-BR");
    case "valorNumero":
      return (a.valorNumero ?? -1) - (b.valorNumero ?? -1);
    case "status":
      return a.status.localeCompare(b.status, "pt-BR");
    default:
      return 0;
  }
}

function statusBadgeVariant(
  slug: string,
  origem: NotaFiscal["origem"]
): "default" | "secondary" | "destructive" | "outline" {
  if (origem === "planejamento") return "outline";
  if (slug === "authorized") return "default";
  if (slug === "canceled" || slug === "rejected") return "destructive";
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

export function NotasFiscaisDataTable() {
  const [search, setSearch] = useState("");
  const [origemFiltro, setOrigemFiltro] = useState<string>("todos");
  const [apenasPlanejadas, setApenasPlanejadas] = useState(false);
  const [sortField, setSortField] = useState<SortField>("competencia");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

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
    let rows = notasFiscais.filter((n) => {
      if (origemFiltro !== "todos" && n.origem !== origemFiltro) return false;
      if (apenasPlanejadas && n.origem !== "planejamento") return false;
      if (!q) return true;
      const blob = [n.tomador, n.servico, n.competencia, n.status, n.valor, n.origem]
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
    if (sortField && sortDirection) {
      const dir = sortDirection === "asc" ? 1 : -1;
      rows = [...rows].sort((a, b) => compareNotas(a, b, sortField) * dir);
    }
    return rows;
  }, [search, origemFiltro, apenasPlanejadas, sortField, sortDirection]);

  const totais = useMemo(() => {
    const emitidas = filtrados.filter((n) => n.origem === "contaja");
    const planejadas = filtrados.filter((n) => n.origem === "planejamento");
    const soma = filtrados.reduce((s, n) => s + (n.valorNumero ?? 0), 0);
    return {
      count: filtrados.length,
      emitidas: emitidas.length,
      planejadas: planejadas.length,
      soma,
    };
  }, [filtrados]);

  const coletaEm = new Date(contajaNfManifest.scrapedAt).toLocaleString("pt-BR");

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total (filtro)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totais.count}</p>
            <p className="text-xs text-muted-foreground">
              {contajaNfManifest.totalContaja} emitidas na Contajá
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Emitidas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totais.emitidas}</p>
            <p className="text-xs text-muted-foreground">autorizadas na plataforma</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Planejadas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totais.planejadas}</p>
            <p className="text-xs text-muted-foreground">jul–dez/2026 · R$ 27 mil</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Soma valores</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatBRL(totais.soma)}</p>
            <p className="text-xs text-muted-foreground">filtro atual</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filtros</CardTitle>
          <CardDescription>
            Contajá em {coletaEm} · {contajaNfManifest.projecoes}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="flex-1 min-w-[200px] space-y-1">
            <Label htmlFor="busca-nf">Buscar</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="busca-nf"
                placeholder="Tomador, serviço, competência…"
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full sm:w-[200px] space-y-1">
            <Label>Origem</Label>
            <Select value={origemFiltro} onValueChange={setOrigemFiltro}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                <SelectItem value="contaja">Contajá (emitidas)</SelectItem>
                <SelectItem value="planejamento">Planejamento</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 pb-0.5">
            <Switch
              id="apenas-planejadas"
              checked={apenasPlanejadas}
              onCheckedChange={setApenasPlanejadas}
            />
            <Label htmlFor="apenas-planejadas" className="cursor-pointer">
              Só projeções jul–dez/2026
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
                    label="Emissão"
                    field="dataEmissao"
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <SortableHead
                    label="Competência"
                    field="competencia"
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <SortableHead
                    label="Tomador"
                    field="tomador"
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    className="min-w-[180px]"
                  />
                  <TableHead>Serviço</TableHead>
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
                  <TableHead>Origem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrados.map((nf) => {
                  const isOpen = expanded[nf.id];
                  return (
                    <Fragment key={nf.id}>
                      <TableRow className={nf.origem === "planejamento" ? "bg-primary/5" : undefined}>
                        <TableCell className="p-1">
                          <button
                            type="button"
                            className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
                            aria-label="Detalhes"
                            onClick={() =>
                              setExpanded((prev) => ({ ...prev, [nf.id]: !prev[nf.id] }))
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
                          {nf.dataEmissao ?? "—"}
                        </TableCell>
                        <TableCell className="font-mono text-xs whitespace-nowrap">
                          {nf.competencia}
                        </TableCell>
                        <TableCell className="text-sm max-w-[200px] truncate" title={nf.tomador}>
                          {nf.tomador}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[160px] truncate">
                          {nf.servico}
                        </TableCell>
                        <TableCell className="font-mono text-xs whitespace-nowrap font-medium">
                          {formatBRL(nf.valorNumero)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={statusBadgeVariant(nf.statusSlug, nf.origem)}
                            className="text-xs"
                          >
                            {nf.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs capitalize">
                            {nf.origem === "planejamento" ? "Planejamento" : "Contajá"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                      {isOpen && (
                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                          <TableCell colSpan={8} className="p-4">
                            <div className="grid gap-3 text-sm md:grid-cols-2">
                              <div>
                                <p className="font-medium mb-1 flex items-center gap-1">
                                  <FileText className="h-4 w-4" />
                                  Identificação
                                </p>
                                <ul className="space-y-0.5 text-muted-foreground font-mono text-xs">
                                  <li>ID: {nf.id}</li>
                                  {nf.contajaId != null && <li>Contajá: {nf.contajaId}</li>}
                                  {nf.observacao && <li>{nf.observacao}</li>}
                                </ul>
                                {nf.nfeLinkXml && (
                                  <a
                                    href={nf.nfeLinkXml}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline mt-2 inline-block"
                                  >
                                    Baixar XML
                                  </a>
                                )}
                              </div>
                              <div>
                                <p className="font-medium mb-1">Registro completo</p>
                                <pre className="max-h-40 overflow-auto rounded-md border bg-background p-2 text-xs">
                                  {JSON.stringify(nf, null, 2)}
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
