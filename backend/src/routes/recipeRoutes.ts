import { Router } from 'express';
import * as recipeController from '../controllers/recipeController';
import { authMiddleware, optionalAuth } from '../middleware';

const router = Router();

// Public routes
router.get('/', recipeController.getRecipes);
router.post('/generate', optionalAuth, recipeController.generateRecipes);
router.post('/:id/chat', recipeController.chatAboutRecipe);

// Protected routes
router.get('/user/me', authMiddleware, recipeController.getUserRecipes);
router.post('/', authMiddleware, recipeController.createRecipe);
router.delete('/:id', authMiddleware, recipeController.deleteRecipe);
router.get('/:id', recipeController.getRecipeById);

export default router;
