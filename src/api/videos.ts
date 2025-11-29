// Video API calls
import api from './client';
import { Restaurant } from './restaurants';

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
  created_at?: string;
  restaurant?: Restaurant;
}

interface VideosResponse {
  success: boolean;
  data: {
    videos: Video[];
    total: number;
    page: number;
    limit: number;
  };
}

export const videosApi = {
  // Get all videos
  getAll: (page = 1, limit = 20, restaurantId?: string, tags?: string[]) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    if (restaurantId) params.append('restaurantId', restaurantId);
    if (tags?.length) params.append('tags', tags.join(','));

    return api.get<VideosResponse>(`/videos?${params}`);
  },

  // Get video by ID
  getById: (id: string) =>
    api.get<{ success: boolean; data: Video }>(`/videos/${id}`),

  // Get feed videos
  getFeed: (limit = 10, token?: string) =>
    api.get<{ success: boolean; data: Video[] }>(`/videos/feed?limit=${limit}`, token),

  // Record view
  recordView: (id: string, token?: string) =>
    api.post<{ success: boolean }>(`/videos/${id}/view`, {}, token),

  // Like video
  like: (id: string, token: string) =>
    api.post<{ success: boolean }>(`/videos/${id}/like`, {}, token),

  // Unlike video
  unlike: (id: string, token: string) =>
    api.delete<{ success: boolean }>(`/videos/${id}/like`, token),

  // Swipe action
  swipe: (id: string, action: 'LIKE' | 'DISLIKE', token: string) =>
    api.post<{ success: boolean }>(`/videos/${id}/swipe`, { action }, token),
};
