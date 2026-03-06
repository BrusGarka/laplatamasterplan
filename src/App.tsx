import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PremissasProvider } from "@/contexts/PremissasContext";
import { Layout } from "@/components/Layout";
import Dashboard from "./pages/Dashboard";
import Parametros from "./pages/Parametros";
import Premissas from "./pages/Premissas";
import MasterPlan from "./pages/MasterPlan";
import Investimentos from "./pages/Investimentos";
import Patrimonio from "./pages/Patrimonio";
import Dividas from "./pages/Dividas";
import Orcamento from "./pages/Orcamento";
import ReservaEmergencia from "./pages/ReservaEmergencia";
import MetasFinanceiras from "./pages/MetasFinanceiras";
import FluxoCaixa from "./pages/FluxoCaixa";
import Aposentadoria from "./pages/Aposentadoria";
import RendaPassiva from "./pages/RendaPassiva";
import Impostos from "./pages/Impostos";
import Seguros from "./pages/Seguros";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <PremissasProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/master-plan" element={<MasterPlan />} />
              <Route path="/parametros" element={<Parametros />} />
              <Route path="/premissas" element={<Premissas />} />
              <Route path="/investimentos" element={<Investimentos />} />
              <Route path="/patrimonio" element={<Patrimonio />} />
              <Route path="/dividas" element={<Dividas />} />
              <Route path="/orcamento" element={<Orcamento />} />
              <Route path="/reserva-emergencia" element={<ReservaEmergencia />} />
              <Route path="/metas-financeiras" element={<MetasFinanceiras />} />
              <Route path="/fluxo-caixa" element={<FluxoCaixa />} />
              <Route path="/aposentadoria" element={<Aposentadoria />} />
              <Route path="/renda-passiva" element={<RendaPassiva />} />
              <Route path="/impostos" element={<Impostos />} />
              <Route path="/seguros" element={<Seguros />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </PremissasProvider>
  </QueryClientProvider>
);

export default App;
