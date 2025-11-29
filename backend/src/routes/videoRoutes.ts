import { Router } from 'express';
import * as videoController from '../controllers/videoController';
import { authMiddleware, optionalAuth } from '../middleware';

const router = Router();

// Public routes
router.get('/', videoController.getVideos);
router.get('/feed', optionalAuth, videoController.getFeed);
router.get('/:id', videoController.getVideoById);
router.post('/:id/view', optionalAuth, videoController.recordView);

// Protected routes
router.post('/:id/like', authMiddleware, videoController.likeVideo);
router.delete('/:id/like', authMiddleware, videoController.unlikeVideo);
router.post('/:id/swipe', authMiddleware, videoController.swipeVideo);

export default router;
