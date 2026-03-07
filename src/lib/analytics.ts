import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

type AnalyticsMetaValue = string | number | boolean | null;

type AnalyticsEventPayload = {
  name: string;
  ts: string;
  path: string;
  language: string | null;
  meta?: Record<string, AnalyticsMetaValue>;
};

const ANALYTICS_QUEUE_STORAGE_KEY = 'anesia-analytics-queue';
const ANALYTICS_SESSION_STORAGE_KEY = 'anesia-analytics-session';
const ANALYTICS_ATTRIBUTION_STORAGE_KEY = 'anesia-analytics-attribution';
const MAX_QUEUE_SIZE = 100;
const ANALYTICS_ENABLED = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';

let flushPromise: Promise<void> | null = null;

function isBrowser() {
  return typeof window !== 'undefined';
}

function readQueue() {
  if (!isBrowser()) return [] as AnalyticsEventPayload[];

  try {
    const raw = window.localStorage.getItem(ANALYTICS_QUEUE_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AnalyticsEventPayload[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(events: AnalyticsEventPayload[]) {
  if (!isBrowser()) return;

  try {
    window.localStorage.setItem(ANALYTICS_QUEUE_STORAGE_KEY, JSON.stringify(events));
  } catch {
    // Ignore storage failures.
  }
}

function getSessionId() {
  if (!isBrowser()) return 'server';

  const existing = window.localStorage.getItem(ANALYTICS_SESSION_STORAGE_KEY);
  if (existing) return existing;

  const nextSessionId =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `session-${Date.now()}`;
  window.localStorage.setItem(ANALYTICS_SESSION_STORAGE_KEY, nextSessionId);
  return nextSessionId;
}

function readStoredAttribution() {
  if (!isBrowser()) return null;

  try {
    const raw = window.localStorage.getItem(ANALYTICS_ATTRIBUTION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, AnalyticsMetaValue>) : null;
  } catch {
    return null;
  }
}

function writeStoredAttribution(value: Record<string, AnalyticsMetaValue>) {
  if (!isBrowser()) return;

  try {
    window.localStorage.setItem(ANALYTICS_ATTRIBUTION_STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Ignore storage failures.
  }
}

function extractAttribution() {
  if (!isBrowser()) return {};

  const url = new URL(window.location.href);
  const params = url.searchParams;
  const stored = readStoredAttribution() || {};
  const nextAttribution: Record<string, AnalyticsMetaValue> = {
    source:
      params.get('utm_source') ||
      params.get('source') ||
      (stored.source as string | null) ||
      (document.referrer ? 'referral' : 'direct'),
    medium:
      params.get('utm_medium') || params.get('medium') || (stored.medium as string | null) || null,
    campaign:
      params.get('utm_campaign') ||
      params.get('campaign') ||
      (stored.campaign as string | null) ||
      null,
    term: params.get('utm_term') || (stored.term as string | null) || null,
    content:
      params.get('utm_content') || params.get('content') || (stored.content as string | null) || null,
    landing_path: (stored.landing_path as string | null) || window.location.pathname,
    referrer: (stored.referrer as string | null) || document.referrer || null,
    referrer_host:
      (stored.referrer_host as string | null) ||
      (document.referrer ? new URL(document.referrer).hostname : null),
  };

  writeStoredAttribution(nextAttribution);
  return nextAttribution;
}

async function flushQueue() {
  if (!isBrowser()) return;

  const queueSnapshot = readQueue();
  if (queueSnapshot.length === 0) return;

  const sessionId = getSessionId();
  const payload = queueSnapshot.map((event) => ({
    session_id: sessionId,
    event_name: event.name,
    path: event.path,
    language: event.language,
    meta: (event.meta || {}) as Json,
    user_agent: navigator.userAgent,
    created_at: event.ts,
  }));

  const { error } = await supabase.from('analytics_events').insert(payload);

  if (error) {
    throw error;
  }

  const latestQueue = readQueue();
  writeQueue(latestQueue.slice(queueSnapshot.length));
}

function scheduleFlush() {
  if (!isBrowser()) return;
  if (flushPromise) return;

  flushPromise = flushQueue()
    .catch((error) => {
      console.warn('[AnesIA] Analytics flush failed', error);
    })
    .finally(() => {
      flushPromise = null;
    });
}

let listenersRegistered = false;

function ensureFlushListeners() {
  if (!isBrowser() || listenersRegistered) return;

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      scheduleFlush();
    }
  };

  window.addEventListener('pagehide', scheduleFlush);
  document.addEventListener('visibilitychange', handleVisibilityChange);
  listenersRegistered = true;
}

export function trackEvent(name: string, meta?: Record<string, AnalyticsMetaValue>) {
  if (!isBrowser() || !ANALYTICS_ENABLED) return;

  ensureFlushListeners();

  const event: AnalyticsEventPayload = {
    name,
    ts: new Date().toISOString(),
    path: window.location.pathname,
    language: document.documentElement.lang || null,
    meta: {
      ...extractAttribution(),
      ...(meta || {}),
    },
  };

  const nextQueue = [...readQueue(), event].slice(-MAX_QUEUE_SIZE);
  writeQueue(nextQueue);
  void scheduleFlush();
}
