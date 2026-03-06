import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePremissas } from "@/contexts/PremissasContext";
import { calcularRentabilidadeMediaPonderada } from "@/lib/investments-calculator";

export default function Parametros() {
  const { inflacao, rentabilidade, ptax, setInflacao, setRentabilidade, setPtax, taxaReal } = usePremissas();
  
  // Calcula rentabilidade média ponderada dos investimentos
  const rentabilidadeReal = calcularRentabilidadeMediaPonderada(inflacao, ptax);

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
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Parâmetros</h1>
            </div>
            <p className="text-sm text-muted-foreground ml-12">
              Configure os parâmetros financeiros do planejamento
            </p>
          </div>
        </motion.header>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Configurações Financeiras */}
          <Card>
            <CardHeader>
              <CardTitle>Parâmetros Financeiros</CardTitle>
              <CardDescription>
                Configure a inflação prevista e a rentabilidade esperada
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inflacao">Inflação Prevista (% a.a.)</Label>
                <Input
                  id="inflacao"
                  type="number"
                  step="0.1"
                  value={inflacao}
                  onChange={(e) => setInflacao(parseFloat(e.target.value) || 0)}
                  className="font-mono"
                />
                <div className="space-y-2 mt-2">
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant={inflacao === 5 ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer hover:bg-primary/10 transition-colors",
                        inflacao === 5 && "bg-primary text-primary-foreground"
                      )}
                      onClick={() => setInflacao(5)}
                    >
                      Conservador: 5%
                    </Badge>
                    <Badge
                      variant={inflacao === 4 ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer hover:bg-primary/10 transition-colors",
                        inflacao === 4 && "bg-primary text-primary-foreground"
                      )}
                      onClick={() => setInflacao(4)}
                    >
                      Base: 4%
                    </Badge>
                    <Badge
                      variant={inflacao === 3 ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer hover:bg-primary/10 transition-colors",
                        inflacao === 3 && "bg-primary text-primary-foreground"
                      )}
                      onClick={() => setInflacao(3)}
                    >
                      Otimista: 3%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    Otimista: regime de metas funcionando
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Taxa de inflação anual prevista (IPCA) • Clique nos badges para seleção rápida
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rentabilidade">Rentabilidade Prevista (% a.a.)</Label>
                <Input
                  id="rentabilidade"
                  type="number"
                  step="0.1"
                  value={rentabilidade}
                  onChange={(e) => setRentabilidade(parseFloat(e.target.value) || 0)}
                  className="font-mono"
                />
                <div className="mt-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "cursor-pointer hover:bg-primary/10 transition-colors border-primary/30 text-primary font-medium"
                    )}
                    onClick={() => setRentabilidade(rentabilidadeReal)}
                    title="Clique para usar a rentabilidade calculada baseada na sua carteira de investimentos"
                  >
                    💼 Rentabilidade Real: {rentabilidadeReal.toFixed(2)}%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Rentabilidade anual esperada dos investimentos • Clique no badge para usar a rentabilidade calculada da carteira
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ptax">PTAX (% a.a.)</Label>
                <Input
                  id="ptax"
                  type="number"
                  step="0.01"
                  value={ptax}
                  onChange={(e) => setPtax(parseFloat(e.target.value) || 0)}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Taxa PTAX anual utilizada para cálculos de investimentos atrelados a PTAX • Valor padrão: R$ 5,28%
                </p>
              </div>
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Taxa Real:</span>
                  <span className="font-mono font-semibold text-primary">
                    {taxaReal.toFixed(2)}% a.a.
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resumo dos Parâmetros */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo dos Parâmetros</CardTitle>
              <CardDescription>
                Visão geral dos parâmetros configurados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <span className="text-sm text-muted-foreground">Inflação</span>
                  <span className="font-mono font-semibold">{inflacao}% a.a.</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <span className="text-sm text-muted-foreground">Rentabilidade</span>
                  <span className="font-mono font-semibold text-primary">
                    {rentabilidade}% a.a.
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <span className="text-sm text-muted-foreground">PTAX</span>
                  <span className="font-mono font-semibold">
                    {ptax}% a.a.
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <span className="text-sm font-medium">Taxa Real</span>
                  <span className="font-mono font-bold text-primary">
                    {taxaReal.toFixed(2)}% a.a.
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
