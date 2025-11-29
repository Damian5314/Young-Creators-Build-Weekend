import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
}

export interface Recipe {
  id?: string;
  title: string;
  description: string;
  ingredients: string[];
  steps: string[];
  image_url?: string;
  source: 'AI' | 'USER';
  user_id?: string;
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
  owner_id?: string;
}

export interface Video {
  id: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  restaurant_id: string;
  tags?: string[];
  view_count?: number;
  like_count?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface GenerateRecipesRequest {
  ingredients: string;
}
