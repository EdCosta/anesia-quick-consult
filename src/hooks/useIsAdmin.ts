import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';

export function useIsAdmin() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUserId(data.session?.user?.id ?? null));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const { data: isAdmin = false, isLoading } = useQuery({
    queryKey: ['is-admin', userId],
    queryFn: async () => {
      if (!userId) return false;
      const { data } = await supabase.rpc('has_role', { _user_id: userId, _role: 'admin' });
      return !!data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  return { isAdmin, loading: isLoading && !!userId };
}
