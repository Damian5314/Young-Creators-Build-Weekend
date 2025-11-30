import { Router } from 'express';
import {
  createCheckout,
  handleWebhook,
  getCredits,
  getPaymentHistory,
  getPackages,
  confirmPayment
} from '../controllers/paymentController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Get available credit packages (public)
router.get('/packages', getPackages);

// Create payment checkout (requires auth)
router.post('/checkout', authMiddleware, createCheckout);

// Get user credits (requires auth)
router.get('/credits', authMiddleware, getCredits);

// Get payment history (requires auth)
router.get('/history', authMiddleware, getPaymentHistory);

// Confirm payment manually (for development/testing)
router.post('/confirm/:paymentId', confirmPayment);

// Mollie webhook (no auth - verified by Mollie)
router.post('/webhook', handleWebhook);

export default router;
