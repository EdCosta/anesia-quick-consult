import { describe, expect, it } from 'vitest';
import {
  parseProcedureImportCsv,
  procedureImportResponseSchema,
} from '@/lib/admin/procedureImport';

describe('parseProcedureImportCsv', () => {
  it('parses JSON title format', () => {
    const csv = [
      'id;specialty;titles;synonyms;content;tags',
      'proc_1;Orthopedics;"{""fr"":""PTH"",""en"":""THR""}";"{}";"{}";"[]"',
    ].join('\n');

    const result = parseProcedureImportCsv(csv);

    expect(result.errors).toEqual([]);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].id).toBe('proc_1');
    expect(result.rows[0].titles.fr).toBe('PTH');
    expect(result.rows[0].titles.en).toBe('THR');
  });

  it('parses legacy multilingual title columns', () => {
    const csv = [
      'id;specialty;title_fr;title_en;title_pt;synonyms;content;tags',
      'proc_2;Urology;RTUP;TURP;RTUP;"{}";"{}";"[]"',
    ].join('\n');

    const result = parseProcedureImportCsv(csv);

    expect(result.errors).toEqual([]);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].titles.fr).toBe('RTUP');
    expect(result.rows[0].titles.en).toBe('TURP');
    expect(result.rows[0].titles.pt).toBe('RTUP');
  });

  it('reports invalid JSON fields', () => {
    const csv = [
      'id;specialty;titles;synonyms;content;tags',
      'proc_3;Neuro;"{""fr"":""ACDF""}";"{bad}";"{}";"[]"',
    ].join('\n');

    const result = parseProcedureImportCsv(csv);

    expect(result.rows).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('invalid synonyms JSON');
  });
});

describe('procedureImportResponseSchema', () => {
  it('accepts valid import responses', () => {
    const parsed = procedureImportResponseSchema.parse({
      inserted: 2,
      updated: 3,
      errors: ['Line 4: invalid titles JSON'],
      total_errors: 1,
    });

    expect(parsed.inserted).toBe(2);
    expect(parsed.updated).toBe(3);
    expect(parsed.total_errors).toBe(1);
  });
});
