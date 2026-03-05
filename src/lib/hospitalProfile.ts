import type {
  HospitalProcedureContext,
  HospitalProfile,
  HospitalProtocolOverrides,
  Procedure,
  SupportedLang,
} from './types';

const ST_PIERRE_PROFILE_ID = 'hopital_st_pierre_pgs_2025_2026';
const ST_PIERRE_SCOPED_PROCEDURE_IDS = new Set([
  'pontage_coronarien_cabg',
  'remplacement_valvulaire_cardiaque',
  'tavi_implantation_aortique',
  'ablation_arythmie_rythmologie',
  'fermeture_fop',
  'ophtalmologie_ala',
  'thoracotomie',
  'vats_thoracoscopie',
  'endarteriectomie_carotidienne',
  'chirurgie_aaa_aortique',
  'pontage_arteriel_peripherique',
  'reconstruction_mammaire_senologie',
  'chirurgie_plastique_paroi_abdominale',
  'chirurgie_bariatrique',
  'cholecystectomie_laparoscopique',
  'colectomie_laparoscopique_racc',
  'surrenalectomie_pheo',
  'peridurale_analgesia_travail',
  'cesarienne_rachianesthesie',
  'cesarienne_ag',
  'pre_eclampsie_hellp',
  'hemorragie_post_partum',
  'laparoscopie_gynecologique',
  'prostatectomie_robot_assistee',
  'appendicectomie_adulte',
  'hernie_paroi_abdominale',
  'fundoplicature_nissen',
  'gastrectomie',
  'resection_hepatique',
  'proctologie_hemorroidectomie',
  'hysteroscopie_operative',
  'ivg_sedation',
  'nephrectomie_laparoscopique',
  'cystectomie_radicale',
  'remifentanil_analgesia_travail',
  'embolie_liquide_amniotique',
  'adenoidectomie_att_paed',
  'amygdalectomie_paed',
  'chirurgie_oreille_paed',
  'circoncision_paed',
  'hypospade_paed',
  'orchidopexie_paed',
  'hernie_inguinale_paed',
  'appendicectomie_paed',
  'stenose_pylore_nourrisson',
  'plaie_oeil_perforante_paed',
  'strabisme_paed',
  'nec_enterocolite_necrosante',
  'canal_arteriel_permeable',
  'sedation_imagerie_paed',
  'chirurgie_oreille_adulte',
  'chirurgie_endonasale_orl',
  'laryngectomie_carcinologique',
  'thyroidectomie_parathyroidectomie',
  'extractions_dentaires_stomato',
  'chirurgie_orthognathique',
  'abces_dentaire_voies_aeriennes',
  'arthroscopie_genou_menisectomie',
  'reconstruction_lca',
  'fracture_plateau_tibial',
  'fracture_tibia_diaphysaire_clou',
  'fracture_pilon_tibial',
  'fracture_malleolaire',
  'fixateur_externe_tibia',
  'arthroplastie_pth_ptg',
  'fracture_hanche_hemiarthroplastie',
  'arthroplastie_epaule',
  'fracture_femur_diaphysaire',
  'arthrodese_lombaire',
  'chirurgie_pied_cheville',
  'amputation_membre',
  'fracture_humerus_proximal',
  'fracture_col_femoral_deplacee_arthroplastie',
  'fracture_pertrochanterienne_clou_cephalomedullaire',
  'prothese_totale_genou',
  'fracture_radius_distal',
]);

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'number' && Number.isFinite(item));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return isRecord(value) && Object.values(value).every((item) => typeof item === 'string');
}

function isLocalizedString(value: unknown): value is Partial<Record<SupportedLang, string>> {
  return isRecord(value) && Object.values(value).every((item) => typeof item === 'string');
}

function isLocalizedStringArray(value: unknown): value is Partial<Record<SupportedLang, string[]>> {
  return (
    isRecord(value) &&
    Object.values(value).every((item) => Array.isArray(item) && item.every((entry) => typeof entry === 'string'))
  );
}

function getProtocolOverrides(
  profile: HospitalProfile | null | undefined,
): HospitalProtocolOverrides | null {
  const raw = profile?.protocol_overrides;
  return isRecord(raw) ? (raw as HospitalProtocolOverrides) : null;
}

function normalizeProcedureKey(procedure: Procedure): string {
  const title = procedure.titles.fr || procedure.titles.en || procedure.titles.pt || procedure.id;
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function dedupeProcedures(procedures: Procedure[]): Procedure[] {
  const seen = new Set<string>();
  return procedures.filter((procedure) => {
    const key = `${procedure.specialty}::${normalizeProcedureKey(procedure)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function pickPreferredProcedure(current: Procedure, next: Procedure, canonicalId: string): Procedure {
  const currentIsCanonical = current.id === canonicalId;
  const nextIsCanonical = next.id === canonicalId;

  if (currentIsCanonical && !nextIsCanonical) return current;
  if (nextIsCanonical && !currentIsCanonical) return next;

  return current;
}

function dedupeHospitalScopedProcedures(
  procedures: Procedure[],
  aliases: Record<string, string>,
): Procedure[] {
  const grouped = new Map<string, Procedure>();

  for (const procedure of procedures) {
    const canonicalId = aliases[procedure.id] || procedure.id;
    const existing = grouped.get(canonicalId);

    if (!existing) {
      grouped.set(canonicalId, procedure);
      continue;
    }

    grouped.set(canonicalId, pickPreferredProcedure(existing, procedure, canonicalId));
  }

  return Array.from(grouped.values());
}

function normalizeTag(tag: string): string {
  return tag
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function isHospitalScopedTag(tag: string): boolean {
  const normalized = normalizeTag(tag);
  return (
    normalized.includes('hospital') ||
    normalized.includes('hopital') ||
    normalized.includes('filtro_hospitalar') ||
    normalized.includes('hospital_filter') ||
    normalized.includes('hospital_only') ||
    normalized.includes('hospital-only')
  );
}

function isHospitalScopedProcedure(procedure: Procedure): boolean {
  return (procedure.tags || []).some((tag) => isHospitalScopedTag(tag));
}

function isStPierreScopedProcedure(procedure: Procedure): boolean {
  return ST_PIERRE_SCOPED_PROCEDURE_IDS.has(procedure.id);
}

export function getHospitalProcedureIds(profile: HospitalProfile | null | undefined): Set<string> | null {
  const ids = getProtocolOverrides(profile)?.procedure_ids;
  if (!isStringArray(ids) || ids.length === 0) return null;

  return new Set(ids.filter(Boolean));
}

export function getHospitalProcedureAliases(
  profile: HospitalProfile | null | undefined,
): Record<string, string> {
  const aliases = getProtocolOverrides(profile)?.procedure_aliases;
  return isStringRecord(aliases) ? aliases : {};
}

export function resolveHospitalProcedureId(
  procedureId: string,
  profile: HospitalProfile | null | undefined,
  isHospitalView: boolean,
): string {
  if (!isHospitalView || !procedureId) return procedureId;
  const aliases = getHospitalProcedureAliases(profile);
  return aliases[procedureId] || procedureId;
}

export function isStPierreProfile(profile: HospitalProfile | null | undefined): boolean {
  return profile?.id === ST_PIERRE_PROFILE_ID;
}

export function isStPierreProcedure(
  procedureId: string,
  profile: HospitalProfile | null | undefined,
  isHospitalView: boolean,
): boolean {
  if (!procedureId || !isHospitalView || !isStPierreProfile(profile)) return false;
  const scopedIds = getHospitalProcedureIds(profile);
  if (!scopedIds) return true;
  const resolvedId = resolveHospitalProcedureId(procedureId, profile, isHospitalView);
  return scopedIds.has(procedureId) || scopedIds.has(resolvedId);
}

function parseHospitalProcedureContext(value: unknown): HospitalProcedureContext | null {
  if (!isRecord(value)) return null;

  const context: HospitalProcedureContext = {};

  if (isLocalizedString(value.title)) {
    context.title = value.title;
  }
  if (isLocalizedStringArray(value.summary)) {
    context.summary = value.summary;
  }
  if (isNumberArray(value.source_pages)) {
    context.source_pages = value.source_pages;
  }
  if (isStringArray(value.linked_procedure_ids)) {
    context.linked_procedure_ids = value.linked_procedure_ids;
  }

  return Object.keys(context).length > 0 ? context : null;
}

export function getHospitalProcedureContext(
  profile: HospitalProfile | null | undefined,
  procedureId: string,
  resolvedProcedureId = procedureId,
): HospitalProcedureContext | null {
  const contexts = getProtocolOverrides(profile)?.procedure_contexts;
  if (!isRecord(contexts)) return null;

  const context =
    parseHospitalProcedureContext(contexts[resolvedProcedureId]) ||
    (resolvedProcedureId !== procedureId ? parseHospitalProcedureContext(contexts[procedureId]) : null);

  return context;
}

export function filterProceduresForHospitalMode(
  procedures: Procedure[],
  profile: HospitalProfile | null | undefined,
  isHospitalView: boolean,
): Procedure[] {
  const scopedIds = getHospitalProcedureIds(profile);
  const aliases = getHospitalProcedureAliases(profile);
  const source = isHospitalView && scopedIds
    ? dedupeHospitalScopedProcedures(
        procedures.filter((procedure) => scopedIds.has(procedure.id)),
        aliases,
      )
    : isHospitalView
      ? procedures
      : procedures.filter(
          (procedure) =>
            !isHospitalScopedProcedure(procedure) && !isStPierreScopedProcedure(procedure),
        );
  return dedupeProcedures(source);
}
