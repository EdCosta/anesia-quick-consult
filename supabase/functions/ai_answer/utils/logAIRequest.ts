import type { SupabaseClient } from 'npm:@supabase/supabase-js@2.97.0';

type LogAIRequestInput = {
  adminClient: SupabaseClient;
  userId: string;
  threadId: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  flags: string[];
  piiDetected: boolean;
};

export async function logAIRequest(input: LogAIRequestInput): Promise<void> {
  const { error } = await input.adminClient.from('ai_logs').insert({
    user_id: input.userId,
    thread_id: input.threadId,
    model: input.model,
    prompt_tokens: input.promptTokens,
    completion_tokens: input.completionTokens,
    total_tokens: input.totalTokens,
    flags: input.flags,
    pii_detected: input.piiDetected,
  });

  if (error) {
    throw new Error(`Failed to write AI log: ${error.message}`);
  }
}
