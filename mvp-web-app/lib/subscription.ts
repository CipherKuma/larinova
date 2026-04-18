import { createClient } from '@/lib/supabase/server';
import { AIFeature, FREE_TIER_LIMITS, Subscription, UsageCheck } from '@/types/billing';

export async function getSubscription(doctorId: string): Promise<Subscription | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('larinova_subscriptions')
    .select('*')
    .eq('doctor_id', doctorId)
    .single();
  return data as Subscription | null;
}

export async function getUsageCount(doctorId: string, feature: AIFeature): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from('larinova_ai_usage')
    .select('*', { count: 'exact', head: true })
    .eq('doctor_id', doctorId)
    .eq('feature', feature);
  return count ?? 0;
}

export async function checkAIUsage(doctorId: string, feature: AIFeature): Promise<UsageCheck> {
  const subscription = await getSubscription(doctorId);
  const plan = subscription?.plan ?? 'free';

  if (plan === 'pro' && subscription?.status === 'active') {
    return { allowed: true, used: 0, limit: Infinity, plan };
  }

  const used = await getUsageCount(doctorId, feature);
  const limit = FREE_TIER_LIMITS[feature];

  return {
    allowed: used < limit,
    used,
    limit,
    plan,
  };
}

export async function recordAIUsage(
  doctorId: string,
  feature: AIFeature,
  consultationId?: string
): Promise<void> {
  const supabase = await createClient();
  await supabase.from('larinova_ai_usage').insert({
    doctor_id: doctorId,
    feature,
    consultation_id: consultationId ?? null,
  });
}
