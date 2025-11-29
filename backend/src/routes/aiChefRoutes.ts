import { Router } from 'express';
import { generateRecipes } from '../controllers/aiChefController';

const router = Router();

router.post('/generate', generateRecipes);

export default router;
