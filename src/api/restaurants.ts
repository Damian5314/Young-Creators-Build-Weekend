// Restaurant API calls
import api from './client';

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
  created_at?: string;
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

interface RestaurantFilters {
  city?: string;
  halal?: boolean;
  cuisine?: string;
  minRating?: number;
  maxPrice?: number;
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
    if (filters.minRating) params.append('minRating', String(filters.minRating));
    if (filters.maxPrice) params.append('maxPrice', String(filters.maxPrice));

    return api.get<RestaurantsResponse>(`/restaurants?${params}`);
  },

  // Get restaurant by ID
  getById: (id: string) =>
    api.get<{ success: boolean; data: Restaurant }>(`/restaurants/${id}`),

  // Get nearby restaurants
  getNearby: (lat: number, lng: number, radius = 10, limit = 20) =>
    api.get<{ success: boolean; data: Restaurant[] }>(
      `/restaurants/nearby?lat=${lat}&lng=${lng}&radius=${radius}&limit=${limit}`
    ),

  // Create restaurant (owner only)
  create: (restaurant: Omit<Restaurant, 'id'>, token: string) =>
    api.post<{ success: boolean; data: Restaurant }>('/restaurants', restaurant, token),

  // Update restaurant (owner only)
  update: (id: string, updates: Partial<Restaurant>, token: string) =>
    api.put<{ success: boolean; data: Restaurant }>(`/restaurants/${id}`, updates, token),
};
