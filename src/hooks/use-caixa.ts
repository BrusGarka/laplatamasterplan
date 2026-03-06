import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getLancamentosMes,
  saveLancamentosMes,
  getResumoMes,
  saveResumoMes,
  getContasFixas,
  saveContasFixas,
  listMesesComDados,
  clearMesInteiro,
} from "@/services/caixa-service";
import type { Lancamento, ResumoMes } from "@/types/caixa";

const CAIXA_KEYS = {
  lancamentos: (anoMes: string) => ["caixa", "lancamentos", anoMes] as const,
  resumo: (anoMes: string) => ["caixa", "resumo", anoMes] as const,
  contasFixas: () => ["caixa", "contas-fixas"] as const,
  mesesComDados: () => ["caixa", "meses-com-dados"] as const,
};

export function useLancamentos(anoMes: string) {
  return useQuery({
    queryKey: CAIXA_KEYS.lancamentos(anoMes),
    queryFn: () => getLancamentosMes(anoMes),
    enabled: !!anoMes,
  });
}

export function useSaveLancamentos(anoMes: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (lancamentos: Lancamento[]) =>
      saveLancamentosMes(anoMes, lancamentos),
    onMutate: async (newLancamentos) => {
      await queryClient.cancelQueries({ queryKey: CAIXA_KEYS.lancamentos(anoMes) });
      const previous = queryClient.getQueryData<Lancamento[]>(CAIXA_KEYS.lancamentos(anoMes));
      queryClient.setQueryData(CAIXA_KEYS.lancamentos(anoMes), newLancamentos);
      return { previous };
    },
    onError: (err, _newLancamentos, context) => {
      if (context?.previous != null) {
        queryClient.setQueryData(CAIXA_KEYS.lancamentos(anoMes), context.previous);
      }
      toast.error("Erro ao salvar", {
        description: err instanceof Error ? err.message : "Não foi possível salvar no Redis.",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CAIXA_KEYS.lancamentos(anoMes) });
      queryClient.invalidateQueries({ queryKey: CAIXA_KEYS.mesesComDados() });
    },
  });
}

export function useResumo(anoMes: string) {
  return useQuery({
    queryKey: CAIXA_KEYS.resumo(anoMes),
    queryFn: () => getResumoMes(anoMes),
    enabled: !!anoMes,
  });
}

export function useSaveResumo(anoMes: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (resumo: ResumoMes) => saveResumoMes(anoMes, resumo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CAIXA_KEYS.resumo(anoMes) });
    },
  });
}

export function useContasFixas() {
  return useQuery({
    queryKey: CAIXA_KEYS.contasFixas(),
    queryFn: getContasFixas,
  });
}

export function useSaveContasFixas() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (contas: Lancamento[]) => saveContasFixas(contas),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CAIXA_KEYS.contasFixas() });
    },
  });
}

export function useMesesComDados() {
  return useQuery({
    queryKey: CAIXA_KEYS.mesesComDados(),
    queryFn: listMesesComDados,
  });
}

export function useClearMesInteiro(anoMes: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => clearMesInteiro(anoMes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CAIXA_KEYS.lancamentos(anoMes) });
      queryClient.invalidateQueries({ queryKey: CAIXA_KEYS.resumo(anoMes) });
      queryClient.invalidateQueries({ queryKey: CAIXA_KEYS.mesesComDados() });
      toast.success("Mês limpo", {
        description: "Todos os lançamentos e o resumo do mês foram removidos.",
      });
    },
    onError: (err) => {
      toast.error("Erro ao limpar", {
        description: err instanceof Error ? err.message : "Não foi possível limpar o mês.",
      });
    },
  });
}
