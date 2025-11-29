import { Router } from 'express';
import * as restaurantController from '../controllers/restaurantController';
import { authMiddleware } from '../middleware';

const router = Router();

// Public routes
router.get('/', restaurantController.getRestaurants);
router.get('/nearby', restaurantController.getNearbyRestaurants);
router.get('/:id', restaurantController.getRestaurantById);

// Protected routes (for restaurant owners)
router.post('/', authMiddleware, restaurantController.createRestaurant);
router.put('/:id', authMiddleware, restaurantController.updateRestaurant);
router.patch('/:id', authMiddleware, restaurantController.updateRestaurant);

export default router;
