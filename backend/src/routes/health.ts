<<<<<<< HEAD
import { Router, Request, Response } from 'express';

const router = Router();
=======
import express, { Request, Response } from 'express';

const router = express.Router();
>>>>>>> ca3732cde5b819f32ae9000d964b2db97f0474e3

router.get('/', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
