const GENERIC_NON_2XX_MESSAGE = 'Edge Function returned a non-2xx status code';

function readPayloadMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;

  const record = payload as Record<string, unknown>;
  if (typeof record.error === 'string' && record.error.trim()) return record.error.trim();
  if (typeof record.message === 'string' && record.message.trim()) return record.message.trim();

  return null;
}

export async function resolveEdgeFunctionErrorMessage(
  error: unknown,
  fallbackMessage: string,
): Promise<string> {
  const context =
    error && typeof error === 'object' && 'context' in error
      ? (error as { context?: unknown }).context
      : null;

  if (context && typeof context === 'object') {
    const response = context as {
      clone?: () => unknown;
      json?: () => Promise<unknown>;
      text?: () => Promise<string>;
    };
    const readable = (typeof response.clone === 'function' ? response.clone() : response) as {
      json?: () => Promise<unknown>;
      text?: () => Promise<string>;
    };

    if (typeof readable.json === 'function') {
      try {
        const payload = await readable.json();
        const payloadMessage = readPayloadMessage(payload);
        if (payloadMessage) return payloadMessage;
      } catch {
        // ignore parse errors and try text fallback
      }
    }

    if (typeof readable.text === 'function') {
      try {
        const textPayload = (await readable.text()).trim();
        if (textPayload) {
          const asJson = (() => {
            try {
              return JSON.parse(textPayload) as unknown;
            } catch {
              return null;
            }
          })();
          const payloadMessage = readPayloadMessage(asJson);
          if (payloadMessage) return payloadMessage;
          return textPayload;
        }
      } catch {
        // ignore text parse failures and continue to generic message
      }
    }
  }

  if (error instanceof Error && error.message && error.message !== GENERIC_NON_2XX_MESSAGE) {
    return error.message;
  }

  return fallbackMessage;
}
