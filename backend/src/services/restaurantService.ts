import { supabase } from '../config/supabase';
import { Restaurant, PaginationParams } from '../types';
import { AppError } from '../middleware/errorHandler';

interface RestaurantFilters {
  city?: string;
  halal?: boolean;
  cuisine?: string;
  minRating?: number;
  maxPrice?: number;
}

export async function getRestaurants(
  params: PaginationParams = {},
  filters: RestaurantFilters = {}
) {
  const { page = 1, limit = 20 } = params;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('restaurants')
    .select('*', { count: 'exact' });

  // Apply filters
  if (filters.city) {
    query = query.ilike('city', `%${filters.city}%`);
  }
  if (filters.halal !== undefined) {
    query = query.eq('halal', filters.halal);
  }
  if (filters.minRating) {
    query = query.gte('average_rating', filters.minRating);
  }
  if (filters.maxPrice) {
    query = query.lte('price_level', filters.maxPrice);
  }
  if (filters.cuisine) {
    query = query.contains('cuisine_types', [filters.cuisine]);
  }

  const { data, error, count } = await query
    .order('average_rating', { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new AppError(`Failed to fetch restaurants: ${error.message}`, 500);
  }

  return {
    restaurants: data || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

export async function getRestaurantById(id: string) {
  const { data, error } = await supabase
    .from('restaurants')
    .select(`
      *,
      videos (*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    throw new AppError(`Restaurant not found: ${error.message}`, 404);
  }

  return data;
}

export async function getNearbyRestaurants(
  latitude: number,
  longitude: number,
  radiusKm: number = 10,
  limit: number = 20
) {
  // Simple distance calculation using Haversine approximation
  // For production, use PostGIS or a proper geospatial query
  const latDiff = radiusKm / 111; // ~111km per degree latitude
  const lonDiff = radiusKm / (111 * Math.cos(latitude * Math.PI / 180));

  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .gte('latitude', latitude - latDiff)
    .lte('latitude', latitude + latDiff)
    .gte('longitude', longitude - lonDiff)
    .lte('longitude', longitude + lonDiff)
    .limit(limit);

  if (error) {
    throw new AppError(`Failed to fetch nearby restaurants: ${error.message}`, 500);
  }

  // Calculate actual distances and sort
  const withDistances = (data || []).map(restaurant => ({
    ...restaurant,
    distance: calculateDistance(
      latitude,
      longitude,
      restaurant.latitude,
      restaurant.longitude
    ),
  }));

  return withDistances
    .filter(r => r.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function createRestaurant(restaurant: Omit<Restaurant, 'id'>, ownerId: string) {
  const { data, error } = await supabase
    .from('restaurants')
    .insert({
      ...restaurant,
      owner_id: ownerId,
    })
    .select()
    .single();

  if (error) {
    throw new AppError(`Failed to create restaurant: ${error.message}`, 500);
  }

  return data;
}

export async function updateRestaurant(
  id: string,
  updates: Partial<Restaurant>,
  ownerId: string
) {
  const { data, error } = await supabase
    .from('restaurants')
    .update(updates)
    .eq('id', id)
    .eq('owner_id', ownerId)
    .select()
    .single();

  if (error) {
    throw new AppError(`Failed to update restaurant: ${error.message}`, 500);
  }

  return data;
}
