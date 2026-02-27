import { lazy, Suspense } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { DataProvider } from '@/contexts/DataContext';
import DisclaimerBanner from '@/components/anesia/DisclaimerBanner';
import AppLayout from '@/components/anesia/AppLayout';
import { Skeleton } from '@/components/ui/skeleton';

// Home page loaded eagerly — visible immediately
import Index from './pages/Index';

// All other pages loaded on demand
const ProcedurePage = lazy(() => import('./pages/ProcedurePage'));
const Guidelines = lazy(() => import('./pages/Guidelines'));
const ALR = lazy(() => import('./pages/ALR'));
const Calculateurs = lazy(() => import('./pages/Calculateurs'));
const Protocoles = lazy(() => import('./pages/Protocoles'));
const PreAnest = lazy(() => import('./pages/PreAnest'));
const Account = lazy(() => import('./pages/Account'));
const Auth = lazy(() => import('./pages/Auth'));
const AdminGuard = lazy(() => import('./components/admin/AdminGuard'));
const AdminLayout = lazy(() => import('./pages/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminContent = lazy(() => import('./pages/AdminContent'));
const AdminImportProcedures = lazy(() => import('./pages/AdminImportProcedures'));
const AdminImportGuidelines = lazy(() => import('./pages/AdminImportGuidelines'));
const AdminLogs = lazy(() => import('./pages/AdminLogs'));
const AdminQuality = lazy(() => import('./pages/AdminQuality'));
const NotFound = lazy(() => import('./pages/NotFound'));

const queryClient = new QueryClient();

function RouteFallback() {
  return (
    <div className="container max-w-2xl space-y-4 py-6">
      <Skeleton className="h-10 w-1/3" />
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}

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
                <Suspense fallback={<RouteFallback />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/guidelines" element={<Guidelines />} />
                    <Route path="/alr" element={<ALR />} />
                    <Route path="/calculateurs" element={<Calculateurs />} />
                    <Route path="/protocoles" element={<Protocoles />} />
                    <Route path="/preanest" element={<PreAnest />} />
                    <Route path="/p/:id" element={<ProcedurePage />} />
                    <Route path="/account" element={<Account />} />
                    <Route path="/admin-content" element={<AdminContent />} />
                    <Route path="/admin/quality" element={<AdminQuality />} />
                    <Route path="/admin" element={<AdminGuard />}>
                      <Route element={<AdminLayout />}>
                        <Route index element={<AdminDashboard />} />
                        <Route
                          path="import/procedures"
                          element={<AdminImportProcedures />}
                        />
                        <Route
                          path="import/guidelines"
                          element={<AdminImportGuidelines />}
                        />
                        <Route path="logs" element={<AdminLogs />} />
                      </Route>
                    </Route>
                    <Route
                      path="/admin/import-procedures"
                      element={<Navigate to="/admin/import/procedures" replace />}
                    />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </AppLayout>
            </BrowserRouter>
          </TooltipProvider>
        </DataProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
