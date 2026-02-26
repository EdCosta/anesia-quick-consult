import type { Guideline, Protocole, ALRBlock } from '@/lib/types';

export function dbRowToGuideline(row: any): Guideline {
  return {
    id: row.id,
    category: row.category,
    titles: row.titles,
    items: row.items,
    references: row.refs || [],
  };
}

export function dbRowToProtocole(row: any): Protocole {
  return {
    id: row.id,
    category: row.category,
    titles: row.titles,
    steps: row.steps,
    references: row.refs || [],
  };
}

export function dbRowToALRBlock(row: any): ALRBlock {
  return {
    id: row.id,
    region: row.region,
    titles: row.titles,
    indications: row.indications || {},
    contraindications: row.contraindications || {},
    technique: row.technique || {},
    drugs: row.drugs || {},
  };
}
