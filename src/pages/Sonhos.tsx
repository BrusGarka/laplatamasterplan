import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Sonho {
  nome: string;
  tipo: string;
  valor: number;
  observacao?: string;
}

interface SonhoWithLink extends Sonho {
  link?: string;
}

const sonhos: SonhoWithLink[] = [
  { nome: "Casa", tipo: "Financiamento", valor: 0, observacao: "Valor a preencher" },
  { nome: "Carrinho BYD", tipo: "Financiamento", valor: 0, observacao: "Projeto BYD Dolphin Mini PCD", link: "/sonhos/carrinho-byd" },
  { nome: "IPTU Casa", tipo: "Tributo", valor: 0, observacao: "Valor a preencher" },
  { nome: "Viagem", tipo: "Outras", valor: 0, observacao: "Valor a preencher" },
];

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function Sonhos() {
  const totalSonhos = sonhos.reduce((sum, d) => sum + d.valor, 0);

  return (
    <div className="min-h-screen gradient-mesh">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <Scale className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Sonhos</h1>
            <p className="text-sm text-muted-foreground">
              Visão geral de obrigações e passivos
            </p>
          </div>
        </motion.header>

        <div className="grid gap-4 md:grid-cols-1">
          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total de Sonhos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{formatBRL(totalSonhos)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Soma de todas as obrigações listadas
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detalhamento dos Sonhos</CardTitle>
            <CardDescription>
              Casa, Carrinho BYD, IPTU casa e outros sonhos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Valor (R$)</TableHead>
                    <TableHead className="text-muted-foreground">Observação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sonhos.map((d) => (
                    <TableRow key={d.nome} className={d.link ? "hover:bg-muted/50" : undefined}>
                      <TableCell className="font-medium">
                        {d.link ? (
                          <Link to={d.link} className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded">
                            {d.nome}
                          </Link>
                        ) : (
                          d.nome
                        )}
                      </TableCell>
                      <TableCell>{d.tipo}</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatBRL(d.valor)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {d.observacao ?? "—"}
                      </TableCell>
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
