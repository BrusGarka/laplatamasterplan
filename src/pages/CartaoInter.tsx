import { useMemo, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CreditCard } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { faturasInter, type LancamentoInter, type TipoLancamentoInter } from "@/data/inter-faturas";


function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function labelMes(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return format(new Date(y, m - 1, d), "MMM/yy", { locale: ptBR });
}

function labelData(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return format(new Date(y, m - 1, d), "dd/MM/yyyy");
}

const CORES_CATEGORIA: Record<string, string> = {
  Saúde: "#e11d48",
  Alimentação: "#16a34a",
  Refeição: "#ea580c",
  Transporte: "#2563eb",
  Compras: "#7c3aed",
  "Moradia e contas": "#0891b2",
  Assinaturas: "#db2777",
  Outros: "#64748b",
  Viagem: "#0d9488",
  Lazer: "#c026d3",
  "Tarifas e encargos": "#b45309",
  Serviços: "#4f46e5",
};

function corCategoria(nome: string): string {
  return CORES_CATEGORIA[nome] ?? "#94a3b8";
}

function soma(lista: LancamentoInter[], tipo?: TipoLancamentoInter): number {
  return lista.reduce((acc, item) => {
    if (tipo && item.tipo !== tipo) return acc;
    return acc + item.valor;
  }, 0);
}

export default function CartaoInter() {
  const [faturaId, setFaturaId] = useState("todas");
  const [categoria, setCategoria] = useState("todas");
  const [busca, setBusca] = useState("");

  const faturasVisiveis = useMemo(
    () => (faturaId === "todas" ? faturasInter : faturasInter.filter((f) => f.vencimento === faturaId)),
    [faturaId]
  );

  const lancamentos = useMemo(
    () => faturasVisiveis.flatMap((f) => f.lancamentos),
    [faturasVisiveis]
  );

  const gastos = useMemo(
    () => lancamentos.filter((l) => l.tipo === "gasto"),
    [lancamentos]
  );

  const totalGastos = soma(gastos);
  const totalPagamentos = soma(lancamentos, "pagamento");
  const totalEstornos = soma(lancamentos, "estorno");
  const media = faturasVisiveis.length ? totalGastos / faturasVisiveis.length : 0;

  const mesesNoRecorte = faturasVisiveis.length || 1;

  const porCategoria = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const item of gastos) {
      mapa.set(item.categoria, (mapa.get(item.categoria) ?? 0) + item.valor);
    }
    return [...mapa.entries()]
      .map(([nome, valor]) => ({
        nome,
        valor,
        media: valor / mesesNoRecorte,
        pct: totalGastos ? (valor / totalGastos) * 100 : 0,
      }))
      .sort((a, b) => b.valor - a.valor);
  }, [gastos, totalGastos, mesesNoRecorte]);

  const serieCategoria = useMemo(() => {
    const nomes = new Set<string>();
    const totais = new Map<string, number>();
    const pontos = faturasInter.map((fatura) => {
      const linha: Record<string, string | number> = { mes: labelMes(fatura.vencimento) };
      for (const item of fatura.lancamentos) {
        if (item.tipo !== "gasto") continue;
        nomes.add(item.categoria);
        linha[item.categoria] = ((linha[item.categoria] as number | undefined) ?? 0) + item.valor;
        totais.set(item.categoria, (totais.get(item.categoria) ?? 0) + item.valor);
      }
      return linha;
    });
    for (const linha of pontos) {
      for (const nome of nomes) {
        if (linha[nome] === undefined) linha[nome] = 0;
      }
    }
    const categorias = [...nomes].sort((a, b) => (totais.get(b) ?? 0) - (totais.get(a) ?? 0));
    return { pontos, categorias };
  }, []);

  const maiores = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const item of gastos) {
      mapa.set(item.descricao, (mapa.get(item.descricao) ?? 0) + item.valor);
    }
    return [...mapa.entries()]
      .map(([nome, valor]) => ({ nome, valor }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 8);
  }, [gastos]);

  const tabela = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return lancamentos
      .filter((item) => categoria === "todas" || item.categoria === categoria)
      .filter((item) => !q || item.descricao.toLowerCase().includes(q))
      .slice()
      .sort((a, b) => b.data.localeCompare(a.data) || b.valor - a.valor);
  }, [lancamentos, categoria, busca]);

  return (
    <div className="min-h-screen gradient-mesh">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Cartão Inter</h1>
              <p className="text-sm text-muted-foreground">
                Extrato das faturas de jun a nov/2026, agrupado por categoria
              </p>
            </div>
          </div>
          <Select value={faturaId} onValueChange={setFaturaId}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="Fatura" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Últimos 6 meses</SelectItem>
              {faturasInter.map((f) => (
                <SelectItem key={f.vencimento} value={f.vencimento}>
                  Vence {labelData(f.vencimento)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Gastos no cartão</CardDescription>
              <CardTitle className="text-2xl">{formatBRL(totalGastos)}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Compras, parcelas e tarifas. Pagamentos ficam de fora.
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Média por fatura</CardDescription>
              <CardTitle className="text-2xl">{formatBRL(media)}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              {faturasVisiveis.length === 1
                ? "1 fatura no recorte"
                : `${faturasVisiveis.length} faturas no recorte`}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pagamentos</CardDescription>
              <CardTitle className="text-2xl">{formatBRL(totalPagamentos)}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">Débito automático e pagamento online</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Estornos</CardDescription>
              <CardTitle className="text-2xl">{formatBRL(totalEstornos)}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Créditos que não são pagamento da fatura
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Categorias ao longo dos meses</CardTitle>
            <CardDescription>
              Cada linha é uma categoria, na fatura daquele mês. Clique na legenda para isolar uma série.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[28rem] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={serieCategoria.pontos}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="mes" className="text-xs" />
                  <YAxis tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} className="text-xs" />
                  <Tooltip formatter={(value: number) => formatBRL(value)} contentStyle={{ borderRadius: "8px" }} />
                  <Legend
                    onClick={(item) => {
                      const nome = String(item.value);
                      setCategoria((atual) => (atual === nome ? "todas" : nome));
                    }}
                  />
                  {serieCategoria.categorias.map((nome) => {
                    const isolada = categoria !== "todas";
                    const ativa = !isolada || categoria === nome;
                    return (
                      <Line
                        key={nome}
                        type="monotone"
                        dataKey={nome}
                        name={nome}
                        stroke={corCategoria(nome)}
                        strokeWidth={ativa ? 2.5 : 1}
                        strokeOpacity={ativa ? 1 : 0.15}
                        dot={{ r: ativa ? 3 : 0 }}
                        activeDot={{ r: 5 }}
                        connectNulls
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Por categoria</CardTitle>
              <CardDescription>
                Clique numa categoria para filtrar. Alimentação é comida de prateleira. Refeição é comida pronta.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {porCategoria.map((cat) => {
                const ativa = categoria === cat.nome;
                return (
                  <button
                    key={cat.nome}
                    type="button"
                    onClick={() => setCategoria(ativa ? "todas" : cat.nome)}
                    className={`w-full space-y-1 rounded-md px-2 py-1 text-left ${
                      ativa ? "bg-primary/10" : "hover:bg-muted/60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 text-sm">
                      <div>
                        <span className="font-medium">{cat.nome}</span>
                        <p className="text-xs text-muted-foreground tabular-nums">
                          média {formatBRL(cat.media)}/mês
                        </p>
                      </div>
                      <span className="tabular-nums text-muted-foreground">
                        {formatBRL(cat.valor)} · {cat.pct.toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={cat.pct} className="h-2" />
                  </button>
                );
              })}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Maiores estabelecimentos</CardTitle>
              <CardDescription>Soma no período filtrado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {maiores.map((item) => (
                <div key={item.nome} className="flex items-start justify-between gap-3 text-sm">
                  <span className="leading-snug">{item.nome}</span>
                  <span className="shrink-0 tabular-nums font-medium">{formatBRL(item.valor)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Lançamentos</CardTitle>
              <CardDescription>
                {`${tabela.length} ${tabela.length === 1 ? "linha" : "linhas"}${
                  categoria !== "todas" ? ` em ${categoria}` : ""
                }`}
              </CardDescription>
            </div>
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar estabelecimento"
              className="sm:max-w-xs"
            />
          </CardHeader>
          <CardContent>
            <div className="rounded-md border max-h-[32rem] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Cartão</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tabela.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Nenhum lançamento nesse filtro.
                      </TableCell>
                    </TableRow>
                  ) : (
                    tabela.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="whitespace-nowrap">{labelData(item.data)}</TableCell>
                        <TableCell>
                          {item.descricao}
                          {item.parcela ? (
                            <span className="ml-2 text-xs text-muted-foreground">parcela {item.parcela}</span>
                          ) : null}
                        </TableCell>
                        <TableCell>{item.categoria}</TableCell>
                        <TableCell className="whitespace-nowrap">•••• {item.cartaoFinal}</TableCell>
                        <TableCell
                          className={`text-right tabular-nums ${
                            item.tipo === "gasto" ? "" : "text-primary"
                          }`}
                        >
                          {item.tipo === "gasto" ? formatBRL(item.valor) : `− ${formatBRL(item.valor)}`}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
