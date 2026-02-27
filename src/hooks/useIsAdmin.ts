import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';

export function useIsAdmin() {
  const [userId, setUserId] = useState<string | null>(null);
  const [sessionResolved, setSessionResolved] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user?.id ?? null);
      setSessionResolved(true);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
      setSessionResolved(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const { data: isAdmin = false, isLoading } = useQuery({
    queryKey: ['is-admin', userId],
    queryFn: async () => {
      if (!userId) return false;
      const { data, error } = await supabase
        .from('user_roles' as any)
        .select('user_id')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) {
        throw error;
      }

      return !!data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    isAdmin,
    isAuthenticated: !!userId,
    userId,
    loading: !sessionResolved || (isLoading && !!userId),
  };
}
