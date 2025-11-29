import { Router } from 'express';
import recipeRoutes from './recipeRoutes';
import restaurantRoutes from './restaurantRoutes';
import videoRoutes from './videoRoutes';
import collectionRoutes from './collectionRoutes';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
router.use('/recipes', recipeRoutes);
router.use('/restaurants', restaurantRoutes);
router.use('/videos', videoRoutes);
router.use('/collections', collectionRoutes);

export default router;
