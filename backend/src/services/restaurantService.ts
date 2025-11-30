import { supabase } from '../config/supabase';
import { Restaurant, PaginationParams } from '../types';
import { AppError } from '../middleware/errorHandler';

interface RestaurantFilters {
  city?: string;
  halal?: boolean;
  cuisine?: string;
  category?: string;
  minRating?: number;
  maxPrice?: number;
  search?: string;
}

// n8n Restaurant data format (from Apify Google Maps scraper)
// This is the format n8n sends after transforming Apify data
interface N8nRestaurantInput {
  // New GPS-based format from Apify
  id?: string;           // Google Place ID (e.g., "ChIJ123...")
  placeId?: string;      // Alternative field name for Place ID
  name: string;
  address?: string;
  street?: string;       // Legacy field
  city?: string;
  lat?: number;          // New format
  lng?: number;          // New format
  latitude?: number;     // Legacy format
  longitude?: number;    // Legacy format
  phone?: string;
  website?: string;
  category?: string;
  rating?: number;
  reviews?: number;
  url?: string;          // Google Maps URL
  googleUrl?: string;    // Legacy field
}

// Mapper function: safely extract only allowed fields from Apify data
function mapApifyRestaurant(r: N8nRestaurantInput): {
  place_id: string | null;
  name: string;
  address: string | null;
  city: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  website: string | null;
  category: string | null;
  average_rating: number | null;
  reviews_count: number | null;
  google_url: string | null;
  cuisine_types: string[];
} {
  // Extract place ID from various possible fields
  const placeId = r.placeId || r.id || null;

  // Extract coordinates (support both new and legacy formats)
  const lat = r.lat ?? r.latitude ?? 52.3676;
  const lng = r.lng ?? r.longitude ?? 4.9041;

  // Build address from available fields
  const address = r.address || (r.street ? `${r.street}, ${r.city || 'Amsterdam'}` : null);

  // Extract Google URL
  const googleUrl = r.url || r.googleUrl || null;

  return {
    place_id: placeId,
    name: r.name,
    address: address,
    city: r.city || 'Amsterdam',
    latitude: lat,
    longitude: lng,
    phone: r.phone || null,
    website: r.website || null,
    category: r.category || null,
    average_rating: r.rating ?? null,
    reviews_count: r.reviews ?? null,
    google_url: googleUrl,
    cuisine_types: r.category ? [r.category] : []
  };
}

// Bulk import restaurants from n8n webhook (GPS-based system)
export async function bulkImportRestaurants(restaurants: N8nRestaurantInput[]): Promise<{
  imported: number;
  updated: number;
  duplicates: number;
  errors: string[];
}> {
  const results = {
    imported: 0,
    updated: 0,
    duplicates: 0,
    errors: [] as string[]
  };

  console.log(`[Restaurant Import] Starting import of ${restaurants.length} restaurants`);

  for (const restaurant of restaurants) {
    try {
      // Validate required fields
      if (!restaurant.name) {
        results.errors.push(`Restaurant without name skipped`);
        continue;
      }

      // Map the restaurant data safely
      const mapped = mapApifyRestaurant(restaurant);

      // Check for existing restaurant by placeId (primary) or name+city (fallback)
      let existingId: string | null = null;

      if (mapped.place_id) {
        // Check by Google Place ID first (most reliable)
        const { data: byPlaceId } = await supabase
          .from('restaurants')
          .select('id')
          .eq('place_id', mapped.place_id)
          .limit(1);

        if (byPlaceId && byPlaceId.length > 0) {
          existingId = byPlaceId[0].id;
        }
      }

      // Fallback: check by name and city
      if (!existingId) {
        const { data: byName } = await supabase
          .from('restaurants')
          .select('id')
          .ilike('name', mapped.name)
          .ilike('city', mapped.city)
          .limit(1);

        if (byName && byName.length > 0) {
          existingId = byName[0].id;
        }
      }

      if (existingId) {
        // Update existing restaurant
        const { error: updateError } = await supabase
          .from('restaurants')
          .update({
            name: mapped.name,
            address: mapped.address,
            latitude: mapped.latitude,
            longitude: mapped.longitude,
            cuisine_types: mapped.cuisine_types,
            average_rating: mapped.average_rating,
            place_id: mapped.place_id,
            description: [
              mapped.phone ? `Tel: ${mapped.phone}` : null,
              mapped.website ? `Web: ${mapped.website}` : null,
              mapped.reviews_count ? `${mapped.reviews_count} reviews` : null,
              mapped.google_url ? `Google: ${mapped.google_url}` : null
            ].filter(Boolean).join(' | ') || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingId);

        if (updateError) {
          results.errors.push(`Failed to update ${mapped.name}: ${updateError.message}`);
        } else {
          results.updated++;
        }
      } else {
        // Insert new restaurant
        const { error: insertError } = await supabase
          .from('restaurants')
          .insert({
            name: mapped.name,
            address: mapped.address,
            city: mapped.city,
            latitude: mapped.latitude,
            longitude: mapped.longitude,
            cuisine_types: mapped.cuisine_types,
            average_rating: mapped.average_rating,
            place_id: mapped.place_id,
            description: [
              mapped.phone ? `Tel: ${mapped.phone}` : null,
              mapped.website ? `Web: ${mapped.website}` : null,
              mapped.reviews_count ? `${mapped.reviews_count} reviews` : null,
              mapped.google_url ? `Google: ${mapped.google_url}` : null
            ].filter(Boolean).join(' | ') || null,
          });

        if (insertError) {
          results.errors.push(`Failed to insert ${mapped.name}: ${insertError.message}`);
        } else {
          results.imported++;
        }
      }
    } catch (error) {
      results.errors.push(`Error processing ${restaurant.name}: ${String(error)}`);
    }
  }

  console.log(`[Restaurant Import] Complete: ${results.imported} imported, ${results.updated} updated, ${results.errors.length} errors`);
  return results;
}

// Trigger n8n scraping workflow with GPS coordinates
export async function triggerN8nScraping(lat: number, lng: number): Promise<{
  success: boolean;
  message: string;
}> {
  const n8nWebhookUrl = process.env.N8N_RESTAURANT_WEBHOOK_URL ||
    'https://wishh.app.n8n.cloud/webhook/860456af-46ea-45cd-ae77-a3a4f1e0ac96';

  try {
    console.log(`[n8n Trigger] Sending GPS coordinates: lat=${lat}, lng=${lng}`);

    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ lat, lng }),
    });

    if (!response.ok) {
      throw new Error(`n8n webhook failed with status: ${response.status}`);
    }

    const data = await response.json() as { status?: string; message?: string };
    console.log('[n8n Trigger] Response:', data);

    return {
      success: true,
      message: data.message || 'Scraping gestart'
    };
  } catch (error) {
    console.error('[n8n Trigger] Error:', error);
    return {
      success: false,
      message: `Failed to trigger n8n: ${String(error)}`
    };
  }
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
  // Category filter (same as cuisine but for n8n compatibility)
  if (filters.category) {
    query = query.contains('cuisine_types', [filters.category]);
  }
  // Search filter for name
  if (filters.search) {
    query = query.ilike('name', `%${filters.search}%`);
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

// Get restaurants formatted for map display
export async function getRestaurantsForMap(filters: RestaurantFilters = {}) {
  let query = supabase
    .from('restaurants')
    .select('id, name, latitude, longitude, address, average_rating, cuisine_types, city');

  // Apply filters
  if (filters.city) {
    query = query.ilike('city', `%${filters.city}%`);
  }
  if (filters.minRating) {
    query = query.gte('average_rating', filters.minRating);
  }
  if (filters.category) {
    query = query.contains('cuisine_types', [filters.category]);
  }
  if (filters.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }

  const { data, error } = await query
    .order('average_rating', { ascending: false, nullsFirst: false });

  if (error) {
    throw new AppError(`Failed to fetch restaurants for map: ${error.message}`, 500);
  }

  // Transform to map-friendly format
  return (data || []).map(r => ({
    id: r.id,
    name: r.name,
    lat: r.latitude,
    lng: r.longitude,
    address: r.address || `${r.city}`,
    rating: r.average_rating,
    category: r.cuisine_types?.[0] || 'Restaurant'
  }));
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
