import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Briefcase, Target, Heart } from "lucide-react";

export default function Premissas() {
  return (
    <div className="min-h-screen gradient-mesh">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <User className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Premissas</h1>
            </div>
            <p className="text-sm text-muted-foreground ml-12">
              Conheça mais sobre minha trajetória e valores
            </p>
          </div>
        </motion.header>

        {/* Cards Sobre Mim */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Profissional</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Profissional dedicado ao planejamento financeiro estratégico, 
                buscando independência financeira através de investimentos 
                diversificados e disciplina.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-accent" />
                <CardTitle className="text-lg">Objetivos</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Meta de patrimônio de R$ 2 milhões até 2033, com foco em 
                crescimento sustentável e proteção do poder de compra através 
                de investimentos indexados à inflação.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-destructive" />
                <CardTitle className="text-lg">Valores</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Acredito em planejamento de longo prazo, diversificação de 
                ativos e educação financeira contínua como pilares para 
                construir riqueza de forma consistente.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
