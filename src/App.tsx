import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { DataProvider } from "@/contexts/DataContext";
import AppHeader from "@/components/anesia/AppHeader";
import Index from "./pages/Index";
import ProcedurePage from "./pages/ProcedurePage";
import AdminContent from "./pages/AdminContent";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <LanguageProvider>
        <DataProvider>
          <BrowserRouter>
            <AppHeader />
            <main>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/p/:id" element={<ProcedurePage />} />
                <Route path="/admin-content" element={<AdminContent />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </BrowserRouter>
        </DataProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
