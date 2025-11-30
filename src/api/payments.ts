import { supabase } from '@/integrations/supabase/client';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface CreditPackage {
  credits: number;
  price: number;
  description: string;
}

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

async function getAuthToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }

  return data;
}

export const paymentsApi = {
  getPackages: async (): Promise<Record<string, CreditPackage>> => {
    const response = await apiRequest<{ packages: Record<string, CreditPackage> }>('/payments/packages');
    return response.packages;
  },

  createCheckout: async (packageId: string): Promise<{ checkoutUrl: string; paymentId: string }> => {
    const response = await apiRequest<{ checkoutUrl: string; paymentId: string }>('/payments/checkout', {
      method: 'POST',
      body: JSON.stringify({ packageId }),
    });
    return response;
  },

  getCredits: async (): Promise<number> => {
    const response = await apiRequest<{ credits: number }>('/payments/credits');
    return response.credits;
  },

  getPaymentHistory: async (): Promise<Payment[]> => {
    const response = await apiRequest<{ payments: Payment[] }>('/payments/history');
    return response.payments;
  }
};
