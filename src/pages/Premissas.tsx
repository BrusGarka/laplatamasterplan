import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  Scale,
  TrendingUp,
  RefreshCw,
  Clock,
  User,
  Calculator,
  Users,
  Shield,
  Sparkles,
  AlertTriangle,
  BookOpen,
} from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function Premissas() {
  return (
    <div className="min-h-screen gradient-mesh">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Premissas</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Regras do jogo, perfil atual e raio-x do plano
          </p>
        </motion.header>

        {/* 1. Premissas (Regras do Jogo) */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Suas Premissas</h2>
            <Badge variant="secondary" className="text-xs">
              Regras do jogo
            </Badge>
          </div>
          <motion.ul
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-3 sm:grid-cols-1"
          >
            {[
              {
                icon: TrendingUp,
                title: "Aporte de ferro",
                text: "Poupar R$ 9.116,66 mensais — cálculo exato para +R$ 100k nominais por ano (Meta 2024-2026).",
                accent: "primary",
              },
              {
                icon: Scale,
                title: "Poder de compra",
                text: "Reajustar tudo pelo IPCA. Objetivos de R$ 1 milhão e renda passiva em valores de hoje.",
                accent: "primary",
              },
              {
                icon: Sparkles,
                title: "Rentabilidade real",
                text: "Premissa de IPCA + 6% a 8% — acima da média de mercado, permitindo metas ousadas com aportes controlados.",
                accent: "accent",
              },
              {
                icon: RefreshCw,
                title: "Reinvestimento integral",
                text: "100% dos rendimentos (cupons de CRAs e juros de CDBs) voltam para a carteira, alimentando juros compostos.",
                accent: "primary",
              },
              {
                icon: Clock,
                title: "Horizonte longuíssimo prazo",
                text: "Aceitar travar o dinheiro por décadas (até 2065) em troca de taxas que não existem no mercado comum.",
                accent: "primary",
              },
            ].map((prem, i) => (
              <motion.li key={i} variants={item}>
                <Card className="border-primary/10 hover:border-primary/20 transition-colors">
                  <CardContent className="flex gap-3 pt-4">
                    <div className="shrink-0 p-1.5 rounded-md bg-primary/10">
                      <prem.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm mb-0.5">{prem.title}</p>
                      <p className="text-sm text-muted-foreground">{prem.text}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.li>
            ))}
          </motion.ul>
        </motion.section>

        {/* 2. Características (Perfil Atual) */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-semibold">Suas Características</h2>
            <Badge variant="outline" className="text-xs">
              Perfil atual
            </Badge>
          </div>
          <motion.ul
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-3 sm:grid-cols-1"
          >
            {[
              {
                icon: Shield,
                title: "Perfil High-Yield travado",
                text: "Conservador na definição, na prática investidor de valor em renda fixa: caça taxas altas em ativos isentos de IR e abre mão da liquidez.",
              },
              {
                icon: Calculator,
                title: "CTO eficiente",
                text: "Fluxo de caixa estruturado, planilha detalhada e busca por eficiência tributária — quase não paga IR sobre ganhos.",
              },
              {
                icon: Users,
                title: "Provedor e generoso",
                text: "Cerca de R$ 5.370/mês (quase 20% da renda bruta) em repasses para família (Mari, Bruninho, Xu) ou dívidas familiares.",
              },
              {
                icon: TrendingUp,
                title: "Exposição ao crédito privado",
                text: "DNA de crédito privado: confiança no agronegócio (Seara, Minerva, Jalles) e infraestrutura (Igua, Aegea) para construir o milhão.",
              },
              {
                icon: AlertTriangle,
                title: "Subprotegido (lacuna de risco)",
                text: "Excelente acumulador, mas proteção frágil: sem seguro de vida ou invalidez; o plano depende 100% da saúde e da capacidade de trabalhar como CTO.",
                alert: true,
              },
              {
                icon: Clock,
                title: "Paciência de ouro",
                text: "Ativos com vencimento em 2055 e 2065 — visão de tempo superior a 99% dos investidores brasileiros.",
              },
            ].map((car, i) => (
              <motion.li key={i} variants={item}>
                <Card
                  className={
                    car.alert
                      ? "border-destructive/30 bg-destructive/5 hover:border-destructive/40"
                      : "border-border hover:border-primary/20 transition-colors"
                  }
                >
                  <CardContent className="flex gap-3 pt-4">
                    <div
                      className={`shrink-0 p-1.5 rounded-md ${
                        car.alert ? "bg-destructive/15" : "bg-accent/10"
                      }`}
                    >
                      <car.icon
                        className={`w-4 h-4 ${car.alert ? "text-destructive" : "text-accent"}`}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm mb-0.5">{car.title}</p>
                      <p className="text-sm text-muted-foreground">{car.text}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.li>
            ))}
          </motion.ul>
        </motion.section>

        {/* 3. Resumo do Raio-X */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Resumo do Raio-X
          </h2>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-4 space-y-4">
              <p className="text-sm text-foreground/90">
                Você é um{" "}
                <strong className="text-primary">acumulador de alto desempenho</strong>{" "}
                com custo de vida controlado (exceto o suporte familiar), que compensa
                o conservadorismo com a escolha de ativos de crédito de alta
                rentabilidade.
              </p>
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
                <p className="text-sm font-medium text-destructive flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  O grande risco
                </p>
                <p className="text-sm text-muted-foreground">
                  As premissas dependem de você estar vivo e ativo por muito tempo. Se
                  o salário (maior entrada) parar hoje, o patrimônio de R$ 238k ainda
                  não sustenta a estrutura de gastos e aportes.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </div>
  );
}
