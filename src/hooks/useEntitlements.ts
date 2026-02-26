import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';

interface EntitlementResult {
  plan: 'free' | 'pro';
  isPro: boolean;
  loading: boolean;
}

export function useEntitlements(): EntitlementResult {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUserId(data.session?.user?.id ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['entitlement', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await supabase
        .from('user_entitlements' as any)
        .select('plan_id, active, expires_at')
        .eq('user_id', userId)
        .eq('active', true)
        .maybeSingle();
      if (!data) return null;
      const row = data as any;
      if (row.expires_at && new Date(row.expires_at) < new Date()) return null;
      return row.plan_id as string;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  const plan = (data === 'pro' ? 'pro' : 'free') as 'free' | 'pro';
  return { plan, isPro: plan === 'pro', loading: isLoading && !!userId };
}
