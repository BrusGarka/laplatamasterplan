import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, FileText, ExternalLink } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface CotacaoRow {
  cobertura: string;
  beneficio: string;
  contribuicaoMensal: string;
}

const seguros: Seguro[] = [
  { tipo: "Vida", seguradora: "A preencher", premioAnual: 0, vigencia: "—", beneficiario: "—" },
  { tipo: "Residencial", seguradora: "A preencher", premioAnual: 0, vigencia: "—" },
  { tipo: "Saúde", seguradora: "A preencher", premioAnual: 0, vigencia: "—" },
  { tipo: "Automóvel", seguradora: "A preencher", premioAnual: 0, vigencia: "—" },
];

const cotacaoVidaToda: CotacaoRow[] = [
  { cobertura: "IPA Majorada (invalidez por acidente)", beneficio: "R$ 1.000.000", contribuicaoMensal: "R$ 76,05" },
  { cobertura: "Invalidez Permanente por Doença", beneficio: "R$ 1.000.000", contribuicaoMensal: "R$ 52,17" },
  { cobertura: "Diária de Incapacidade Temporária (a partir do 8º dia, até 365 diárias)", beneficio: "R$ 10.000/mês", contribuicaoMensal: "R$ 228,46" },
  { cobertura: "Morte Acidental", beneficio: "R$ 100.000", contribuicaoMensal: "R$ 14,56" },
  { cobertura: "IPA Majorada adicional (por acidente)", beneficio: "R$ 100.000", contribuicaoMensal: "R$ 7,73" },
];

const DOCUMENTOS_SEGUROS = [
  { titulo: "Condições gerais de invalidez", url: "/seguros/condicoes-gerais-invalidez.pdf" },
  { titulo: "Cotação VIDA TODA VD XP (11/12/2025)", url: "/seguros/cotacao-vida-toda-vd-xp.pdf" },
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
  const [pdfAtivo, setPdfAtivo] = useState(0);

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
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Documentos
            </CardTitle>
            <CardDescription>
              Condições gerais e cotação para visualização ou download.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {DOCUMENTOS_SEGUROS.map((doc) => (
                <a
                  key={doc.url}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{doc.titulo}</p>
                    <p className="text-xs text-muted-foreground">Abrir PDF</p>
                  </div>
                  <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
                </a>
              ))}
            </div>
            <div className="rounded-md border overflow-hidden">
              <Tabs value={String(pdfAtivo)} onValueChange={(v) => setPdfAtivo(Number(v))}>
                <div className="px-3 py-2 border-b bg-muted/30 flex items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">Visualização em linha</p>
                  <TabsList className="h-8">
                    {DOCUMENTOS_SEGUROS.map((doc, i) => (
                      <TabsTrigger key={doc.url} value={String(i)} className="text-xs">
                        {i === 0 ? "Condições gerais" : "Cotação"}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
                <iframe
                  title={DOCUMENTOS_SEGUROS[pdfAtivo].titulo}
                  src={`${DOCUMENTOS_SEGUROS[pdfAtivo].url}#toolbar=1`}
                  className="w-full h-[480px] rounded-b-md"
                />
              </Tabs>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cotação — VIDA TODA VD XP</CardTitle>
            <CardDescription>
              Cotação de 11/12/2025. Contribuição mensal por cobertura.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cobertura</TableHead>
                    <TableHead>Benefício</TableHead>
                    <TableHead className="text-right">Contribuição mensal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cotacaoVidaToda.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{row.cobertura}</TableCell>
                      <TableCell>{row.beneficio}</TableCell>
                      <TableCell className="text-right font-mono">{row.contribuicaoMensal}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/30 font-semibold">
                    <TableCell colSpan={2}>Total</TableCell>
                    <TableCell className="text-right font-mono">R$ 378,97/mês</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
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
