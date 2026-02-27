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
      if (!user) return null;
      const { data } = await supabase
        .from('user_entitlements')
        .select('plan_id')
        .eq('user_id', user.id)
        .maybeSingle();
      return data?.plan_id ?? null;
    },
    staleTime: 5 * 60 * 1000,
  });

  const plan = (data === 'pro' ? 'pro' : 'free') as 'free' | 'pro';
  return { plan, isPro: plan === 'pro', loading: isLoading };
}
