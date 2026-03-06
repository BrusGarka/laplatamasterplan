import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface PremissasContextType {
  inflacao: number;
  rentabilidade: number;
  ptax: number;
  setInflacao: (value: number) => void;
  setRentabilidade: (value: number) => void;
  setPtax: (value: number) => void;
  taxaReal: number;
}

const PremissasContext = createContext<PremissasContextType | undefined>(undefined);

const STORAGE_KEY_INFLACAO = "laplata-premissas-inflacao";
const STORAGE_KEY_RENTABILIDADE = "laplata-premissas-rentabilidade";
const STORAGE_KEY_PTAX = "laplata-premissas-ptax";

// Valores padrão
const DEFAULT_INFLACAO = 4.5;
const DEFAULT_RENTABILIDADE = 10.77;
const DEFAULT_PTAX = 5.28;

export function PremissasProvider({ children }: { children: ReactNode }) {
  // Carrega valores do localStorage na inicialização
  const [inflacao, setInflacaoState] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY_INFLACAO);
      return stored ? parseFloat(stored) : DEFAULT_INFLACAO;
    }
    return DEFAULT_INFLACAO;
  });

  const [rentabilidade, setRentabilidadeState] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY_RENTABILIDADE);
      return stored ? parseFloat(stored) : DEFAULT_RENTABILIDADE;
    }
    return DEFAULT_RENTABILIDADE;
  });

  const [ptax, setPtaxState] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY_PTAX);
      return stored ? parseFloat(stored) : DEFAULT_PTAX;
    }
    return DEFAULT_PTAX;
  });

  // Funções que salvam no localStorage ao atualizar
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

  const taxaReal = rentabilidade - inflacao;

  return (
    <PremissasContext.Provider
      value={{
        inflacao,
        rentabilidade,
        ptax,
        setInflacao,
        setRentabilidade,
        setPtax,
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
