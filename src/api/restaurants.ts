// Restaurant API calls - GPS-based system
import api from './client';

// n8n webhook URL for triggering restaurant scraping
const N8N_WEBHOOK_URL = 'https://wishh.app.n8n.cloud/webhook/860456af-46ea-45cd-ae77-a3a4f1e0ac96';

export interface Restaurant {
  id: string;
  name: string;
  description?: string;
  address?: string;
  city: string;
  latitude: number;
  longitude: number;
  cuisine_types?: string[];
  halal?: boolean;
  price_level?: number;
  average_rating?: number;
  image_url?: string;
  opening_hours?: string;
  owner_id?: string;
  place_id?: string;
  created_at?: string;
  updated_at?: string;
  // Added by nearby query
  distance?: number;
}

// Restaurant formatted for map display
export interface MapRestaurant {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  rating: number | null;
  category: string;
  distanceKm?: number;
}

interface RestaurantsResponse {
  success: boolean;
  data: {
    restaurants: Restaurant[];
    total: number;
    page: number;
    limit: number;
  };
}

interface NearbyRestaurantsResponse {
  success: boolean;
  data: Restaurant[];
}

interface MapRestaurantsResponse {
  success: boolean;
  data: MapRestaurant[];
}

interface ScrapeResponse {
  success: boolean;
  message: string;
  data: {
    coordinates: { lat: number; lng: number };
    status: string;
  };
}

interface RestaurantFilters {
  city?: string;
  halal?: boolean;
  cuisine?: string;
  category?: string;
  minRating?: number;
  maxPrice?: number;
  search?: string;
}

export const restaurantsApi = {
  // Get all restaurants with filters
  getAll: (page = 1, limit = 20, filters: RestaurantFilters = {}) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    if (filters.city) params.append('city', filters.city);
    if (filters.halal !== undefined) params.append('halal', String(filters.halal));
    if (filters.cuisine) params.append('cuisine', filters.cuisine);
    if (filters.category) params.append('category', filters.category);
    if (filters.minRating) params.append('minRating', String(filters.minRating));
    if (filters.maxPrice) params.append('maxPrice', String(filters.maxPrice));
    if (filters.search) params.append('search', filters.search);

    return api.get<RestaurantsResponse>(`/restaurants?${params}`);
  },

  // Get restaurant by ID
  getById: (id: string) =>
    api.get<{ success: boolean; data: Restaurant }>(`/restaurants/${id}`),

  // Get nearby restaurants within radius (uses Haversine formula)
  getNearby: (lat: number, lng: number, radius = 5, limit = 20) =>
    api.get<NearbyRestaurantsResponse>(
      `/restaurants/nearby?lat=${lat}&lng=${lng}&radius=${radius}&limit=${limit}`
    ),

  // Get restaurants formatted for map display
  getForMap: (filters: RestaurantFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.city) params.append('city', filters.city);
    if (filters.category) params.append('category', filters.category);
    if (filters.minRating) params.append('minRating', String(filters.minRating));
    if (filters.search) params.append('search', filters.search);

    const queryString = params.toString();
    return api.get<MapRestaurantsResponse>(`/restaurants/map${queryString ? `?${queryString}` : ''}`);
  },

  // Trigger n8n scraping workflow with GPS coordinates
  // This sends the user's location to n8n, which triggers Apify to scrape
  // nearby restaurants from Google Maps
  triggerScrape: (lat: number, lng: number) =>
    api.post<ScrapeResponse>('/restaurants/scrape', { lat, lng }),

  // Direct call to n8n webhook (alternative method)
  // Use this if you want to bypass the backend and call n8n directly
  triggerN8nDirectly: async (lat: number, lng: number): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lat, lng }),
      });

      if (!response.ok) {
        throw new Error(`n8n webhook failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        message: data.message || 'Scraping gestart'
      };
    } catch (error) {
      console.error('n8n webhook error:', error);
      return {
        success: false,
        message: String(error)
      };
    }
  },

  // Create restaurant (owner only)
  create: (restaurant: Omit<Restaurant, 'id'>, token: string) =>
    api.post<{ success: boolean; data: Restaurant }>('/restaurants', restaurant, token),

  // Update restaurant (owner only)
  update: (id: string, updates: Partial<Restaurant>, token: string) =>
    api.put<{ success: boolean; data: Restaurant }>(`/restaurants/${id}`, updates, token),
};
