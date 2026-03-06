import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Landmark } from "lucide-react";

const IDADE_INICIAL = 30;
const ANO_INICIAL = 2024;
const IDADE_INSS = 65;
const ANO_BENEFICIO = ANO_INICIAL + (IDADE_INSS - IDADE_INICIAL);

export default function Aposentadoria() {
  return (
    <div className="min-h-screen gradient-mesh">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <header className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <Landmark className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Aposentadoria INSS</h1>
            <p className="text-sm text-muted-foreground">
              Expectativa de benefício pelo regime geral
            </p>
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Seu benefício estimado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 text-sm">
              <p>
                <span className="text-muted-foreground">Ano em que completa 65 anos (início do benefício):</span>{" "}
                <strong className="text-foreground">{ANO_BENEFICIO}</strong>
              </p>
              <p>
                <span className="text-muted-foreground">Valor:</span>{" "}
                <strong className="text-foreground">1 salário mínimo</strong>
                <span className="text-muted-foreground"> (estimativa em 2026: ~R$ 1.550–1.600)</span>
              </p>
            </div>

            <div className="border-t pt-4 text-sm text-muted-foreground space-y-2">
              <p className="font-medium text-foreground">Por que só 1 salário mínimo?</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Nenhuma aposentadoria do INSS pode ser menor que o salário mínimo vigente; com contribuição baixa, o valor é corrigido para o piso.</li>
                <li>Requisitos: 65 anos de idade e pelo menos 20 anos de contribuição. Sem os 20 anos ao completar 65, não há benefício até completar o tempo.</li>
                <li>No caso de sócio que recebe pró-labore de 1 salário mínimo e o restante como distribuição de lucros (que não gera contribuição ao INSS), a média de salários considerada pelo INSS fica em 1 salário mínimo, então o benefício calculado é o piso.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
