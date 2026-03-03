import type { SupabaseClient } from 'npm:@supabase/supabase-js@2.97.0';

type RateLimitOptions = {
  maxRequests: number;
  windowMs: number;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: string;
  used: number;
};

export async function rateLimitCheck(
  adminClient: SupabaseClient,
  userId: string,
  options: RateLimitOptions,
): Promise<RateLimitResult> {
  const windowStart = new Date(Date.now() - options.windowMs).toISOString();
  const resetAt = new Date(Date.now() + options.windowMs).toISOString();

  const { count, error } = await adminClient
    .from('ai_logs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', windowStart);

  if (error) {
    throw new Error(`Rate limit lookup failed: ${error.message}`);
  }

  const used = count ?? 0;
  const remaining = Math.max(options.maxRequests - used, 0);

  return {
    allowed: used < options.maxRequests,
    remaining,
    resetAt,
    used,
  };
}
