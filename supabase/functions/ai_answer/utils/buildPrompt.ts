import type {
  ConversationMessage,
  GuidelineContext,
  JsonObject,
  JsonValue,
  PromptContext,
  SourceCitation,
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

function buildAvailableSources(context: PromptContext, procedureTitle: string): SourceCitation[] {
  const sources: SourceCitation[] = [];

  if (context.procedure?.id) {
    sources.push({
      id: `procedure:${context.procedure.id}`,
      label: procedureTitle || context.procedure.id,
      kind: 'procedure',
      url: `/procedures/${context.procedure.id}`,
    });
  }

  for (const guideline of context.guidelines ?? []) {
    sources.push({
      id: `guideline:${guideline.id}`,
      label: guideline.title,
      kind: 'guideline',
      url: `/recommendations/${guideline.id}`,
      note:
        guideline.source?.organization || guideline.source?.name || guideline.source?.versionLabel
          ? [guideline.source?.organization, guideline.source?.name, guideline.source?.versionLabel]
              .filter(Boolean)
              .join(' · ')
          : null,
    });
  }

  if (context.hospitalProtocol?.id) {
    sources.push({
      id: `hospital:${context.hospitalProtocol.id}`,
      label: context.hospitalProtocol.name,
      kind: 'hospital_protocol',
      url: null,
      note: context.hospitalProtocol.country ?? null,
    });
  }

  return sources;
}

export function buildPrompt(context: PromptContext): ConversationMessage[] {
  const systemPrompt = [
    'You are a cautious clinical anesthesia assistant.',
    'You provide educational decision support, not a diagnosis.',
    'Prioritize patient safety, acknowledge uncertainty, and recommend escalation when red flags or emergencies are possible.',
    'Do not invent local protocols, drug doses, or source material that is not provided.',
    `Answer in ${context.language}.`,
    'Return JSON only with this exact shape: {"answer": string, "flags": string[], "followUpQuestions": string[], "structured": {"assessment": string, "missingInformation": string[], "plan": {"preop": string[], "intraop": string[], "postop": string[]}, "redFlags": string[], "checklist": string[], "citations": [{"id": string, "label": string, "kind": "procedure" | "guideline" | "hospital_protocol", "url": string | null, "note": string | null}]}}.',
    'Keep flags short, concrete, and safety-oriented.',
    'Make answer a short synthesis. Put the detailed operational content into structured.',
    'Never include personally identifiable information.',
    'If availableSources contains one or more items, structured.citations must include at least one supporting citation from that list.',
    'If availableSources is empty or insufficient, state that information is missing or not grounded in the current context.',
  ].join(' ');

  const procedureTitle = context.procedure
    ? localizeTitles(context.procedure.titles, context.language)
    : '';
  const availableSources = buildAvailableSources(context, procedureTitle);

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
    `  "availableSources": ${safeJsonStringify(availableSources)},`,
    `  "patient": ${safeJsonStringify(context.patient)},`,
    `  "constraints": ${safeJsonStringify(context.constraints)}`,
    '}',
    'Use only the provided context plus general clinical caution. If details are missing, say so explicitly.',
    'Citations must only use source ids from availableSources. If no source supports a point, say that the information is missing instead of inventing a citation.',
  ].join('\n');

  return [
    { role: 'developer', content: systemPrompt },
    ...context.history,
    { role: 'user', content: userPrompt },
  ];
}
