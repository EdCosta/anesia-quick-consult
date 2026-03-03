import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

interface EntitlementResult {
  plan: 'free' | 'pro';
  isPro: boolean;
  loading: boolean;
}

type ProfilePlanRow = {
  plan?: string | null;
};

type EntitlementRow = {
  plan_id?: string | null;
  expires_at?: string | null;
};

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

      const { data: hasProAccess, error: proAccessError } = await supabase.rpc(
        'has_pro_access' as any,
      );
      if (!proAccessError && hasProAccess === true) {
        return 'pro';
      }

      const { data: profileRow } = await supabase
        .from('user_profiles')
        .select('plan')
        .eq('user_id', user.id)
        .maybeSingle();

      const profilePlan = (profileRow as ProfilePlanRow | null)?.plan;
      if (profilePlan === 'pro' || profilePlan === 'free') {
        return profilePlan;
      }

      const { data: entitlementRow } = await supabase
        .from('user_entitlements')
        .select('plan_id, active, expires_at')
        .eq('user_id', user.id)
        .eq('active', true)
        .maybeSingle();

      const typedEntitlementRow = entitlementRow as EntitlementRow | null;
      const expiresAt = typedEntitlementRow?.expires_at;
      const isExpired = !!expiresAt && new Date(expiresAt).getTime() <= Date.now();
      if (typedEntitlementRow?.plan_id === 'pro' && !isExpired) {
        return 'pro';
      }

      return 'free';
    },
    staleTime: 5 * 60 * 1000,
  });

  const plan = data === 'pro' ? 'pro' : 'free';
  return { plan, isPro: plan === 'pro', loading: isLoading };
}
