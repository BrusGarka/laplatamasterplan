import { motion } from "framer-motion";
import { Link } from "react-router-dom";
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
import { Car, ArrowLeft, CheckCircle2 } from "lucide-react";

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function CarrinhoByd() {
  return (
    <div className="min-h-screen gradient-mesh">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <Link
            to="/sonhos"
            className="p-2 rounded-lg bg-muted hover:bg-muted/80 border border-border transition-colors"
            aria-label="Voltar para Sonhos"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <Car className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Carrinho BYD</h1>
            <p className="text-sm text-muted-foreground">
              Projeto BYD Dolphin Mini PCD (Não Condutora)
            </p>
          </div>
        </motion.header>

        {/* Premissas do Carro */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Premissas do Carro</CardTitle>
              <CardDescription>Modelo, aquisição e uso</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><span className="font-medium text-muted-foreground">Modelo:</span> BYD Dolphin Mini 2026 0km</p>
              <p><span className="font-medium text-muted-foreground">Compra via:</span> PcD (esposa, não condutora, fibromialgia)</p>
              <p><span className="font-medium text-muted-foreground">Preço PcD estimado:</span> {formatBRL(100_000)} (isenção IPI + ICMS)</p>
              <p><span className="font-medium text-muted-foreground">Cidade:</span> Divinópolis/MG</p>
              <p><span className="font-medium text-muted-foreground">Uso:</span> 1.000 km/mês</p>
            </CardContent>
          </Card>
        </motion.section>

        {/* Fase 1 – Acumulação da Entrada */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Fase 1 – Acumulação da Entrada (Meses 1 a 12)</CardTitle>
              <CardDescription>Poupança mensal e rendimento até a entrada</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Poupança mensal</TableCell>
                    <TableCell className="text-right font-mono">{formatBRL(3_000)}/mês</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Rendimento estimado (1% a.m.)</TableCell>
                    <TableCell className="text-right font-mono">{formatBRL(2_047)} de rendimento total</TableCell>
                  </TableRow>
                  <TableRow className="bg-muted/50 font-medium">
                    <TableCell>Entrada acumulada ao final de 12 meses</TableCell>
                    <TableCell className="text-right font-mono">{formatBRL(38_047)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.section>

        {/* Fase 2 – Financiamento */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Fase 2 – Financiamento (A partir do Mês 13)</CardTitle>
              <CardDescription>Valor financiado, prazo e parcelas</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Preço do carro</TableCell>
                    <TableCell className="text-right font-mono">{formatBRL(100_000)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Entrada</TableCell>
                    <TableCell className="text-right font-mono">{formatBRL(38_047)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Valor base financiado</TableCell>
                    <TableCell className="text-right font-mono">{formatBRL(61_953)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>IOF embutido (~3,38%)</TableCell>
                    <TableCell className="text-right font-mono">{formatBRL(2_094)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Total financiado</TableCell>
                    <TableCell className="text-right font-mono">{formatBRL(64_047)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Taxa de juros alvo</TableCell>
                    <TableCell className="text-right font-mono">≤ 1,3% a.m.</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Prazo</TableCell>
                    <TableCell className="text-right font-mono">36 meses</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Parcela mensal estimada</TableCell>
                    <TableCell className="text-right font-mono">{formatBRL(2_239)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Total pago ao banco (parcelas)</TableCell>
                    <TableCell className="text-right font-mono">{formatBRL(80_604)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Juros + IOF totais</TableCell>
                    <TableCell className="text-right font-mono">~{formatBRL(18_650)}</TableCell>
                  </TableRow>
                  <TableRow className="bg-muted/50 font-medium">
                    <TableCell>Custo total do carro</TableCell>
                    <TableCell className="text-right font-mono">~{formatBRL(118_650)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.section>

        {/* Custos Mensais Recorrentes */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Custos Mensais Recorrentes Pós-Compra (Mês 13 em diante)</CardTitle>
              <CardDescription>Parcela, energia, seguro, revisão e obrigatórios</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Valor/mês</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Parcela do financiamento</TableCell>
                    <TableCell className="text-right font-mono">{formatBRL(2_239)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Energia elétrica (CEMIG, 1.000 km)</TableCell>
                    <TableCell className="text-right font-mono">{formatBRL(120)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Seguro auto</TableCell>
                    <TableCell className="text-right font-mono">{formatBRL(200)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Revisão/manutenção (média)</TableCell>
                    <TableCell className="text-right font-mono">{formatBRL(100)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Licenciamento + obrigatórios (rateado)</TableCell>
                    <TableCell className="text-right font-mono">{formatBRL(60)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>IPVA</TableCell>
                    <TableCell className="text-right font-mono">{formatBRL(0)} (isenção PcD MG)</TableCell>
                  </TableRow>
                  <TableRow className="bg-primary/10 font-medium">
                    <TableCell>Total mensal com o carro</TableCell>
                    <TableCell className="text-right font-mono">{formatBRL(2_719)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.section>

        {/* Custos Únicos na Compra */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Custos Únicos na Compra (Entrada + Taxas)</CardTitle>
              <CardDescription>Saída total no momento da compra</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Valor estimado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Entrada</TableCell>
                    <TableCell className="text-right font-mono">{formatBRL(38_047)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Tarifa de cadastro (banco)</TableCell>
                    <TableCell className="text-right font-mono">{formatBRL(600)} – {formatBRL(1_000)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Registro de gravame/Detran</TableCell>
                    <TableCell className="text-right font-mono">{formatBRL(200)} – {formatBRL(500)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Emplacamento/despachante</TableCell>
                    <TableCell className="text-right font-mono">{formatBRL(500)} – {formatBRL(1_000)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Estepe fino + película + cristalizador</TableCell>
                    <TableCell className="text-right font-mono">{formatBRL(1_500)}</TableCell>
                  </TableRow>
                  <TableRow className="bg-muted/50 font-medium">
                    <TableCell>Total saída no momento da compra</TableCell>
                    <TableCell className="text-right font-mono">~{formatBRL(41_000)} – {formatBRL(42_000)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.section>

        {/* Estratégia de Amortização */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Estratégia de Amortização Antecipada</CardTitle>
              <CardDescription>CDC, art. 52 §2º</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                Sempre que entrar dinheiro extra (lucro do SaaS, PLR, 13º), aplique em antecipação de parcelas de trás para frente.
                Cada parcela quitada antecipada sai com desconto proporcional de 35% a 40% do valor nominal.
              </p>
              <p>
                Com {formatBRL(3_000)} extras você liquida aproximadamente duas parcelas do final do contrato.
              </p>
            </CardContent>
          </Card>
        </motion.section>

        {/* Saúde Financeira */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardHeader>
              <CardTitle>Saúde Financeira do Compromisso</CardTitle>
              <CardDescription>Renda comprometida e folga orçamentária</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Renda bruta familiar</p>
                  <p className="text-lg font-semibold">{formatBRL(28_000)}/mês</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Custo total mensal do carro</p>
                  <p className="text-lg font-semibold">{formatBRL(2_719)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">% da renda bruta comprometida</p>
                  <p className="text-lg font-semibold">~9,7%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Limite saudável recomendado</p>
                  <p className="text-lg font-semibold">≤ 30%</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="font-medium text-emerald-700 dark:text-emerald-400">Folga orçamentária: Confortável</span>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Marcos do Projeto */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Marcos do Projeto</CardTitle>
              <CardDescription>Cronograma e ações principais</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <Badge variant="secondary" className="shrink-0 mt-0.5">Hoje → Mês 12</Badge>
                  <span>Depositar {formatBRL(3_000)}/mês em investimento a 1% a.m. (CDB/LCA liquidez diária).</span>
                </li>
                <li className="flex gap-3">
                  <Badge variant="secondary" className="shrink-0 mt-0.5">Mês 12</Badge>
                  <span>Resgatar os {formatBRL(38_047)} e ir à concessionária BYD com o laudo da fibromialgia.</span>
                </li>
                <li className="flex gap-3">
                  <Badge variant="secondary" className="shrink-0 mt-0.5">Meses 13 a 48</Badge>
                  <span>Pagar {formatBRL(2_239)} de parcela + {formatBRL(480)} de uso = {formatBRL(2_719)}/mês.</span>
                </li>
                <li className="flex gap-3">
                  <Badge variant="secondary" className="shrink-0 mt-0.5">Qualquer mês</Badge>
                  <span>Dinheiro sobrando? Amortizar de trás para frente no app do banco.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </div>
  );
}
