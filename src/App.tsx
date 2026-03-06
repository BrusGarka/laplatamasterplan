import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PremissasProvider } from "@/contexts/PremissasContext";
import { Layout } from "@/components/Layout";
import Parametros from "./pages/Parametros";
import Premissas from "./pages/Premissas";
import MasterPlan from "./pages/MasterPlan";
import Investimentos from "./pages/Investimentos";
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
              <Route path="/" element={<MasterPlan />} />
              <Route path="/master-plan" element={<MasterPlan />} />
              <Route path="/parametros" element={<Parametros />} />
              <Route path="/premissas" element={<Premissas />} />
              <Route path="/investimentos" element={<Investimentos />} />
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
