export interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  role: 'USER' | 'OWNER' | 'ADMIN';
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  dietary_preferences: string[];
  avatar_url: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string;
  latitude: number;
  longitude: number;
  cuisine_types: string[];
  halal: boolean;
  price_level: number;
  average_rating: number;
  opening_hours: string | null;
  image_url: string | null;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Video {
  id: string;
  restaurant_id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  tags: string[];
  like_count: number;
  view_count: number;
  created_at: string;
  restaurant?: Restaurant;
}

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  type: 'RESTAURANT' | 'RECIPE';
  created_at: string;
}

export interface CollectionItem {
  id: string;
  collection_id: string;
  item_type: 'RESTAURANT' | 'VIDEO' | 'RECIPE';
  item_id: string;
  created_at: string;
}

export interface Recipe {
  id: string;
  user_id: string | null;
  title: string;
  description: string | null;
  ingredients: string[];
  steps: string[];
  image_url: string | null;
  source: 'AI' | 'USER';
  created_at: string;
}

export interface SwipeEvent {
  id: string;
  user_id: string;
  target_type: 'RESTAURANT' | 'VIDEO' | 'RECIPE';
  target_id: string;
  action: 'LIKE' | 'DISLIKE' | 'VIEW';
  created_at: string;
}

export interface UserLike {
  id: string;
  user_id: string;
  video_id: string;
  created_at: string;
}

export interface VideoWithRestaurant extends Video {
  restaurant: Restaurant;
}
