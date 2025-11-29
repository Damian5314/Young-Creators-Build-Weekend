import express from 'express';
import { generateRecipes } from '../controllers/aiChefController';

const router = express.Router();

router.post('/generate', generateRecipes);

export default router;
