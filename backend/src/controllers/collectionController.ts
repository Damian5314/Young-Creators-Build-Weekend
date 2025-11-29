import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import * as collectionService from '../services/collectionService';

export async function getCollections(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const collections = await collectionService.getUserCollections(req.user!.id);

    res.json({ success: true, data: collections });
  } catch (error) {
    next(error);
  }
}

export async function getCollectionById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const collection = await collectionService.getCollectionById(id, req.user!.id);

    res.json({ success: true, data: collection });
  } catch (error) {
    next(error);
  }
}

export async function createCollection(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name, type } = req.body;

    if (!name || !type) {
      res.status(400).json({ success: false, error: 'Name and type are required' });
      return;
    }

    const collection = await collectionService.createCollection(name, type, req.user!.id);

    res.status(201).json({ success: true, data: collection });
  } catch (error) {
    next(error);
  }
}

export async function deleteCollection(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    await collectionService.deleteCollection(id, req.user!.id);

    res.json({ success: true, message: 'Collection deleted' });
  } catch (error) {
    next(error);
  }
}

export async function addItem(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { itemId, itemType } = req.body;

    if (!itemId || !itemType) {
      res.status(400).json({ success: false, error: 'itemId and itemType are required' });
      return;
    }

    const item = await collectionService.addItemToCollection(
      id,
      itemId,
      itemType,
      req.user!.id
    );

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
}

export async function removeItem(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id, itemId } = req.params;
    await collectionService.removeItemFromCollection(id, itemId, req.user!.id);

    res.json({ success: true, message: 'Item removed' });
  } catch (error) {
    next(error);
  }
}
