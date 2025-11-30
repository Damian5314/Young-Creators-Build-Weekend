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
      category: req.query.category as string,
      minRating: req.query.minRating ? parseFloat(req.query.minRating as string) : undefined,
      maxPrice: req.query.maxPrice ? parseInt(req.query.maxPrice as string) : undefined,
      search: req.query.search as string,
    };

    const result = await restaurantService.getRestaurants({ page, limit }, filters);

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

// GET /api/restaurants/map - Get restaurants formatted for map display
export async function getRestaurantsForMap(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const filters = {
      city: req.query.city as string,
      category: req.query.category as string,
      minRating: req.query.minRating ? parseFloat(req.query.minRating as string) : undefined,
      search: req.query.search as string,
    };

    const restaurants = await restaurantService.getRestaurantsForMap(filters);

    res.json({ success: true, data: restaurants });
  } catch (error) {
    next(error);
  }
}

// POST /api/restaurants/import - n8n webhook endpoint for bulk import
export async function importRestaurants(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Support both array directly and { restaurants: [...] } format
    let restaurants = req.body;
    if (req.body.restaurants && Array.isArray(req.body.restaurants)) {
      restaurants = req.body.restaurants;
    }

    // Validate input is an array
    if (!Array.isArray(restaurants)) {
      res.status(400).json({
        success: false,
        error: 'Request body must be an array of restaurants or { restaurants: [...] }'
      });
      return;
    }

    if (restaurants.length === 0) {
      res.status(400).json({
        success: false,
        error: 'No restaurants provided'
      });
      return;
    }

    // Validate each restaurant has at least a name
    const invalid = restaurants.filter((r: { name?: string }) => !r.name);
    if (invalid.length > 0) {
      res.status(400).json({
        success: false,
        error: `${invalid.length} restaurant(s) missing required 'name' field`
      });
      return;
    }

    const result = await restaurantService.bulkImportRestaurants(restaurants);

    res.status(201).json({
      success: true,
      message: `Import completed`,
      data: {
        imported: result.imported,
        updated: result.updated,
        duplicates: result.duplicates,
        errors: result.errors.length > 0 ? result.errors : undefined
      }
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/restaurants/scrape - Trigger n8n scraping with GPS coordinates
export async function triggerScrape(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { lat, lng } = req.body;

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      res.status(400).json({
        success: false,
        error: 'Valid lat and lng coordinates are required'
      });
      return;
    }

    // Validate coordinate ranges
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      res.status(400).json({
        success: false,
        error: 'Invalid coordinate values'
      });
      return;
    }

    const result = await restaurantService.triggerN8nScraping(lat, lng);

    res.json({
      success: result.success,
      message: result.message,
      data: {
        coordinates: { lat, lng },
        status: 'scraping_started'
      }
    });
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
