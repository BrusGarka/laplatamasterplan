import { Building2, FileText, Users, Layers } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { infoEmpresa } from "@/data/planejamento-config";

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function DefRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b py-2 last:border-b-0 sm:flex-row sm:justify-between sm:gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium sm:text-right">{value}</span>
    </div>
  );
}

export function InformacoesGerais() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4" /> Identificação
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <DefRow label="Nome fantasia" value={infoEmpresa.nomeFantasia} />
          <DefRow label="Razão social" value={infoEmpresa.razaoSocial} />
          <DefRow label="CNPJ" value={infoEmpresa.cnpj} />
          <DefRow label="Responsável financeiro" value={infoEmpresa.responsavelFinanceiro} />
          <DefRow label="Tipo de atribuição" value={infoEmpresa.tipoAtribuicao} />
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Capital social</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatBRL(infoEmpresa.capitalSocial)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sócios ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{infoEmpresa.sociosAtivos}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Funcionários</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{infoEmpresa.funcionariosCadastrados}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" /> Atividade principal
          </CardTitle>
          <CardDescription>CNAE usado na emissão das notas fiscais.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm font-medium">{infoEmpresa.atividadePrincipal}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Layers className="h-4 w-4" /> Atividades secundárias
          </CardTitle>
          <CardDescription>
            CNAEs marcados como "Fator R" passariam ao Anexo V se usados na emissão com a folha atual.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[110px]">CNAE</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Enquadramento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {infoEmpresa.atividadesSecundarias.map((a) => (
                <TableRow key={a.cnae}>
                  <TableCell className="font-mono text-xs">{a.cnae}</TableCell>
                  <TableCell className="text-sm">{a.descricao}</TableCell>
                  <TableCell className="text-right">
                    {a.dependeFatorR ? (
                      <Badge variant="destructive" className="text-xs">
                        Fator R
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Anexo III
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" /> Resumo do enquadramento
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Empresa optante pelo <strong className="text-foreground">Simples Nacional</strong>, tributada no{" "}
          <strong className="text-foreground">Anexo III</strong> via a atividade principal de fornecimento de
          dados (item 17.01), com sócio único recebendo pró-labore de 1 salário mínimo e o restante como
          distribuição de lucros.
        </CardContent>
      </Card>
    </div>
  );
}
