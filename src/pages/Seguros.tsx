import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Seguro {
  tipo: string;
  seguradora: string;
  premioAnual: number;
  vigencia: string;
  beneficiario?: string;
  observacao?: string;
}

const seguros: Seguro[] = [
  { tipo: "Vida", seguradora: "A preencher", premioAnual: 0, vigencia: "—", beneficiario: "—" },
  { tipo: "Residencial", seguradora: "A preencher", premioAnual: 0, vigencia: "—" },
  { tipo: "Saúde", seguradora: "A preencher", premioAnual: 0, vigencia: "—" },
  { tipo: "Automóvel", seguradora: "A preencher", premioAnual: 0, vigencia: "—" },
];

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function Seguros() {
  const totalAnual = seguros.reduce((s, seg) => s + seg.premioAnual, 0);

  return (
    <div className="min-h-screen gradient-mesh">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <ShieldAlert className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Seguros e Proteção</h1>
            <p className="text-sm text-muted-foreground">
              Vida, residência, saúde e automóvel — custo anual e beneficiários
            </p>
          </div>
        </motion.header>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Prêmio total (ano)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBRL(totalAnual)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Soma dos seguros. Atualize vigências para evitar cobertura vencida.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Coberturas</CardTitle>
            <CardDescription>
              Liste vida, residencial, saúde e automóvel. Inclua beneficiários no seguro de vida.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Seguradora</TableHead>
                    <TableHead className="text-right">Prêmio anual</TableHead>
                    <TableHead>Vigência</TableHead>
                    <TableHead className="text-muted-foreground">Beneficiário</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {seguros.map((seg) => (
                    <TableRow key={seg.tipo}>
                      <TableCell className="font-medium">{seg.tipo}</TableCell>
                      <TableCell>{seg.seguradora}</TableCell>
                      <TableCell className="text-right font-mono">{formatBRL(seg.premioAnual)}</TableCell>
                      <TableCell className="text-sm">{seg.vigencia}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {seg.beneficiario ?? "—"}
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
