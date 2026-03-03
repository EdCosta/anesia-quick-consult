import type { SupportedLang } from '@/lib/types';

export type AIMessageRole = 'assistant' | 'system' | 'user';

export interface Message {
  id: string;
  role: AIMessageRole;
  content: string;
  createdAt: string;
  flags?: string[];
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
