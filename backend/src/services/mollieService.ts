import { createMollieClient, Payment, PaymentStatus } from '@mollie/api-client';
import { env } from '../config/env.js';

if (!env.MOLLIE_API_KEY) {
  console.warn('WARNING: MOLLIE_API_KEY is not set. Payment functionality will not work.');
}

const mollieClient = createMollieClient({ apiKey: env.MOLLIE_API_KEY || 'test_missing_key' });

export interface CreditPackage {
  credits: number;
  price: number;
  description: string;
}

export const CREDIT_PACKAGES: Record<string, CreditPackage> = {
  '1': {
    credits: 1,
    price: 1.50,
    description: '1 video upload'
  },
  '3': {
    credits: 3,
    price: 4.00,
    description: '3 video uploads'
  },
  '10': {
    credits: 10,
    price: 12.50,
    description: '10 video uploads'
  }
};

export async function createPayment(
  userId: string,
  packageId: string,
  redirectUrl: string,
  webhookUrl: string
): Promise<Payment> {
  const creditPackage = CREDIT_PACKAGES[packageId];

  if (!creditPackage) {
    throw new Error('Invalid package ID');
  }

  if (!env.MOLLIE_API_KEY) {
    throw new Error('Mollie API key is not configured');
  }

  console.log('Creating Mollie payment:', {
    amount: creditPackage.price.toFixed(2),
    description: `FlavorSwipe - ${creditPackage.description}`,
    redirectUrl,
    webhookUrl: webhookUrl.includes('localhost') ? 'SKIPPED (localhost)' : webhookUrl
  });

  try {
    // Create payment object - skip webhook for localhost
    const paymentData: any = {
      amount: {
        currency: 'EUR',
        value: creditPackage.price.toFixed(2)
      },
      description: `FlavorSwipe - ${creditPackage.description}`,
      redirectUrl,
      metadata: {
        userId,
        packageId,
        credits: creditPackage.credits.toString()
      }
    };

    // Only add webhook if NOT localhost (for production)
    if (!webhookUrl.includes('localhost')) {
      paymentData.webhookUrl = webhookUrl;
    } else {
      console.log('Skipping webhook URL (localhost detected) - you will need to manually confirm payments in test mode');
    }

    const payment = await mollieClient.payments.create(paymentData);

    console.log('Mollie payment created:', payment.id);
    return payment;
  } catch (error) {
    console.error('Mollie API error:', error);
    throw error;
  }
}

export async function getPayment(paymentId: string): Promise<Payment> {
  return await mollieClient.payments.get(paymentId);
}

export async function isPaymentPaid(paymentId: string): Promise<boolean> {
  const payment = await getPayment(paymentId);
  return payment.status === PaymentStatus.paid;
}
