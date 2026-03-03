import type { JsonObject, JsonValue, PIIDetectionResult, PIIMatch, PIIType } from './types.ts';

const EMAIL_REGEX = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const PHONE_REGEX = /(?:\+?\d[\d\s().-]{7,}\d)/g;
const LONG_NUMBER_REGEX = /\b\d{8,}\b/g;

function collectStrings(value: JsonValue | undefined, bucket: string[]) {
  if (typeof value === 'string') {
    bucket.push(value);
    return;
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      collectStrings(entry, bucket);
    }
    return;
  }

  if (!value || typeof value !== 'object') {
    return;
  }

  for (const entry of Object.values(value)) {
    collectStrings(entry, bucket);
  }
}

function matchPattern(source: string, pattern: RegExp, type: PIIType, matches: PIIMatch[]) {
  const normalized = new RegExp(pattern.source, pattern.flags);

  for (const match of source.matchAll(normalized)) {
    const value = match[0]?.trim();
    if (!value) {
      continue;
    }

    matches.push({ type, match: value });
  }
}

export function detectPII(values: Array<string | JsonObject | undefined>): PIIDetectionResult {
  const strings: string[] = [];
  const matches: PIIMatch[] = [];

  for (const value of values) {
    if (typeof value === 'string') {
      strings.push(value);
      continue;
    }

    if (!value || typeof value !== 'object') {
      continue;
    }

    collectStrings(value, strings);
  }

  const payload = strings.join('\n');

  matchPattern(payload, EMAIL_REGEX, 'email', matches);
  matchPattern(payload, PHONE_REGEX, 'phone', matches);
  matchPattern(payload, LONG_NUMBER_REGEX, 'long_number', matches);

  const dedupedMatches = matches.filter(
    (match, index, currentMatches) =>
      currentMatches.findIndex(
        (candidate) => candidate.type === match.type && candidate.match === match.match,
      ) === index,
  );

  return {
    detected: dedupedMatches.length > 0,
    matches: dedupedMatches,
  };
}
