import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { DataProvider } from "@/contexts/DataContext";
import DisclaimerBanner from "@/components/anesia/DisclaimerBanner";
import AppLayout from "@/components/anesia/AppLayout";
import Index from "./pages/Index";
import ProcedurePage from "./pages/ProcedurePage";
import AdminContent from "./pages/AdminContent";
import Guidelines from "./pages/Guidelines";
import ALR from "./pages/ALR";
import Calculateurs from "./pages/Calculateurs";
import Protocoles from "./pages/Protocoles";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <DataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <DisclaimerBanner />
            <AppLayout>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/guidelines" element={<Guidelines />} />
                <Route path="/alr" element={<ALR />} />
                <Route path="/calculateurs" element={<Calculateurs />} />
                <Route path="/protocoles" element={<Protocoles />} />
                <Route path="/p/:id" element={<ProcedurePage />} />
                <Route path="/admin-content" element={<AdminContent />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppLayout>
          </BrowserRouter>
        </TooltipProvider>
      </DataProvider>
    </LanguageProvider>
  </QueryClientProvider>
  );
};

export default App;
