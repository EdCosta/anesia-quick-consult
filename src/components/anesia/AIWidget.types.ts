import type { SupportedLang } from '@/lib/types';

export type AIMessageRole = 'assistant' | 'system' | 'user';

export interface AICitation {
  id: string;
  label: string;
  kind: 'procedure' | 'guideline' | 'hospital_protocol';
  url?: string | null;
  note?: string | null;
}

export interface StructuredAIAnswer {
  assessment: string;
  missingInformation: string[];
  plan: {
    preop: string[];
    intraop: string[];
    postop: string[];
  };
  redFlags: string[];
  checklist: string[];
  citations: AICitation[];
}

export interface Message {
  id: string;
  role: AIMessageRole;
  content: string;
  createdAt: string;
  flags?: string[];
  followUpQuestions?: string[];
  structured?: StructuredAIAnswer;
}

export interface Thread {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  procedureId?: string;
  procedureTitle?: string;
  language: SupportedLang;
  messages: Message[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0);
}

export function normalizeStructuredAIAnswer(value: unknown): StructuredAIAnswer | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const planValue = isRecord(value.plan) ? value.plan : {};
  const citations = Array.isArray(value.citations)
    ? value.citations
        .map((entry) => {
          if (!isRecord(entry) || typeof entry.id !== 'string' || typeof entry.label !== 'string') {
            return null;
          }

          const kind =
            entry.kind === 'procedure' || entry.kind === 'guideline' || entry.kind === 'hospital_protocol'
              ? entry.kind
              : 'guideline';

          return {
            id: entry.id,
            label: entry.label,
            kind,
            url: typeof entry.url === 'string' ? entry.url : null,
            note: typeof entry.note === 'string' ? entry.note : null,
          } satisfies AICitation;
        })
        .filter((entry): entry is AICitation => !!entry)
    : [];

  const assessment = typeof value.assessment === 'string' ? value.assessment.trim() : '';

  return {
    assessment,
    missingInformation: normalizeStringArray(value.missingInformation),
    plan: {
      preop: normalizeStringArray(planValue.preop),
      intraop: normalizeStringArray(planValue.intraop),
      postop: normalizeStringArray(planValue.postop),
    },
    redFlags: normalizeStringArray(value.redFlags),
    checklist: normalizeStringArray(value.checklist),
    citations,
  };
}

export function normalizeAIMessage(value: unknown): Message | null {
  if (!isRecord(value)) {
    return null;
  }

  const role = value.role;
  if (role !== 'assistant' && role !== 'system' && role !== 'user') {
    return null;
  }

  if (
    typeof value.id !== 'string' ||
    typeof value.content !== 'string' ||
    typeof value.createdAt !== 'string'
  ) {
    return null;
  }

  return {
    id: value.id,
    role,
    content: value.content,
    createdAt: value.createdAt,
    flags: normalizeStringArray(value.flags),
    followUpQuestions: normalizeStringArray(value.followUpQuestions),
    structured: normalizeStructuredAIAnswer(value.structured),
  };
}

export function normalizeAIThread(value: unknown): Thread | null {
  if (!isRecord(value)) {
    return null;
  }

  const language =
    value.language === 'fr' || value.language === 'en' || value.language === 'pt'
      ? value.language
      : 'fr';
  const messages = Array.isArray(value.messages)
    ? value.messages
        .map((message) => normalizeAIMessage(message))
        .filter((message): message is Message => !!message)
    : [];

  if (
    typeof value.id !== 'string' ||
    typeof value.title !== 'string' ||
    typeof value.createdAt !== 'string' ||
    typeof value.updatedAt !== 'string'
  ) {
    return null;
  }

  return {
    id: value.id,
    title: value.title,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    procedureId: typeof value.procedureId === 'string' ? value.procedureId : undefined,
    procedureTitle: typeof value.procedureTitle === 'string' ? value.procedureTitle : undefined,
    language,
    messages,
  };
}

export function sortAIThreads(threads: Thread[]) {
  return [...threads].sort(
    (firstThread, secondThread) =>
      new Date(secondThread.updatedAt).getTime() - new Date(firstThread.updatedAt).getTime(),
  );
}

export function createAIId(prefix = 'ai') {
  const randomPart =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  return `${prefix}-${randomPart}`;
}

export function detectPIIInText(text: string) {
  const issues: string[] = [];
  const normalizedText = text.trim();

  if (!normalizedText) {
    return issues;
  }

  if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(normalizedText)) {
    issues.push('email');
  }

  if (/(?:\+?\d[\d\s().-]{7,}\d)/.test(normalizedText)) {
    issues.push('telefone');
  }

  if (
    /\b(?:dob|date of birth|data de nascimento|date de naissance)\b[\s:.-]*(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}[/-]\d{1,2}[/-]\d{1,2})/i.test(
      normalizedText,
    )
  ) {
    issues.push('data_nascimento');
  }

  if (
    /\b(?:mrn|record\s*(?:number|id)|numero\s+de\s+processo|numero\s+de\s+dossier|n[úu]mero\s+de\s+doente)\b[\s:#-]*[a-z0-9-]{4,}/i.test(
      normalizedText,
    )
  ) {
    issues.push('numero_processo');
  }

  if (/\b\d{8,}\b/.test(normalizedText)) {
    issues.push('numero_longo');
  }

  return issues;
}

export function buildThreadTitle(messages: Message[], procedureTitle?: string) {
  const firstUserMessage = messages.find((message) => message.role === 'user')?.content.trim();

  if (firstUserMessage) {
    return firstUserMessage.length > 64
      ? `${firstUserMessage.slice(0, 61).trimEnd()}...`
      : firstUserMessage;
  }

  if (procedureTitle) {
    return `Consulta ${procedureTitle}`;
  }

  return 'Nova conversa';
}

export function formatAIThreadDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('pt-PT', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}
