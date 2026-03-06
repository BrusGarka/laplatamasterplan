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
  EyeOff,
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

        {/* 3. Os 5 Pontos Cegos */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <EyeOff className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-semibold">Os 5 Pontos Cegos</h2>
            <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-600 dark:text-amber-400">
              Ordenados por severidade
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
                severity: "red",
                title: "Plano de saúde particular",
                text: "Não está em nenhum lugar do plano. R$4.500/mês para um casal aos 50 anos, R$8.000/mês aos 65, subindo 7-10% ao ano acima do IPCA. Esse custo sozinho exige reajustar a meta de R$4,55M para R$7,1M se quiser manter R$15k de renda livre além do plano.",
              },
              {
                severity: "red",
                title: "Taxa de saque 4,5% agressiva demais",
                text: "A regra de Bengen (4%) foi calibrada para 30 anos de renda. Com IF aos 49, você tem 40+ anos de retiradas. A taxa conservadora é 3,5%, o que eleva a meta para R$5,84M sem incluir saúde.",
              },
              {
                severity: "yellow",
                title: "Sequence of returns risk",
                text: "Se o mercado cair 35% no primeiro ano que você começar a sacar, o portfólio não se recupera completamente mesmo que a média de longo prazo seja boa. Solução: o Bucket System abaixo.",
              },
              {
                severity: "blue",
                title: "Taxas de gestão e come-cotas",
                text: "Fundos com come-cotas antecipam IR em maio e novembro (-0,2-0,3% ao ano). Advisory fees de 0,3-1%: de R$1.100 a R$3.800/mês invisíveis. Preferir instrumentos diretos (Tesouro, LCI/LCA, FIIs) na fase de renda.",
              },
              {
                severity: "neutral",
                title: "Inflação assimétrica do estilo de vida",
                text: "IPCA é uma média. Saúde, educação e serviços sobem mais. Monitorar anualmente.",
              },
            ].map((ponto, i) => (
              <motion.li key={i} variants={item}>
                <Card
                  className={
                    ponto.severity === "red"
                      ? "border-destructive/30 bg-destructive/5 hover:border-destructive/40"
                      : ponto.severity === "yellow"
                        ? "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/40"
                        : ponto.severity === "blue"
                          ? "border-blue-500/30 bg-blue-500/5 hover:border-blue-500/40 dark:border-blue-400/20 dark:bg-blue-400/5"
                          : "border-border hover:border-muted-foreground/30 transition-colors"
                  }
                >
                  <CardContent className="flex gap-3 pt-4">
                    <div
                      className={`shrink-0 flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        ponto.severity === "red"
                          ? "bg-destructive/20 text-destructive"
                          : ponto.severity === "yellow"
                            ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                            : ponto.severity === "blue"
                              ? "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                              : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm mb-0.5">{ponto.title}</p>
                      <p className="text-sm text-muted-foreground">{ponto.text}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.li>
            ))}
          </motion.ul>
        </motion.section>

        {/* 4. Resumo do Raio-X */}
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
