export type JsonPrimitive = string | number | boolean | null;

export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];

export type JsonObject = {
  [key: string]: JsonValue | undefined;
};

export type SupportedLanguage = 'fr' | 'en' | 'pt' | string;

export type AIAnswerRequest = {
  question: string;
  language: SupportedLanguage;
  procedureId?: string;
  threadId?: string;
  patient?: JsonObject;
  constraints?: JsonObject;
};

export type ConversationMessage = {
  role: 'developer' | 'user' | 'assistant';
  content: string;
};

export type ProcedureContext = {
  id: string;
  specialty?: string | null;
  titles?: JsonValue;
  content?: JsonValue;
  tags?: JsonValue;
};

export type GuidelineContext = {
  id: string;
  title: string;
  recommendationText: string;
  strength?: string | null;
  evidenceLevel?: string | null;
  contraindications?: string | null;
  references?: JsonValue;
  source?: {
    name?: string | null;
    organization?: string | null;
    region?: string | null;
    url?: string | null;
    versionLabel?: string | null;
    publishedDate?: string | null;
  };
};

export type HospitalProtocolContext = {
  id: string;
  name: string;
  country?: string | null;
  defaultLang?: string | null;
  protocolOverrides?: JsonValue;
};

export type PromptContext = {
  question: string;
  language: SupportedLanguage;
  history: ConversationMessage[];
  procedure?: ProcedureContext | null;
  guidelines?: GuidelineContext[];
  hospitalProtocol?: HospitalProtocolContext | null;
  patient?: JsonObject;
  constraints?: JsonObject;
};

export type ParsedAIAnswer = {
  answer: string;
  flags: string[];
  followUpQuestions: string[];
};

export type PIIType = 'email' | 'phone' | 'long_number';

export type PIIMatch = {
  type: PIIType;
  match: string;
};

export type PIIDetectionResult = {
  detected: boolean;
  matches: PIIMatch[];
};
