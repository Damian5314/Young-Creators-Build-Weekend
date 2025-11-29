<<<<<<< HEAD
import { Router } from 'express';
import { generateRecipes } from '../controllers/aiChefController';

const router = Router();
=======
import express from 'express';
import { generateRecipes } from '../controllers/aiChefController';

const router = express.Router();
>>>>>>> ca3732cde5b819f32ae9000d964b2db97f0474e3

router.post('/generate', generateRecipes);

export default router;
