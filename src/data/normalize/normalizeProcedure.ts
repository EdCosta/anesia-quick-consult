import type { Procedure } from '@/lib/types';

/** Wrap flat content objects into per-language shape */
export function wrapByLang(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (obj.fr || obj.en || obj.pt) return obj;
  if (obj.preop || obj.intraop || obj.clinical || obj.pitfalls) return { fr: obj };
  return obj;
}

/** Convert a Supabase DB row into the Procedure app model */
export function dbRowToProcedure(row: any): Procedure {
  return {
    id: row.id,
    specialty: row.specialty,
    titles: row.titles,
    synonyms: row.synonyms || {},
    quick: wrapByLang(row.content?.quick) || {},
    deep: wrapByLang(row.content?.deep) || {},
    is_pro: row.is_pro ?? false,
  };
}
