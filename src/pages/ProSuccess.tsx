import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ArrowLeft, Crown } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useLang } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { User } from '@supabase/supabase-js';

type SyncResponse = {
  ok: boolean;
  plan: 'free' | 'pro';
  subscriptionStatus: string;
  expiresAt: string | null;
};

export default function ProSuccess() {
  const { lang, t } = useLang();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [syncing, setSyncing] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setCheckingAuth(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setCheckingAuth(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (checkingAuth) return;
    if (!sessionId) {
      setSyncing(false);
      setSyncError(
        lang === 'fr'
          ? 'Session de paiement introuvable.'
          : lang === 'pt'
            ? 'Sessão de pagamento não encontrada.'
            : 'Payment session not found.',
      );
      return;
    }

    if (!user) {
      setSyncing(false);
      setSyncError(
        lang === 'fr'
          ? "Connectez-vous pour finaliser l'activation Pro."
          : lang === 'pt'
            ? 'Inicie sessão para finalizar a ativação Pro.'
            : 'Sign in to finalize Pro activation.',
      );
      return;
    }

    let cancelled = false;

    async function syncCheckout() {
      setSyncing(true);
      setSyncError(null);

      const { data, error } = await supabase.functions.invoke<SyncResponse>('stripe-checkout', {
        body: {
          action: 'sync_checkout_session',
          sessionId,
          origin: window.location.origin,
        },
      });

      if (cancelled) return;

      if (error || !data?.ok || data.plan !== 'pro') {
        setSyncError(
          error?.message ||
            (lang === 'fr'
              ? 'Paiement reçu, mais activation Pro en attente. Réessayez dans quelques secondes.'
              : lang === 'pt'
                ? 'Pagamento recebido, mas ativação Pro ainda pendente. Tente novamente em alguns segundos.'
                : 'Payment received, but Pro activation is still pending. Try again in a few seconds.'),
        );
        setSyncing(false);
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ['entitlement'] });
      toast.success(
        lang === 'fr'
          ? 'Mode Pro activé'
          : lang === 'pt'
            ? 'Modo Pro ativado'
            : 'Pro mode activated',
      );
      setSyncing(false);
    }

    void syncCheckout();

    return () => {
      cancelled = true;
    };
  }, [checkingAuth, lang, queryClient, sessionId, user]);

  return (
    <div className="container max-w-lg space-y-5 py-6">
      <Link to="/account" className="inline-flex items-center gap-1 text-sm text-accent hover:underline">
        <ArrowLeft className="h-4 w-4" />
        {t('back')}
      </Link>

      <Card className="border-accent/30 clinical-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            {lang === 'fr'
              ? 'Paiement confirmé'
              : lang === 'pt'
                ? 'Pagamento confirmado'
                : 'Payment confirmed'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {syncing ? (
            <p className="text-sm text-muted-foreground">
              {lang === 'fr'
                ? 'Finalisation de votre accès Pro...'
                : lang === 'pt'
                  ? 'A finalizar o seu acesso Pro...'
                  : 'Finalizing your Pro access...'}
            </p>
          ) : syncError ? (
            <p className="text-sm text-destructive">{syncError}</p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                {lang === 'fr'
                  ? 'Votre compte est maintenant en Pro.'
                  : lang === 'pt'
                    ? 'A sua conta está agora em Pro.'
                    : 'Your account is now on Pro.'}
              </p>
              <Badge variant="default" className="gap-1">
                <Crown className="h-3.5 w-3.5" />
                {t('plan_pro')}
              </Badge>
            </>
          )}
        </CardContent>
      </Card>

      <Button asChild className="w-full" size="lg">
        <Link to="/account">
          {lang === 'fr'
            ? 'Aller au compte'
            : lang === 'pt'
              ? 'Ir para conta'
              : 'Go to account'}
        </Link>
      </Button>
    </div>
  );
}
