import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import * as videoService from '../services/videoService';

export async function getVideos(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const filters = {
      restaurantId: req.query.restaurantId as string,
      tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
    };

    const result = await videoService.getVideos({ page, limit }, filters);

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getVideoById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const video = await videoService.getVideoById(id);

    res.json({ success: true, data: video });
  } catch (error) {
    next(error);
  }
}

export async function getFeed(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const videos = await videoService.getFeedVideos(req.user?.id, limit);

    res.json({ success: true, data: videos });
  } catch (error) {
    next(error);
  }
}

export async function recordView(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    await videoService.incrementVideoView(id);

    const authReq = req as AuthenticatedRequest;
    if (authReq.user) {
      await videoService.recordSwipe(authReq.user.id, id, 'VIDEO', 'VIEW');
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

export async function likeVideo(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    await videoService.likeVideo(id, req.user!.id);
    await videoService.recordSwipe(req.user!.id, id, 'VIDEO', 'LIKE');

    res.json({ success: true, message: 'Video liked' });
  } catch (error) {
    next(error);
  }
}

export async function unlikeVideo(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    await videoService.unlikeVideo(id, req.user!.id);

    res.json({ success: true, message: 'Video unliked' });
  } catch (error) {
    next(error);
  }
}

export async function swipeVideo(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { action } = req.body;

    if (!['LIKE', 'DISLIKE'].includes(action)) {
      res.status(400).json({ success: false, error: 'Invalid action' });
      return;
    }

    await videoService.recordSwipe(req.user!.id, id, 'VIDEO', action);

    if (action === 'LIKE') {
      await videoService.likeVideo(id, req.user!.id).catch(() => {});
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}
