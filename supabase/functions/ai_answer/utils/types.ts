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

export type SourceCitation = {
  id: string;
  label: string;
  kind: 'procedure' | 'guideline' | 'hospital_protocol';
  url?: string | null;
  note?: string | null;
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
  structured: {
    assessment: string;
    missingInformation: string[];
    plan: {
      preop: string[];
      intraop: string[];
      postop: string[];
    };
    redFlags: string[];
    checklist: string[];
    citations: SourceCitation[];
  };
};

export type PIIType = 'date_of_birth' | 'email' | 'hospital_record' | 'long_number' | 'phone';

export type PIIMatch = {
  type: PIIType;
  match: string;
};

export type PIIDetectionResult = {
  detected: boolean;
  matches: PIIMatch[];
};
