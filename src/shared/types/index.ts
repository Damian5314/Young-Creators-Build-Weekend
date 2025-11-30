// Shared types used across the app
export interface User {
  id: string;
  email?: string;
}

export interface Profile {
  id: string;
  name?: string;
  email?: string;
  avatar_url?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  dietary_preferences?: string[];
  onboarding_completed?: boolean;
  role?: 'USER' | 'OWNER' | 'ADMIN';
  created_at?: string;
  updated_at?: string;
}

export interface Video {
  id: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  restaurant_id: string;
  tags?: string[];
  view_count: number;
  like_count: number;
  created_at?: string;
}

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
  // Added by nearby query (Haversine distance in km)
  distance?: number;
}

export interface VideoWithRestaurant extends Video {
  restaurant: Restaurant;
}

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  ingredients?: string[];
  steps?: string[];
  image_url?: string;
  video_url?: string;
  like_count: number;
  view_count: number;
  source: 'AI' | 'USER';
  user_id?: string;
  created_at?: string;
}

export interface Collection {
  id: string;
  name: string;
  type: 'RESTAURANT' | 'RECIPE';
  user_id: string;
  created_at?: string;
}

export interface CollectionItem {
  id: string;
  collection_id: string;
  item_id: string;
  item_type: 'RESTAURANT' | 'VIDEO' | 'RECIPE';
  created_at?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
