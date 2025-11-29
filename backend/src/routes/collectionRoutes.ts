import { Router } from 'express';
import * as collectionController from '../controllers/collectionController';
import { authMiddleware } from '../middleware';

const router = Router();

// All collection routes require authentication
router.use(authMiddleware);

router.get('/', collectionController.getCollections);
router.get('/:id', collectionController.getCollectionById);
router.post('/', collectionController.createCollection);
router.delete('/:id', collectionController.deleteCollection);

// Collection items
router.post('/:id/items', collectionController.addItem);
router.delete('/:id/items/:itemId', collectionController.removeItem);

export default router;
