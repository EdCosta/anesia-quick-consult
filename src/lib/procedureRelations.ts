import type { ALRBlock, Guideline, Protocole, Procedure, SupportedLang } from '@/lib/types';

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function tokenize(value: string) {
  return normalize(value)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2);
}

type AnatomyHint = {
  match: string[];
  region?: string;
  blockIds?: string[];
};

const ANATOMY_HINTS: AnatomyHint[] = [
  { match: ['shoulder', 'epaule', 'ombro', 'clavicule', 'clavicula'], region: 'upper_limb', blockIds: ['interscalene', 'supraclavicular'] },
  { match: ['elbow', 'coude', 'cotovelo', 'forearm', 'avant-bras', 'antebraco', 'hand', 'main', 'mao'], region: 'upper_limb', blockIds: ['supraclavicular', 'infraclavicular', 'axillary'] },
  { match: ['hip', 'hanche', 'anca', 'femur', 'femoral'], region: 'lower_limb', blockIds: ['peng-block'] },
  { match: ['knee', 'genou', 'joelho'], region: 'lower_limb' },
  { match: ['foot', 'pied', 'pe'], region: 'lower_limb' },
  { match: ['thorax', 'thoracic', 'thoracique', 'breast', 'sein', 'mama'], region: 'trunk' },
  { match: ['head', 'neck', 'tete', 'cou', 'cabeca', 'pescoco'], region: 'head_neck' },
];

export function collectProcedureSignals(procedure: Procedure, title: string) {
  return new Set(
    [
      ...tokenize(title),
      ...tokenize(procedure.specialty || ''),
      ...(procedure.specialties || []).flatMap((specialty) => tokenize(specialty)),
      ...(procedure.tags || []).flatMap((tag) => tokenize(tag)),
      ...Object.values(procedure.synonyms || {}).flatMap((items) =>
        (items || []).flatMap((item) => tokenize(item)),
      ),
    ],
  );
}

function countTokenOverlap(tokens: Set<string>, values: string[]) {
  const candidateTokens = new Set(values.flatMap((value) => tokenize(value)));
  let matches = 0;
  for (const token of candidateTokens) {
    if (tokens.has(token)) matches += 1;
  }
  return matches;
}

function getAnatomyBoost(tokens: Set<string>, block: ALRBlock) {
  let score = 0;

  for (const hint of ANATOMY_HINTS) {
    const hit = hint.match.some((term) => tokens.has(normalize(term)));
    if (!hit) continue;
    if (hint.region && hint.region === block.region) score += 4;
    if (hint.blockIds?.includes(block.id)) score += 6;
  }

  return score;
}

export function getRelatedGuidelines(
  procedure: Procedure,
  title: string,
  guidelines: Guideline[],
  lang: SupportedLang,
  resolveStr: (obj: Partial<Record<SupportedLang, string>> | undefined) => string,
  procedureTagIds?: Set<string> | null,
  guidelineTagIds?: Map<string, string[]>,
) {
  const legacyTags = (procedure.tags || []).map(normalize);
  const procedureTags = new Set(
    procedureTagIds && procedureTagIds.size > 0 ? Array.from(procedureTagIds) : legacyTags,
  );
  const procedureSpecialties = new Set(
    [procedure.specialty, ...(procedure.specialties || [])].filter(Boolean).map(normalize),
  );
  const procedureSignals = collectProcedureSignals(procedure, title);

  return guidelines
    .map((guideline) => {
      const normalizedGuidelineTags = guidelineTagIds?.get(guideline.id) || [];
      const guidelineTags =
        normalizedGuidelineTags.length > 0
          ? normalizedGuidelineTags
          : (guideline.tags || []).map(normalize);
      const matchingTags = guidelineTags.filter((tag) => procedureTags.has(normalize(tag))).length;
      const specialtyMatches = (guideline.specialties || []).filter((specialty) =>
        procedureSpecialties.has(normalize(specialty)),
      ).length;
      const textMatches = countTokenOverlap(procedureSignals, [
        resolveStr(guideline.titles),
        guideline.category,
        guideline.source || '',
      ]);
      const score = matchingTags * 10 + specialtyMatches * 3 + textMatches;
      return { guideline, score, matchingTags, specialtyMatches, textMatches };
    })
    .filter((item) => item.score > 0)
    .sort(
      (left, right) =>
        right.score - left.score ||
        right.matchingTags - left.matchingTags ||
        right.specialtyMatches - left.specialtyMatches ||
        right.textMatches - left.textMatches,
    )
    .slice(0, 5)
    .map((item) => item.guideline);
}

export function getRelatedProtocols(
  procedure: Procedure,
  title: string,
  protocoles: Protocole[],
  resolveStr: (obj: Partial<Record<SupportedLang, string>> | undefined) => string,
) {
  const signals = collectProcedureSignals(procedure, title);

  return protocoles
    .map((protocol) => {
      const matchingTokens = countTokenOverlap(signals, [
        resolveStr(protocol.titles),
        protocol.category,
        ...(protocol.tags || []),
      ]);
      const categoryBoost = signals.has(normalize(protocol.category)) ? 2 : 0;
      return { protocol, score: matchingTokens * 5 + categoryBoost, matchingTokens };
    })
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score || right.matchingTokens - left.matchingTokens)
    .slice(0, 4)
    .map((item) => item.protocol);
}

export function getRelatedALRBlocks(
  procedure: Procedure,
  title: string,
  alrBlocks: ALRBlock[],
  lang: SupportedLang,
  resolveStr: (obj: Partial<Record<SupportedLang, string>> | undefined) => string,
  resolve: <T>(obj: Partial<Record<SupportedLang, T>> | undefined) => T | undefined,
) {
  const signals = collectProcedureSignals(procedure, title);
  void lang;

  return alrBlocks
    .map((block) => {
      const tokenMatches = countTokenOverlap(signals, [
        resolveStr(block.titles),
        block.region,
        ...(block.tags || []),
        ...(resolve<string[]>(block.indications) ?? []).slice(0, 3),
      ]);
      const anatomyBoost = getAnatomyBoost(signals, block);
      return {
        block,
        score: tokenMatches * 4 + anatomyBoost,
        tokenMatches,
        anatomyBoost,
      };
    })
    .filter((item) => item.score > 0)
    .sort(
      (left, right) =>
        right.score - left.score ||
        right.anatomyBoost - left.anatomyBoost ||
        right.tokenMatches - left.tokenMatches,
    )
    .slice(0, 4)
    .map((item) => item.block);
}
