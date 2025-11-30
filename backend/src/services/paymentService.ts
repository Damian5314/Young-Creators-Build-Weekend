import { supabase } from '../config/supabase.js';

export interface Payment {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  credits_purchased: number;
  status: string;
  mollie_payment_id: string | null;
  mollie_checkout_url: string | null;
  created_at: string;
  updated_at: string;
}

export async function createPaymentRecord(
  userId: string,
  amount: number,
  creditsPurchased: number,
  molliePaymentId: string,
  checkoutUrl: string
): Promise<Payment> {
  const { data, error } = await supabase
    .from('payments')
    .insert({
      user_id: userId,
      amount,
      currency: 'EUR',
      credits_purchased: creditsPurchased,
      status: 'pending',
      mollie_payment_id: molliePaymentId,
      mollie_checkout_url: checkoutUrl
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create payment record: ${error.message}`);
  }

  return data;
}

export async function updatePaymentStatus(
  molliePaymentId: string,
  status: string
): Promise<void> {
  const { error } = await supabase
    .from('payments')
    .update({ status })
    .eq('mollie_payment_id', molliePaymentId);

  if (error) {
    throw new Error(`Failed to update payment status: ${error.message}`);
  }
}

export async function getPaymentByMollieId(
  molliePaymentId: string
): Promise<Payment | null> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('mollie_payment_id', molliePaymentId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to get payment: ${error.message}`);
  }

  return data;
}

export async function addCreditsToUser(
  userId: string,
  credits: number
): Promise<void> {
  const { error } = await supabase.rpc('increment_user_credits', {
    p_user_id: userId,
    p_credits: credits
  });

  if (error) {
    // Fallback if function doesn't exist - direct update
    const { data: profile } = await supabase
      .from('profiles')
      .select('video_credits')
      .eq('id', userId)
      .single();

    const currentCredits = profile?.video_credits || 0;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ video_credits: currentCredits + credits })
      .eq('id', userId);

    if (updateError) {
      throw new Error(`Failed to add credits: ${updateError.message}`);
    }
  }
}

export async function getUserCredits(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('profiles')
    .select('video_credits')
    .eq('id', userId)
    .single();

  if (error) {
    throw new Error(`Failed to get user credits: ${error.message}`);
  }

  return data?.video_credits || 0;
}

export async function decrementUserCredits(userId: string): Promise<boolean> {
  const currentCredits = await getUserCredits(userId);

  if (currentCredits <= 0) {
    return false;
  }

  const { error } = await supabase
    .from('profiles')
    .update({ video_credits: currentCredits - 1 })
    .eq('id', userId);

  if (error) {
    throw new Error(`Failed to decrement credits: ${error.message}`);
  }

  return true;
}

export async function getUserPayments(userId: string): Promise<Payment[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to get user payments: ${error.message}`);
  }

  return data || [];
}
