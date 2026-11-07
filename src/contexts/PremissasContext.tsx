import { createContext, useContext, useState, ReactNode } from "react";
import {
  ANO_PROJECAO_FIM,
  ANO_PROJECAO_INICIO,
  serieInflacaoPadrao,
} from "@/lib/financial-engine";

interface PremissasContextType {
  inflacao: number;
  rentabilidade: number;
  ptax: number;
  inflacaoPorAno: Record<number, number>;
  setInflacao: (value: number) => void;
  setRentabilidade: (value: number) => void;
  setPtax: (value: number) => void;
  setInflacaoAno: (ano: number, valor: number) => void;
  restaurarInflacaoAnos: () => void;
  taxaReal: number;
}

const PremissasContext = createContext<PremissasContextType | undefined>(undefined);

const STORAGE_KEY_INFLACAO = "laplata-premissas-inflacao";
const STORAGE_KEY_RENTABILIDADE = "laplata-premissas-rentabilidade";
const STORAGE_KEY_PTAX = "laplata-premissas-ptax";
const STORAGE_KEY_INFLACAO_ANOS = "laplata-premissas-inflacao-anos";

const DEFAULT_INFLACAO = 4.5;
const DEFAULT_RENTABILIDADE = 10.77;
const DEFAULT_PTAX = 5.28;

function lerNumero(chave: string, padrao: number): number {
  if (typeof window === "undefined") return padrao;
  const stored = localStorage.getItem(chave);
  if (!stored) return padrao;
  const valor = parseFloat(stored);
  return Number.isFinite(valor) ? valor : padrao;
}

function parseInflacaoAnos(raw: string | null): Record<number, number> | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Record<string, unknown>;
    const serie: Record<number, number> = {};
    for (const [chave, valor] of Object.entries(data)) {
      const ano = Number(chave);
      const taxa = typeof valor === "number" ? valor : Number(valor);
      if (
        Number.isInteger(ano) &&
        ano >= ANO_PROJECAO_INICIO &&
        ano <= ANO_PROJECAO_FIM &&
        Number.isFinite(taxa)
      ) {
        serie[ano] = taxa;
      }
    }
    return Object.keys(serie).length > 0 ? serie : null;
  } catch {
    return null;
  }
}

function completarInflacaoAnos(
  salva: Record<number, number> | null,
  inflacaoPrevista: number
): Record<number, number> {
  const serie = serieInflacaoPadrao(inflacaoPrevista);
  if (!salva) return serie;
  for (let ano = ANO_PROJECAO_INICIO; ano <= ANO_PROJECAO_FIM; ano++) {
    const valor = salva[ano];
    if (typeof valor === "number" && Number.isFinite(valor)) {
      serie[ano] = valor;
    }
  }
  return serie;
}

function salvarInflacaoAnos(serie: Record<number, number>) {
  if (typeof window === "undefined") return;
  const payload: Record<string, number> = {};
  for (let ano = ANO_PROJECAO_INICIO; ano <= ANO_PROJECAO_FIM; ano++) {
    payload[String(ano)] = serie[ano];
  }
  localStorage.setItem(STORAGE_KEY_INFLACAO_ANOS, JSON.stringify(payload));
}

function carregarInflacaoAnos(inflacaoPrevista: number): Record<number, number> {
  if (typeof window === "undefined") return serieInflacaoPadrao(inflacaoPrevista);
  const salva = parseInflacaoAnos(localStorage.getItem(STORAGE_KEY_INFLACAO_ANOS));
  const serie = completarInflacaoAnos(salva, inflacaoPrevista);
  if (!salva) salvarInflacaoAnos(serie);
  return serie;
}

export function PremissasProvider({ children }: { children: ReactNode }) {
  const [inflacao, setInflacaoState] = useState<number>(() =>
    lerNumero(STORAGE_KEY_INFLACAO, DEFAULT_INFLACAO)
  );

  const [rentabilidade, setRentabilidadeState] = useState<number>(() =>
    lerNumero(STORAGE_KEY_RENTABILIDADE, DEFAULT_RENTABILIDADE)
  );

  const [ptax, setPtaxState] = useState<number>(() => lerNumero(STORAGE_KEY_PTAX, DEFAULT_PTAX));

  const [inflacaoPorAno, setInflacaoPorAno] = useState<Record<number, number>>(() =>
    carregarInflacaoAnos(lerNumero(STORAGE_KEY_INFLACAO, DEFAULT_INFLACAO))
  );

  const setInflacao = (value: number) => {
    setInflacaoState(value);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_INFLACAO, value.toString());
    }
  };

  const setRentabilidade = (value: number) => {
    setRentabilidadeState(value);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_RENTABILIDADE, value.toString());
    }
  };

  const setPtax = (value: number) => {
    setPtaxState(value);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_PTAX, value.toString());
    }
  };

  const setInflacaoAno = (ano: number, valor: number) => {
    if (!Number.isInteger(ano) || ano < ANO_PROJECAO_INICIO || ano > ANO_PROJECAO_FIM) return;
    if (!Number.isFinite(valor)) return;
    setInflacaoPorAno((atual) => {
      const proxima = { ...atual, [ano]: valor };
      salvarInflacaoAnos(proxima);
      return proxima;
    });
  };

  const restaurarInflacaoAnos = () => {
    const serie = serieInflacaoPadrao(inflacao);
    salvarInflacaoAnos(serie);
    setInflacaoPorAno(serie);
  };

  const taxaReal = rentabilidade - inflacao;

  return (
    <PremissasContext.Provider
      value={{
        inflacao,
        rentabilidade,
        ptax,
        inflacaoPorAno,
        setInflacao,
        setRentabilidade,
        setPtax,
        setInflacaoAno,
        restaurarInflacaoAnos,
        taxaReal,
      }}
    >
      {children}
    </PremissasContext.Provider>
  );
}

export function usePremissas() {
  const context = useContext(PremissasContext);
  if (context === undefined) {
    throw new Error("usePremissas deve ser usado dentro de um PremissasProvider");
  }
  return context;
}
