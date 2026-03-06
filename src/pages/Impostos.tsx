import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ItemImposto {
  tipo: string;
  descricao: string;
  valorEstimado: number;
  vencimento: string;
  status: "a_pagar" | "pago" | "estimado";
}

const impostos: ItemImposto[] = [
  { tipo: "IRPF", descricao: "Imposto de Renda Pessoa Física", valorEstimado: 0, vencimento: "Maio/2026", status: "estimado" },
  { tipo: "IR sobre investimentos", descricao: "Rendimentos aplicações (come cotas, vendas)", valorEstimado: 0, vencimento: "Conforme IRPF", status: "estimado" },
  { tipo: "IPTU", descricao: "Imóvel residencial", valorEstimado: 0, vencimento: "Conforme município", status: "a_pagar" },
  { tipo: "IPVA", descricao: "Veículo", valorEstimado: 0, vencimento: "Conforme estado", status: "a_pagar" },
];

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getStatusBadge(s: ItemImposto["status"]) {
  if (s === "pago") return <Badge variant="default" className="text-xs">Pago</Badge>;
  if (s === "a_pagar") return <Badge variant="secondary" className="text-xs">A pagar</Badge>;
  return <Badge variant="outline" className="text-xs">Estimado</Badge>;
}

export default function Impostos() {
  const total = impostos.reduce((s, i) => s + i.valorEstimado, 0);

  return (
    <div className="min-h-screen gradient-mesh">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <Receipt className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Impostos e Tributos</h1>
            <p className="text-sm text-muted-foreground">
              Visão consolidada de IR, IRRF, IR sobre investimentos e tributos
            </p>
          </div>
        </motion.header>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total estimado (ano)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBRL(total)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Preencha os valores para acompanhar. IR sobre investimentos entra no IRPF.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detalhamento</CardTitle>
            <CardDescription>
              Prazos e valores de impostos federais, estaduais e municipais. Mantenha reserva para
              restituição ou pagamento em maio.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Valor estimado</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {impostos.map((i) => (
                    <TableRow key={i.tipo + i.descricao}>
                      <TableCell className="font-medium">{i.tipo}</TableCell>
                      <TableCell className="text-muted-foreground">{i.descricao}</TableCell>
                      <TableCell className="text-right font-mono">{formatBRL(i.valorEstimado)}</TableCell>
                      <TableCell className="text-sm">{i.vencimento}</TableCell>
                      <TableCell>{getStatusBadge(i.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
