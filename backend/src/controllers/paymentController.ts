import { Request, Response } from 'express';
import { createPayment, getPayment, CREDIT_PACKAGES } from '../services/mollieService.js';
import {
  createPaymentRecord,
  updatePaymentStatus,
  getPaymentByMollieId,
  addCreditsToUser,
  getUserCredits,
  getUserPayments
} from '../services/paymentService.js';
import { env } from '../config/env.js';

export async function createCheckout(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { packageId } = req.body;

    if (!packageId || !CREDIT_PACKAGES[packageId]) {
      return res.status(400).json({ error: 'Invalid package ID' });
    }

    const creditPackage = CREDIT_PACKAGES[packageId];
    const redirectUrl = `${env.FRONTEND_URL}/dashboard?payment=success`;
    const webhookUrl = `${env.FRONTEND_URL.replace('5173', '3000')}/api/payments/webhook`;

    console.log('Creating payment with:', {
      userId,
      packageId,
      redirectUrl,
      webhookUrl,
      mollieKey: env.MOLLIE_API_KEY ? 'SET' : 'NOT SET'
    });

    // Create Mollie payment
    const payment = await createPayment(userId, packageId, redirectUrl, webhookUrl);

    // Store payment in database
    await createPaymentRecord(
      userId,
      creditPackage.price,
      creditPackage.credits,
      payment.id,
      payment._links.checkout?.href || ''
    );

    res.json({
      checkoutUrl: payment._links.checkout?.href,
      paymentId: payment.id
    });
  } catch (error) {
    console.error('Create checkout error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    console.error('Error details:', { errorMessage, errorStack });
    res.status(500).json({ error: 'Failed to create payment', details: errorMessage });
  }
}

export async function handleWebhook(req: Request, res: Response) {
  try {
    const { id: paymentId } = req.body;

    if (!paymentId) {
      return res.status(400).json({ error: 'Missing payment ID' });
    }

    // Get payment from Mollie
    const molliePayment = await getPayment(paymentId);

    // Get payment record from database
    const paymentRecord = await getPaymentByMollieId(paymentId);

    if (!paymentRecord) {
      console.error(`Payment record not found for Mollie ID: ${paymentId}`);
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Update payment status
    await updatePaymentStatus(paymentId, molliePayment.status);

    // If payment is paid, add credits to user
    if (molliePayment.status === 'paid' && paymentRecord.status !== 'paid') {
      await addCreditsToUser(paymentRecord.user_id, paymentRecord.credits_purchased);
      console.log(`Added ${paymentRecord.credits_purchased} credits to user ${paymentRecord.user_id}`);
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

export async function getCredits(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const credits = await getUserCredits(userId);
    res.json({ credits });
  } catch (error) {
    console.error('Get credits error:', error);
    res.status(500).json({ error: 'Failed to get credits' });
  }
}

export async function getPaymentHistory(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const payments = await getUserPayments(userId);
    res.json({ payments });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ error: 'Failed to get payment history' });
  }
}

export async function getPackages(req: Request, res: Response) {
  try {
    res.json({ packages: CREDIT_PACKAGES });
  } catch (error) {
    console.error('Get packages error:', error);
    res.status(500).json({ error: 'Failed to get packages' });
  }
}

export async function confirmPayment(req: Request, res: Response) {
  try {
    const { paymentId } = req.params;

    // Get payment from Mollie to check status
    const molliePayment = await getPayment(paymentId);

    // Get payment record from database
    const paymentRecord = await getPaymentByMollieId(paymentId);

    if (!paymentRecord) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Update payment status
    await updatePaymentStatus(paymentId, molliePayment.status);

    // If payment is paid, add credits to user
    if (molliePayment.status === 'paid' && paymentRecord.status !== 'paid') {
      await addCreditsToUser(paymentRecord.user_id, paymentRecord.credits_purchased);
      console.log(`Added ${paymentRecord.credits_purchased} credits to user ${paymentRecord.user_id}`);

      res.json({
        success: true,
        message: 'Credits added successfully',
        credits: paymentRecord.credits_purchased
      });
    } else {
      res.json({
        success: false,
        message: `Payment status: ${molliePayment.status}`,
        status: molliePayment.status
      });
    }
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
}
