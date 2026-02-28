import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

interface EntitlementResult {
  plan: 'free' | 'pro';
  isPro: boolean;
  loading: boolean;
}

export function useEntitlements(): EntitlementResult {
  const queryClient = useQueryClient();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      queryClient.invalidateQueries({ queryKey: ['entitlement'] });
    });
    return () => subscription.unsubscribe();
  }, [queryClient]);

  const { data, isLoading } = useQuery({
    queryKey: ['entitlement'],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return 'free';

      const { data: profileRow } = await supabase
        .from('user_profiles' as any)
        .select('plan')
        .eq('user_id', user.id)
        .maybeSingle();

      const profilePlan = (profileRow as { plan?: string } | null)?.plan;
      if (profilePlan === 'pro' || profilePlan === 'free') {
        return profilePlan;
      }

      const { data: entitlementRow } = await supabase
        .from('user_entitlements' as any)
        .select('plan_id, active, expires_at')
        .eq('user_id', user.id)
        .eq('active', true)
        .maybeSingle();

      const expiresAt = (entitlementRow as { expires_at?: string | null } | null)?.expires_at;
      const isExpired = !!expiresAt && new Date(expiresAt).getTime() <= Date.now();
      if ((entitlementRow as { plan_id?: string } | null)?.plan_id === 'pro' && !isExpired) {
        return 'pro';
      }

      return 'free';
    },
    staleTime: 5 * 60 * 1000,
  });

  const plan = data === 'pro' ? 'pro' : 'free';
  return { plan, isPro: plan === 'pro', loading: isLoading };
}
