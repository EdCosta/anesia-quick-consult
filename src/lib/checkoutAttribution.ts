export function buildCheckoutPath(source: string, extras?: Record<string, string | null | undefined>) {
  const params = new URLSearchParams();
  params.set('source', source);

  for (const [key, value] of Object.entries(extras || {})) {
    if (value) params.set(key, value);
  }

  return `/pro/checkout?${params.toString()}`;
}
