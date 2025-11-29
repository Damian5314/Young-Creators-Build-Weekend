import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import * as restaurantService from '../services/restaurantService';

export async function getRestaurants(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const filters = {
      city: req.query.city as string,
      halal: req.query.halal === 'true' ? true : req.query.halal === 'false' ? false : undefined,
      cuisine: req.query.cuisine as string,
      minRating: req.query.minRating ? parseFloat(req.query.minRating as string) : undefined,
      maxPrice: req.query.maxPrice ? parseInt(req.query.maxPrice as string) : undefined,
    };

    const result = await restaurantService.getRestaurants({ page, limit }, filters);

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getRestaurantById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const restaurant = await restaurantService.getRestaurantById(id);

    res.json({ success: true, data: restaurant });
  } catch (error) {
    next(error);
  }
}

export async function getNearbyRestaurants(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const latitude = parseFloat(req.query.lat as string);
    const longitude = parseFloat(req.query.lng as string);
    const radius = parseFloat(req.query.radius as string) || 10;
    const limit = parseInt(req.query.limit as string) || 20;

    if (isNaN(latitude) || isNaN(longitude)) {
      res.status(400).json({ success: false, error: 'Valid latitude and longitude are required' });
      return;
    }

    const restaurants = await restaurantService.getNearbyRestaurants(
      latitude,
      longitude,
      radius,
      limit
    );

    res.json({ success: true, data: restaurants });
  } catch (error) {
    next(error);
  }
}

export async function createRestaurant(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const restaurant = await restaurantService.createRestaurant(req.body, req.user!.id);

    res.status(201).json({ success: true, data: restaurant });
  } catch (error) {
    next(error);
  }
}

export async function updateRestaurant(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const restaurant = await restaurantService.updateRestaurant(id, req.body, req.user!.id);

    res.json({ success: true, data: restaurant });
  } catch (error) {
    next(error);
  }
}
