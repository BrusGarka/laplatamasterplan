import { useMemo } from "react";
import {
  TrendingUp,
  Layers,
  Scale,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  Info,
  PiggyBank,
  FileSearch,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { tributosDocumentos } from "@/data/contaja-tributos-data";
import { notasFiscais } from "@/data/contaja-nf-data";
import {
  aliquotaEfetiva,
  cnaesFatorR,
  dasDoMes,
  faixaPorRBT12,
  fatorRMinimo,
  inssProLaboreMensal,
  presuncaoLucroServicos,
  salarioMinimo,
  tabelaAnexoIII,
  tabelaAnexoV,
} from "@/data/planejamento-config";

const RECEITA_PROJETADA = 27000;

function formatBRL(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatPct(fraction: number | null | undefined, casas = 2): string {
  if (fraction == null || Number.isNaN(fraction)) return "—";
  return `${(fraction * 100).toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  })}%`;
}

function competenciaKey(competencia: string): number {
  const [mm, yyyy] = competencia.split("/").map(Number);
  if (!mm || !yyyy) return 0;
  return yyyy * 100 + mm;
}

/** Índice absoluto de mês (ano*12 + mês-1) para iterar competências. */
function compToIndex(competencia: string): number {
  const [mm, yyyy] = competencia.split("/").map(Number);
  return yyyy * 12 + (mm - 1);
}

function indexToComp(index: number): string {
  const yyyy = Math.floor(index / 12);
  const mm = (index % 12) + 1;
  return `${String(mm).padStart(2, "0")}/${yyyy}`;
}

export function DiagnosticoTributario() {
  const dados = useMemo(() => {
    // Receita mensal a partir das NFs autorizadas (soma por competência).
    const receitaPorCompetencia = new Map<string, number>();
    for (const nf of notasFiscais) {
      if (nf.origem !== "contaja" || nf.statusSlug !== "authorized") continue;
      if (nf.valorNumero == null) continue;
      receitaPorCompetencia.set(
        nf.competencia,
        (receitaPorCompetencia.get(nf.competencia) ?? 0) + nf.valorNumero
      );
    }

    const competenciasOrdenadas = [...receitaPorCompetencia.entries()].sort(
      (a, b) => competenciaKey(b[0]) - competenciaKey(a[0])
    );

    const receitaAtual = competenciasOrdenadas[0]?.[1] ?? 0;

    // RBT12 = soma das 12 competências mais recentes com receita.
    const rbt12Atual = competenciasOrdenadas
      .slice(0, 12)
      .reduce((soma, [, receita]) => soma + receita, 0);

    // Último DAS calculado (fonte Contajá), ordenado por competência.
    const dasComCalculo = tributosDocumentos
      .filter((d) => d.metodoCalculo?.calculoId && d.metodoCalculo.itens?.[0])
      .sort((a, b) => competenciaKey(b.competencia) - competenciaKey(a.competencia));
    const ultimoDAS = dasComCalculo[0] ?? null;
    const aliquotaUltimoDAS =
      ultimoDAS?.metodoCalculo?.aliquotaEfetiva != null
        ? parseFloat(ultimoDAS.metodoCalculo.aliquotaEfetiva.replace(",", ".")) / 100
        : aliquotaEfetiva(rbt12Atual, tabelaAnexoIII);

    const faixaAtual = faixaPorRBT12(rbt12Atual, tabelaAnexoIII);

    // Liquidez atual (NF − DAS − INSS pró-labore).
    const dasAtual = ultimoDAS?.metodoCalculo?.impostoDevidoNumero ?? dasDoMes(receitaAtual, rbt12Atual, tabelaAnexoIII);
    const liquidoAtual = receitaAtual - dasAtual - inssProLaboreMensal;
    const cargaAtual = receitaAtual > 0 ? (dasAtual + inssProLaboreMensal) / receitaAtual : 0;

    // Projeção: receita sustentada a 27k/mês → RBT12 = 27k × 12.
    const rbt12Projetado = RECEITA_PROJETADA * 12;
    const faixaProjetada = faixaPorRBT12(rbt12Projetado, tabelaAnexoIII);
    const aliquotaProjetada = aliquotaEfetiva(rbt12Projetado, tabelaAnexoIII);
    const dasProjetado = RECEITA_PROJETADA * aliquotaProjetada;
    const liquidoProjetado = RECEITA_PROJETADA - dasProjetado - inssProLaboreMensal;

    // Distância até a 3ª faixa (RBT12 > 360.000 → média > 30k/mês).
    const limiteFaixa2 = tabelaAnexoIII[1].limite; // 360.000
    const mediaMensalParaProximaFaixa = limiteFaixa2 / 12;

    // Comparação Anexo III x Anexo V na faixa/receita atual.
    const efetivaIIIAtual = aliquotaEfetiva(rbt12Atual, tabelaAnexoIII);
    const efetivaVAtual = aliquotaEfetiva(rbt12Atual, tabelaAnexoV);
    const dasIIIAtual = receitaAtual * efetivaIIIAtual;
    const dasVAtual = receitaAtual * efetivaVAtual;

    // Fator R atual (massa salarial = pró-labore + INSS, 12 meses).
    const massaSalarial12m = (salarioMinimo + inssProLaboreMensal) * 12;
    const fatorR = rbt12Atual > 0 ? massaSalarial12m / rbt12Atual : 0;

    // Distribuição de lucros: teto isento conservador (presunção 32%).
    const lucroIsentoPresuncao = receitaAtual * presuncaoLucroServicos;
    const distribuicaoPotencial = liquidoAtual; // o que sobra após DAS + INSS

    // Série mensal (real + projeção) até 06/2027 para a tabela de evolução.
    const DISPLAY_INICIO = "01/2026";
    const DISPLAY_FIM = "06/2027";

    // Receita por competência: NFs reais (Contajá autorizadas) + projeções
    // (planejamento jul–dez/2026 e jan–jun/2027 sustentado a 27k).
    const receitaSerie = new Map<string, number>();
    for (const nf of notasFiscais) {
      if (nf.valorNumero == null) continue;
      if (nf.origem === "contaja" && nf.statusSlug === "authorized") {
        receitaSerie.set(nf.competencia, (receitaSerie.get(nf.competencia) ?? 0) + nf.valorNumero);
      } else if (nf.origem === "planejamento" && !receitaSerie.has(nf.competencia)) {
        receitaSerie.set(nf.competencia, nf.valorNumero);
      }
    }
    for (let i = compToIndex("01/2027"); i <= compToIndex(DISPLAY_FIM); i++) {
      const c = indexToComp(i);
      if (!receitaSerie.has(c)) receitaSerie.set(c, RECEITA_PROJETADA);
    }

    const dasRealSet = new Set(dasComCalculo.map((d) => d.competencia));
    const somaTrailing12 = (idx: number) => {
      let soma = 0;
      for (let j = idx - 12; j < idx; j++) soma += receitaSerie.get(indexToComp(j)) ?? 0;
      return soma;
    };

    const inicioIdx = compToIndex(DISPLAY_INICIO);
    const fimIdx = compToIndex(DISPLAY_FIM);
    const serieEvolucao = Array.from({ length: fimIdx - inicioIdx + 1 }, (_, k) => {
      const i = inicioIdx + k;
      const competencia = indexToComp(i);
      const receita = receitaSerie.get(competencia) ?? RECEITA_PROJETADA;
      const rbt12 = somaTrailing12(i);
      const efetiva = aliquotaEfetiva(rbt12, tabelaAnexoIII);
      const das = receita * efetiva;
      const darf = inssProLaboreMensal;
      const liquido = receita - das - darf;
      return {
        competencia,
        receita,
        aliquota: efetiva,
        das,
        darf,
        liquido,
        tipo: (dasRealSet.has(competencia) ? "real" : "proj") as "real" | "proj",
      };
    });

    return {
      receitaAtual,
      rbt12Atual,
      ultimoDASCompetencia: ultimoDAS?.competencia ?? null,
      aliquotaUltimoDAS,
      faixaAtual,
      dasAtual,
      liquidoAtual,
      cargaAtual,
      rbt12Projetado,
      faixaProjetada,
      aliquotaProjetada,
      dasProjetado,
      liquidoProjetado,
      mediaMensalParaProximaFaixa,
      efetivaIIIAtual,
      efetivaVAtual,
      dasIIIAtual,
      dasVAtual,
      fatorR,
      massaSalarial12m,
      lucroIsentoPresuncao,
      distribuicaoPotencial,
      serieEvolucao,
    };
  }, []);

  const cenariosProLabore = useMemo(() => {
    const valores = [salarioMinimo, 5000, 10000, dados.receitaAtual * fatorRMinimo];
    return valores.map((proLabore) => {
      const inss = proLabore * 0.11;
      // No Anexo III sem Fator R o DAS não muda com o pró-labore.
      const liquido = dados.receitaAtual - dados.dasAtual - inss;
      return {
        proLabore,
        inss,
        das: dados.dasAtual,
        liquido,
        ehAtual: Math.abs(proLabore - salarioMinimo) < 1,
      };
    });
  }, [dados]);

  const subiuParaProximaFaixa = dados.faixaProjetada.faixa > dados.faixaAtual.faixa;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Alíquota efetiva atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatPct(dados.aliquotaUltimoDAS)}</p>
            <p className="text-xs text-muted-foreground">
              DAS {dados.ultimoDASCompetencia ?? "—"} · Anexo III
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Faixa atual (RBT12)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{dados.faixaAtual.faixa}ª faixa</p>
            <p className="text-xs text-muted-foreground">RBT12 ≈ {formatBRL(dados.rbt12Atual)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Líquido mensal estimado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatBRL(dados.liquidoAtual)}</p>
            <p className="text-xs text-muted-foreground">
              NF {formatBRL(dados.receitaAtual)} − DAS − INSS
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Carga tributária
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatPct(dados.cargaAtual)}</p>
            <p className="text-xs text-muted-foreground">
              DAS + INSS sobre a receita
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Veredito */}
      <Alert>
        <CheckCircle2 className="h-4 w-4" />
        <AlertTitle>Diagnóstico geral: você já está no caminho mais barato</AlertTitle>
        <AlertDescription className="space-y-1">
          <p>
            Suas NFs são emitidas como <strong>fornecimento de dados (item 17.01 / CNAE 6399-2/00)</strong>,
            que a Contajá tributa no <strong>Anexo III sem depender do Fator R</strong>. Esse é o anexo mais
            barato para o seu caso — você paga cerca de {formatPct(dados.efetivaIIIAtual)} contra os{" "}
            {formatPct(dados.efetivaVAtual)} que pagaria no Anexo V na mesma faixa.
          </p>
          <p>
            O reajuste de R$ 22.872 → R$ 25.000 → R$ 27.000 <strong>não muda sua faixa</strong>: mesmo a 27k/mês
            sustentados, o RBT12 fica em {formatBRL(dados.rbt12Projetado)}, ainda na 2ª faixa.
          </p>
        </AlertDescription>
      </Alert>

      {/* Evolução da alíquota efetiva */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4" /> Evolução da alíquota efetiva
          </CardTitle>
          <CardDescription>
            Real até a última competência apurada; de 05/2026 a 06/2027 é projeção (jul–dez/2026 a R$ 27.000 já
            cadastrados e jan–jun/2027 mantidos a R$ 27.000). DARF = INSS/GPS do pró-labore (1 SM). Líquido = NF
            − DAS − DARF.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Competência</TableHead>
                  <TableHead className="text-right">Receita</TableHead>
                  <TableHead className="text-right">Alíq. efetiva</TableHead>
                  <TableHead className="text-right">DAS</TableHead>
                  <TableHead className="text-right">DARF (INSS/GPS)</TableHead>
                  <TableHead className="text-right">Líquido (após DAS+DARF)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dados.serieEvolucao.map((e) => (
                  <TableRow key={e.competencia} className={e.tipo === "proj" ? "bg-primary/5" : undefined}>
                    <TableCell className="whitespace-nowrap font-mono text-xs">
                      {e.competencia}
                      {e.tipo === "proj" ? (
                        <Badge variant="secondary" className="ml-2 text-[10px]">
                          proj.
                        </Badge>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">{formatBRL(e.receita)}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{formatPct(e.aliquota)}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{formatBRL(e.das)}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{formatBRL(e.darf)}</TableCell>
                    <TableCell className="text-right font-mono text-xs font-medium">
                      {formatBRL(e.liquido)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Faixas do Anexo III */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Layers className="h-4 w-4" /> Faixas do Anexo III
          </CardTitle>
          <CardDescription>
            O "pulo ruim" para a 3ª faixa (13,5% nominal) só ocorre com RBT12 acima de{" "}
            {formatBRL(tabelaAnexoIII[1].limite)} — média acima de{" "}
            {formatBRL(dados.mediaMensalParaProximaFaixa)}/mês.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Faixa</TableHead>
                <TableHead className="text-right">Limite RBT12</TableHead>
                <TableHead className="text-right">Alíq. nominal</TableHead>
                <TableHead className="text-right">Dedução</TableHead>
                <TableHead className="text-center">Situação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tabelaAnexoIII.slice(0, 3).map((f) => (
                <TableRow
                  key={f.faixa}
                  className={f.faixa === dados.faixaAtual.faixa ? "bg-primary/5" : undefined}
                >
                  <TableCell className="font-mono text-xs">{f.faixa}ª</TableCell>
                  <TableCell className="text-right font-mono text-xs">{formatBRL(f.limite)}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{formatPct(f.aliquotaNominal)}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{formatBRL(f.deducao)}</TableCell>
                  <TableCell className="text-center">
                    {f.faixa === dados.faixaAtual.faixa ? (
                      <Badge>Você está aqui</Badge>
                    ) : f.faixa === dados.faixaAtual.faixa + 1 ? (
                      <Badge variant="secondary">Próxima</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {subiuParaProximaFaixa ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Atenção: a projeção muda de faixa</AlertTitle>
              <AlertDescription>
                Com a receita projetada, o RBT12 ({formatBRL(dados.rbt12Projetado)}) entra na{" "}
                {dados.faixaProjetada.faixa}ª faixa.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>27k/mês é seguro</AlertTitle>
              <AlertDescription>
                Mesmo a R$ 27.000/mês sustentados, o RBT12 fica em {formatBRL(dados.rbt12Projetado)} e você
                permanece na 2ª faixa. Só comece a se preocupar se a média mensal passar de{" "}
                {formatBRL(dados.mediaMensalParaProximaFaixa)}.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Fator R / Anexo III vs V */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Scale className="h-4 w-4" /> Fator R e o risco do Anexo V
          </CardTitle>
          <CardDescription>
            Seu Fator R atual é ≈ {formatPct(dados.fatorR)} (folha de {formatBRL(dados.massaSalarial12m)}/ano
            sobre RBT12 de {formatBRL(dados.rbt12Atual)}) — bem abaixo dos {formatPct(fatorRMinimo, 0)}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Anexo III (atual)</p>
              <p className="text-xl font-bold">{formatPct(dados.efetivaIIIAtual)}</p>
              <p className="text-xs text-muted-foreground">
                DAS ≈ {formatBRL(dados.dasIIIAtual)}/mês sobre {formatBRL(dados.receitaAtual)}
              </p>
            </div>
            <div className="rounded-lg border border-destructive/40 p-3">
              <p className="text-xs text-muted-foreground">Anexo V (se cair no Fator R)</p>
              <p className="text-xl font-bold text-destructive">{formatPct(dados.efetivaVAtual)}</p>
              <p className="text-xs text-muted-foreground">
                DAS ≈ {formatBRL(dados.dasVAtual)}/mês (+{formatBRL(dados.dasVAtual - dados.dasIIIAtual)})
              </p>
            </div>
          </div>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Cuidado ao trocar o CNAE de emissão</AlertTitle>
            <AlertDescription className="space-y-1">
              <p>
                Como sua folha é baixa (Fator R ≈ {formatPct(dados.fatorR)}), se você passar a emitir como{" "}
                <strong>desenvolvimento de software</strong> e similares, a atividade passa a depender do Fator R
                e, sem 28% de folha, cairia no <strong>Anexo V</strong> — quase dobrando o imposto.
              </p>
              <p className="font-medium">
                Recomendação: continue emitindo no CNAE 6399-2/00 (item 17.01). CNAEs que disparariam o Fator R:
              </p>
              <ul className="list-inside list-disc text-xs">
                {cnaesFatorR.map((c) => (
                  <li key={c.cnae}>
                    {c.cnae} — {c.descricao}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Adequação do CNAE × substância */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileSearch className="h-4 w-4" /> Adequação do CNAE: o enquadramento condiz com o que você entrega?
          </CardTitle>
          <CardDescription>
            Não existe CNAE "mais barato" que o seu — você já está no piso (Anexo III). A pergunta certa não é
            economia, e sim se o CNAE/serviço emitido corresponde à substância do que a Maia entrega à MOB2CON.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-primary/30 p-3">
              <p className="text-sm font-medium">Se for genuinamente serviço de informação/dados</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Análise, compilação e fornecimento de dados/insights. O enquadramento atual (CNAE 6399-2/00 +
                item 17.01) é <strong>adequado e ótimo</strong>: Anexo III sem Fator R. Mantenha.
              </p>
            </div>
            <div className="rounded-lg border border-destructive/40 p-3">
              <p className="text-sm font-medium">Se na prática for desenvolvimento de software</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Você codifica/entrega sistema. Há <strong>risco de reclassificação</strong> (Fisco/ISS) para o
                item 1.x (informática), que depende do Fator R e, com sua folha, cairia no Anexo V. Aí o 17.01
                deixa de ser só economia e vira exposição.
              </p>
            </div>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>O que define a adequação é a substância (não o nome do CNAE)</AlertTitle>
            <AlertDescription className="space-y-1">
              <p>
                A descrição que já aparece na sua NF — "Análise, exame, pesquisa, coleta, compilação e
                fornecimento de dados e informações" — foi pensada para sustentar o item 17.01. O importante é
                que <strong>contrato + descrição da NF + CNAE</strong> contem a mesma história.
              </p>
              <p className="font-medium">
                Pergunte diretamente à Contajá: "o que entregamos à MOB2CON é defensável como item 17.01
                (fornecimento de dados) ou seria item 1.x (desenvolvimento de software)?"
              </p>
            </AlertDescription>
          </Alert>

          <div className="rounded-lg border p-3 text-xs text-muted-foreground">
            <p className="mb-1 font-medium text-foreground">Conclusão</p>
            Não troque de CNAE por trocar — qualquer alternativa "mais técnica" (desenvolvimento/consultoria de
            TI) te levaria ao Fator R/Anexo V e <strong>pagaria mais</strong>. O caminho seguro é alinhar a
            substância do contrato com a descrição de "serviço de informação" e confirmar a defensabilidade com a
            Contajá.
          </div>
        </CardContent>
      </Card>

      {/* Pró-labore ideal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="h-4 w-4" /> Pró-labore: vale a pena aumentar?
          </CardTitle>
          <CardDescription>
            No Anexo III sem Fator R, aumentar o pró-labore não reduz o DAS — só adiciona 11% de INSS (e IRRF),
            reduzindo o líquido no seu bolso.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pró-labore</TableHead>
                <TableHead className="text-right">INSS (11%)</TableHead>
                <TableHead className="text-right">DAS</TableHead>
                <TableHead className="text-right">Líquido (NF − DAS − INSS)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cenariosProLabore.map((c) => (
                <TableRow key={c.proLabore} className={c.ehAtual ? "bg-primary/5" : undefined}>
                  <TableCell className="font-mono text-xs">
                    {formatBRL(c.proLabore)}
                    {c.ehAtual ? <Badge className="ml-2">atual (1 SM)</Badge> : null}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">{formatBRL(c.inss)}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{formatBRL(c.das)}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{formatBRL(c.liquido)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="text-xs text-muted-foreground">
            Obs.: o pró-labore em si não é "perdido" (é renda sua), mas a parcela acima de 1 salário mínimo só
            adiciona INSS e IRRF sem reduzir o DAS. Faz sentido manter em 1 SM, a menos que você queira aumentar
            a contribuição ao INSS para fins de aposentadoria.
          </p>
        </CardContent>
      </Card>

      {/* Distribuição de lucros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <PiggyBank className="h-4 w-4" /> Distribuição de lucros isenta
          </CardTitle>
          <CardDescription>
            Você distribui ~{formatBRL(dados.distribuicaoPotencial)}/mês (o que sobra após DAS + INSS). É preciso
            garantir que isso esteja respaldado para sair 100% isento de IR.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Teto isento por presunção (32%)</p>
              <p className="text-xl font-bold">{formatBRL(dados.lucroIsentoPresuncao)}/mês</p>
              <p className="text-xs text-muted-foreground">Sem escrituração contábil completa</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Com escrituração contábil completa</p>
              <p className="text-xl font-bold">{formatBRL(dados.distribuicaoPotencial)}/mês</p>
              <p className="text-xs text-muted-foreground">
                Pode distribuir todo o lucro contábil isento
              </p>
            </div>
          </div>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Esta é a sua maior oportunidade de segurança fiscal</AlertTitle>
            <AlertDescription>
              Pela regra conservadora (sem escrituração contábil), o lucro isento se limita a 32% da receita ≈{" "}
              {formatBRL(dados.lucroIsentoPresuncao)}/mês. Como você retira bem mais que isso, a forma segura de
              distribuir tudo isento é manter <strong>escrituração contábil completa</strong> (balanço/DRE), que
              comprova o lucro real. Confirme com a Contajá se a sua escrituração já é completa.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Recomendações */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recomendações priorizadas</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm">
            <li className="flex gap-2">
              <Badge variant="destructive" className="shrink-0">1</Badge>
              <span>
                <strong>Mantenha o CNAE de emissão 6399-2/00 (item 17.01).</strong> É o que garante o Anexo III
                sem Fator R. Emitir como desenvolvimento de software jogaria você no Anexo V (~
                {formatPct(dados.efetivaVAtual)} vs {formatPct(dados.efetivaIIIAtual)}).
              </span>
            </li>
            <li className="flex gap-2">
              <Badge className="shrink-0">2</Badge>
              <span>
                <strong>Valide a substância do CNAE com a Contajá.</strong> Confirme se o que a Maia entrega à
                MOB2CON é defensável como item 17.01 (fornecimento de dados) e não como desenvolvimento de
                software (item 1.x). Alinhe contrato, descrição da NF e CNAE na mesma narrativa — não troque de
                CNAE só por parecer “mais técnico”.
              </span>
            </li>
            <li className="flex gap-2">
              <Badge className="shrink-0">3</Badge>
              <span>
                <strong>Confirme escrituração contábil completa com a Contajá.</strong> É o que respalda
                distribuir 100% do lucro isento de IR (hoje a presunção limitaria a ~
                {formatBRL(dados.lucroIsentoPresuncao)}/mês).
              </span>
            </li>
            <li className="flex gap-2">
              <Badge variant="secondary" className="shrink-0">4</Badge>
              <span>
                <strong>Mantenha o pró-labore em 1 salário mínimo.</strong> Aumentar não reduz o DAS e só corta
                seu líquido via INSS/IRRF.
              </span>
            </li>
            <li className="flex gap-2">
              <Badge variant="secondary" className="shrink-0">5</Badge>
              <span>
                <strong>Monitore a média mensal.</strong> Até ~{formatBRL(dados.mediaMensalParaProximaFaixa)}/mês
                você fica na 2ª faixa. Acima disso, o RBT12 ultrapassa {formatBRL(tabelaAnexoIII[1].limite)} e a
                3ª faixa (13,5% nominal) encarece o DAS.
              </span>
            </li>
          </ol>
        </CardContent>
      </Card>

      <Separator />
      <p className="text-xs text-muted-foreground">
        Esta análise é uma referência de apoio à decisão com base nos dados coletados da Contajá e em premissas
        do Simples Nacional (Anexo III/V, Fator R 28%, presunção de 32%). Não substitui a orientação do contador
        responsável. Valide enquadramentos e a escrituração com a Contajá antes de qualquer mudança.
      </p>
    </div>
  );
}
