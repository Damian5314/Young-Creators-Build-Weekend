import { Router } from 'express';
import * as recipeController from '../controllers/recipeController';
import { authMiddleware, optionalAuth } from '../middleware';

const router = Router();

// Public routes
router.get('/', recipeController.getRecipes);
router.get('/:id', recipeController.getRecipeById);

// Generate recipes (optional auth - saves to user if authenticated)
router.post('/generate', optionalAuth, recipeController.generateRecipes);

// Protected routes
router.get('/user/me', authMiddleware, recipeController.getUserRecipes);
router.post('/', authMiddleware, recipeController.createRecipe);
router.delete('/:id', authMiddleware, recipeController.deleteRecipe);

export default router;
