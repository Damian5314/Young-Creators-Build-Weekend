import { Router } from 'express';
import * as restaurantController from '../controllers/restaurantController';
import { authMiddleware } from '../middleware';

const router = Router();

// =====================================================
// PUBLIC ROUTES - GPS-based restaurant system
// =====================================================

// GET /api/restaurants - Get all restaurants with filters
router.get('/', restaurantController.getRestaurants);

// GET /api/restaurants/nearby?lat=XX&lng=YY - Get restaurants within radius (Haversine)
router.get('/nearby', restaurantController.getNearbyRestaurants);

// GET /api/restaurants/map - Get restaurants formatted for map display
router.get('/map', restaurantController.getRestaurantsForMap);

// =====================================================
// n8n WEBHOOK ENDPOINTS
// =====================================================

// POST /api/restaurants/import - Receive restaurants from n8n (after Apify scrape)
// Body: { restaurants: [...] } or [...]
router.post('/import', restaurantController.importRestaurants);

// POST /api/restaurants/scrape - Trigger n8n scraping with GPS coordinates
// Body: { lat: number, lng: number }
// This sends GPS to n8n which triggers Apify Google Maps scraper
router.post('/scrape', restaurantController.triggerScrape);

// =====================================================
// SINGLE RESTAURANT
// =====================================================

// GET /api/restaurants/:id - Get single restaurant by ID
// (must be after /map, /import, /scrape to avoid matching)
router.get('/:id', restaurantController.getRestaurantById);

// =====================================================
// PROTECTED ROUTES (for restaurant owners)
// =====================================================

router.post('/', authMiddleware, restaurantController.createRestaurant);
router.put('/:id', authMiddleware, restaurantController.updateRestaurant);
router.patch('/:id', authMiddleware, restaurantController.updateRestaurant);

export default router;
