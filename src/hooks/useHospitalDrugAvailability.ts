import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { HospitalDrugAvailability } from '@/lib/types';

export function useHospitalDrugAvailability(hospitalId?: string | null) {
  const [entries, setEntries] = useState<HospitalDrugAvailability[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!hospitalId) {
      setEntries([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('hospital_drug_availability' as any)
        .select(
          'hospital_id,drug_id,is_available,preferred_presentation_id,preferred_dilution_id,alternative_drug_id,local_note',
        )
        .eq('hospital_id', hospitalId);

      if (error) throw error;
      setEntries((data as HospitalDrugAvailability[]) || []);
    } catch (error) {
      console.warn('[AnesIA] Failed to load hospital drug availability', error);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [hospitalId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const byDrugId = useMemo(() => {
    return new Map(entries.map((entry) => [entry.drug_id, entry]));
  }, [entries]);

  return {
    entries,
    byDrugId,
    loading,
    refresh,
  };
}
