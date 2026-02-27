import { supabase } from '@/integrations/supabase/client';
import { normalizeLocalizedValue } from '@/data/normalize/i18n';

export interface SpecialtyRecord {
  id: string;
  name: Record<'fr' | 'en' | 'pt', string>;
  sort_base: number;
}

export async function loadSpecialtiesFromSupabase(): Promise<SpecialtyRecord[]> {
  const { data } = await supabase
    .from('specialties' as any)
    .select('*')
    .eq('is_active', true)
    .order('sort_base');

  return ((data as any[]) || []).map((row) => ({
    id: row.id,
    name: normalizeLocalizedValue(row.name, () => ''),
    sort_base: row.sort_base || 0,
  }));
}
