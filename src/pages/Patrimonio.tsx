import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getTotalInvestimentosAtual } from "@/data/investimentos-data";

interface AtivoImobiliario {
  nome: string;
  descricao: string;
  valor: number;
  liquidez: string;
}

const ativosImobiliaarios: AtivoImobiliario[] = [
  {
    nome: "Imóvel Herdado (Sua cota de 50%)",
    descricao: "Participação em imóvel recebido por herança",
    valor: 150_000,
    liquidez: "Ilíquido",
  },
];

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function Patrimonio() {
  const totalAtivos = ativosImobiliaarios.reduce((sum, a) => sum + a.valor, 0);
  const totalInvestimentos = getTotalInvestimentosAtual();
  const patrimonioTotal = totalAtivos + totalInvestimentos;

  return (
    <div className="min-h-screen gradient-mesh">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Patrimônio</h1>
            <p className="text-sm text-muted-foreground">
              Ativos ilíquidos – patrimônio imobiliário
            </p>
          </div>
        </motion.header>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total em Investimentos (atual)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-muted-foreground" />
                <span className="text-2xl font-bold">{formatBRL(totalInvestimentos)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Renda fixa + fundos (posição atual)
              </p>
            </CardContent>
          </Card>
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total em Ativos Imobiliários</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{formatBRL(totalAtivos)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Patrimônio ilíquido (não disponível para resgate imediato)
              </p>
            </CardContent>
          </Card>
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Patrimônio total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{formatBRL(patrimonioTotal)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Investimentos + ativos imobiliários
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ativos Imobiliários (Ilíquidos)</CardTitle>
            <CardDescription>
              Bens imóveis e participações. Valores estimados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ativosImobiliaarios.map((ativo, idx) => (
                <motion.div
                  key={ativo.nome}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div className="flex-1">
                    <div className="font-semibold mb-1">{ativo.nome}</div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{ativo.descricao}</span>
                      <Badge variant="secondary">{ativo.liquidez}</Badge>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-xl font-bold font-mono">{formatBRL(ativo.valor)}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
