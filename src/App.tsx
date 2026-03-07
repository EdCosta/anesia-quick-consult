import { lazy, Suspense } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AIProcedureProvider } from '@/contexts/AIProcedureContext';
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
const AntibioprophylaxieTable = lazy(() => import('./pages/AntibioprophylaxieTable'));
const PreAnest = lazy(() => import('./pages/PreAnest'));
const Account = lazy(() => import('./pages/Account'));
const AccountSettings = lazy(() => import('./pages/AccountSettings'));
const AccountPersonalization = lazy(() => import('./pages/AccountPersonalization'));
const ProCheckout = lazy(() => import('./pages/ProCheckout'));
const ProSuccess = lazy(() => import('./pages/ProSuccess'));
const Auth = lazy(() => import('./pages/Auth'));
const Pricing = lazy(() => import('./pages/Pricing'));
const FAQ = lazy(() => import('./pages/FAQ'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const AdminGuard = lazy(() => import('./components/admin/AdminGuard'));
const AdminLayout = lazy(() => import('./pages/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminConversion = lazy(() => import('./pages/AdminConversion'));
const AdminSearchOverrides = lazy(() => import('./pages/AdminSearchOverrides'));
const AdminContent = lazy(() => import('./pages/AdminContent'));
const AdminImportProcedures = lazy(() => import('./pages/AdminImportProcedures'));
const AdminImportGuidelines = lazy(() => import('./pages/AdminImportGuidelines'));
const AdminLogs = lazy(() => import('./pages/AdminLogs'));
const AdminQuality = lazy(() => import('./pages/AdminQuality'));
const AdminBilling = lazy(() => import('./pages/AdminBilling'));
const NotFound = lazy(() => import('./pages/NotFound'));
const PublicProcedurePage = lazy(() => import('./pages/PublicProcedurePage'));
const PublicSpecialtyPage = lazy(() => import('./pages/PublicSpecialtyPage'));
const PublicSpecialtiesIndexPage = lazy(() => import('./pages/PublicSpecialtiesIndexPage'));
const PublicTopicsIndexPage = lazy(() => import('./pages/PublicTopicsIndexPage'));
const PublicTopicPage = lazy(() => import('./pages/PublicTopicPage'));
const PublicGuidelinePage = lazy(() => import('./pages/PublicGuidelinePage'));
const PublicProtocolPage = lazy(() => import('./pages/PublicProtocolPage'));
const PublicALRPage = lazy(() => import('./pages/PublicALRPage'));

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
            <AIProcedureProvider>
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
                      <Route
                        path="/guidelines/antibioprophylaxie"
                        element={<AntibioprophylaxieTable />}
                      />
                      <Route path="/preanest" element={<PreAnest />} />
                      <Route path="/p/:id" element={<ProcedurePage />} />
                      <Route path="/specialties" element={<PublicSpecialtiesIndexPage />} />
                      <Route path="/topics" element={<PublicTopicsIndexPage />} />
                      <Route path="/topics/:slug" element={<PublicTopicPage />} />
                      <Route path="/recommendations/:id" element={<PublicGuidelinePage />} />
                      <Route path="/recommendations/:id/:slug" element={<PublicGuidelinePage />} />
                      <Route path="/protocols/:id" element={<PublicProtocolPage />} />
                      <Route path="/protocols/:id/:slug" element={<PublicProtocolPage />} />
                      <Route path="/regional-blocks/:id" element={<PublicALRPage />} />
                      <Route path="/regional-blocks/:id/:slug" element={<PublicALRPage />} />
                      <Route path="/procedures/:id" element={<PublicProcedurePage />} />
                      <Route path="/procedures/:id/:slug" element={<PublicProcedurePage />} />
                      <Route path="/specialties/:slug" element={<PublicSpecialtyPage />} />
                      <Route path="/account" element={<Account />} />
                      <Route path="/pricing" element={<Pricing />} />
                      <Route path="/faq" element={<FAQ />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/privacy" element={<Privacy />} />
                      <Route path="/terms" element={<Terms />} />
                      <Route path="/account/settings" element={<AccountSettings />} />
                      <Route
                        path="/account/settings/personalization"
                        element={<AccountPersonalization />}
                      />
                      <Route path="/pro/checkout" element={<ProCheckout />} />
                      <Route path="/pro/success" element={<ProSuccess />} />
                      <Route element={<AdminGuard />}>
                        <Route path="/admin-content" element={<AdminContent />} />
                        <Route path="/admin/quality" element={<AdminQuality />} />
                        <Route path="/admin" element={<AdminLayout />}>
                          <Route index element={<AdminDashboard />} />
                          <Route path="conversion" element={<AdminConversion />} />
                          <Route path="search" element={<AdminSearchOverrides />} />
                          <Route
                            path="import/procedures"
                            element={<AdminImportProcedures />}
                          />
                          <Route
                            path="import/guidelines"
                            element={<AdminImportGuidelines />}
                          />
                          <Route path="logs" element={<AdminLogs />} />
                          <Route path="billing" element={<AdminBilling />} />
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
            </AIProcedureProvider>
          </TooltipProvider>
        </DataProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
