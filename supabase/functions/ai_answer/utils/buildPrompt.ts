import type {
  ConversationMessage,
  GuidelineContext,
  JsonObject,
  JsonValue,
  PromptContext,
  SupportedLanguage,
} from './types.ts';

function safeJsonStringify(value: JsonValue | JsonObject | undefined): string {
  if (value === undefined) {
    return 'null';
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return '"[unserializable]"';
  }
}

function localizeTitles(value: JsonValue | undefined, language: SupportedLanguage): string {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return '';
  }

  const record = value as Record<string, JsonValue | undefined>;
  const localized =
    record[language] ??
    record.fr ??
    record.en ??
    record.pt;

  return typeof localized === 'string' ? localized : safeJsonStringify(localized);
}

function summarizeGuidelines(guidelines: GuidelineContext[]): string {
  if (guidelines.length === 0) {
    return '[]';
  }

  const summarized = guidelines.map((guideline) => ({
    id: guideline.id,
    title: guideline.title,
    recommendationText: guideline.recommendationText,
    strength: guideline.strength ?? null,
    evidenceLevel: guideline.evidenceLevel ?? null,
    contraindications: guideline.contraindications ?? null,
    source: guideline.source ?? null,
    references: guideline.references ?? [],
  }));

  return safeJsonStringify(summarized);
}

export function buildPrompt(context: PromptContext): ConversationMessage[] {
  const systemPrompt = [
    'You are a cautious clinical anesthesia assistant.',
    'You provide educational decision support, not a diagnosis.',
    'Prioritize patient safety, acknowledge uncertainty, and recommend escalation when red flags or emergencies are possible.',
    'Do not invent local protocols, drug doses, or source material that is not provided.',
    `Answer in ${context.language}.`,
    'Return JSON only with this exact shape: {"answer": string, "flags": string[], "followUpQuestions": string[]}.',
    'Keep flags short, concrete, and safety-oriented.',
    'Never include personally identifiable information.',
  ].join(' ');

  const procedureTitle = context.procedure
    ? localizeTitles(context.procedure.titles, context.language)
    : '';

  const userPrompt = [
    'Clinical context (structured JSON):',
    '{',
    `  "language": ${JSON.stringify(context.language)},`,
    `  "question": ${JSON.stringify(context.question)},`,
    `  "procedure": ${safeJsonStringify(
      context.procedure
        ? {
            id: context.procedure.id,
            title: procedureTitle || null,
            specialty: context.procedure.specialty ?? null,
            tags: context.procedure.tags ?? [],
            content: context.procedure.content ?? null,
          }
        : null,
    )},`,
    `  "guidelines": ${summarizeGuidelines(context.guidelines ?? [])},`,
    `  "hospitalProtocol": ${safeJsonStringify(
      context.hospitalProtocol
        ? {
            id: context.hospitalProtocol.id,
            name: context.hospitalProtocol.name,
            country: context.hospitalProtocol.country ?? null,
            defaultLang: context.hospitalProtocol.defaultLang ?? null,
            protocolOverrides: context.hospitalProtocol.protocolOverrides ?? null,
          }
        : null,
    )},`,
    `  "patient": ${safeJsonStringify(context.patient)},`,
    `  "constraints": ${safeJsonStringify(context.constraints)}`,
    '}',
    'Use only the provided context plus general clinical caution. If details are missing, say so explicitly.',
  ].join('\n');

  return [
    { role: 'developer', content: systemPrompt },
    ...context.history,
    { role: 'user', content: userPrompt },
  ];
}
