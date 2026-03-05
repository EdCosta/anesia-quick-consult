import { describe, expect, it } from 'vitest';
import type { HospitalProfile, Procedure } from './types';
import { filterProceduresForHospitalMode, isStPierreProcedure } from './hospitalProfile';

function makeProcedure(id: string, tags: string[] = []): Procedure {
  return {
    id,
    specialty: 'ortopedia',
    specialties: ['ortopedia'],
    titles: { fr: id, en: id, pt: id },
    synonyms: { fr: [], en: [], pt: [] },
    quick: {
      fr: { preop: [], intraop: [], postop: [], red_flags: [], drugs: [] },
      en: { preop: [], intraop: [], postop: [], red_flags: [], drugs: [] },
      pt: { preop: [], intraop: [], postop: [], red_flags: [], drugs: [] },
    },
    deep: {
      fr: { clinical: [], pitfalls: [], references: [] },
      en: { clinical: [], pitfalls: [], references: [] },
      pt: { clinical: [], pitfalls: [], references: [] },
    },
    tags,
    is_pro: false,
  };
}

function makeProfile(overrides: HospitalProfile['protocol_overrides']): HospitalProfile {
  return {
    id: 'hospital-x',
    name: 'Hospital X',
    default_lang: 'pt',
    formulary: { drug_ids: [] },
    protocol_overrides: overrides,
  };
}

function makeStPierreProfile(overrides: HospitalProfile['protocol_overrides']): HospitalProfile {
  return {
    id: 'hopital_st_pierre_pgs_2025_2026',
    name: 'CHU St Pierre',
    default_lang: 'fr',
    formulary: { drug_ids: [] },
    protocol_overrides: overrides,
  };
}

describe('filterProceduresForHospitalMode', () => {
  it('hides St Pierre scoped procedures in normal mode', () => {
    const normalProcedure = makeProcedure('appendicectomy');
    const stPierreProcedure = makeProcedure('arthroplastie_epaule');

    const result = filterProceduresForHospitalMode(
      [normalProcedure, stPierreProcedure],
      null,
      false,
    );

    expect(result.map((procedure) => procedure.id)).toEqual(['appendicectomy']);
  });

  it('hides hospital-scoped procedures when hospital filter is not selected', () => {
    const visible = makeProcedure('appendicectomy');
    const hospitalOnly = makeProcedure('st_pierre_only', ['hospital_filter']);

    const result = filterProceduresForHospitalMode([visible, hospitalOnly], null, false);

    expect(result.map((procedure) => procedure.id)).toEqual(['appendicectomy']);
  });

  it('keeps hospital-scoped procedures when hospital filter is selected', () => {
    const visible = makeProcedure('appendicectomy');
    const hospitalOnly = makeProcedure('st_pierre_only', ['hospital_filter']);

    const result = filterProceduresForHospitalMode([visible, hospitalOnly], null, true);

    expect(result.map((procedure) => procedure.id)).toEqual(['appendicectomy', 'st_pierre_only']);
  });

  it('still applies profile procedure_ids scoping in hospital mode', () => {
    const profile = makeProfile({ procedure_ids: ['in_scope'] });
    const inScope = makeProcedure('in_scope');
    const outOfScope = makeProcedure('out_of_scope');

    const result = filterProceduresForHospitalMode([inScope, outOfScope], profile, true);

    expect(result.map((procedure) => procedure.id)).toEqual(['in_scope']);
  });
});

describe('isStPierreProcedure', () => {
  it('returns true for procedures in the active St Pierre profile scope', () => {
    const profile = makeStPierreProfile({ procedure_ids: ['arthroplastie_epaule'] });

    expect(isStPierreProcedure('arthroplastie_epaule', profile, true)).toBe(true);
  });

  it('returns false outside hospital view or with non-St Pierre profile', () => {
    const stPierreProfile = makeStPierreProfile({ procedure_ids: ['arthroplastie_epaule'] });
    const otherProfile = makeProfile({ procedure_ids: ['arthroplastie_epaule'] });

    expect(isStPierreProcedure('arthroplastie_epaule', stPierreProfile, false)).toBe(false);
    expect(isStPierreProcedure('arthroplastie_epaule', otherProfile, true)).toBe(false);
  });
});
