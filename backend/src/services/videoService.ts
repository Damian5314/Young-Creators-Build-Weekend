import { supabase } from '../config/supabase';
import { Video, PaginationParams } from '../types';
import { AppError } from '../middleware/errorHandler';

interface VideoFilters {
  restaurantId?: string;
  tags?: string[];
}

export async function getVideos(
  params: PaginationParams = {},
  filters: VideoFilters = {}
) {
  const { page = 1, limit = 20 } = params;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('videos')
    .select(`
      *,
      restaurants (
        id,
        name,
        city,
        image_url
      )
    `, { count: 'exact' });

  if (filters.restaurantId) {
    query = query.eq('restaurant_id', filters.restaurantId);
  }

  if (filters.tags && filters.tags.length > 0) {
    query = query.overlaps('tags', filters.tags);
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new AppError(`Failed to fetch videos: ${error.message}`, 500);
  }

  return {
    videos: data || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

export async function getVideoById(id: string) {
  const { data, error } = await supabase
    .from('videos')
    .select(`
      *,
      restaurants (*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    throw new AppError(`Video not found: ${error.message}`, 404);
  }

  return data;
}

export async function getFeedVideos(userId?: string, limit: number = 10) {
  // Get videos for the feed, excluding ones the user has already seen
  let query = supabase
    .from('videos')
    .select(`
      *,
      restaurants (
        id,
        name,
        city,
        halal,
        cuisine_types,
        image_url
      )
    `);

  if (userId) {
    // Get videos user hasn't swiped on yet
    const { data: seenVideos } = await supabase
      .from('swipe_events')
      .select('target_id')
      .eq('user_id', userId)
      .eq('target_type', 'VIDEO');

    const seenIds = seenVideos?.map(v => v.target_id) || [];
    if (seenIds.length > 0) {
      query = query.not('id', 'in', `(${seenIds.join(',')})`);
    }
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new AppError(`Failed to fetch feed videos: ${error.message}`, 500);
  }

  return data || [];
}

export async function incrementVideoView(videoId: string) {
  const { error } = await supabase.rpc('increment_video_stat', {
    video_uuid: videoId,
    stat_type: 'view',
  });

  if (error) {
    console.warn('Failed to increment view count:', error);
  }
}

export async function likeVideo(videoId: string, userId: string) {
  // Check if already liked
  const { data: existing } = await supabase
    .from('user_likes')
    .select('id')
    .eq('video_id', videoId)
    .eq('user_id', userId)
    .single();

  if (existing) {
    throw new AppError('Video already liked', 400);
  }

  // Add like
  const { error: likeError } = await supabase
    .from('user_likes')
    .insert({ video_id: videoId, user_id: userId });

  if (likeError) {
    throw new AppError(`Failed to like video: ${likeError.message}`, 500);
  }

  // Increment like count
  const { error: rpcError } = await supabase.rpc('increment_video_stat', {
    video_uuid: videoId,
    stat_type: 'like',
  });

  if (rpcError) {
    console.warn('Failed to increment like count:', rpcError);
  }

  return { success: true };
}

export async function unlikeVideo(videoId: string, userId: string) {
  const { error: deleteError } = await supabase
    .from('user_likes')
    .delete()
    .eq('video_id', videoId)
    .eq('user_id', userId);

  if (deleteError) {
    throw new AppError(`Failed to unlike video: ${deleteError.message}`, 500);
  }

  // Decrement like count
  const { error: rpcError } = await supabase.rpc('decrement_video_like', {
    video_uuid: videoId,
  });

  if (rpcError) {
    console.warn('Failed to decrement like count:', rpcError);
  }

  return { success: true };
}

export async function recordSwipe(
  userId: string,
  targetId: string,
  targetType: 'VIDEO' | 'RESTAURANT' | 'RECIPE',
  action: 'LIKE' | 'DISLIKE' | 'VIEW'
) {
  const { error } = await supabase.from('swipe_events').insert({
    user_id: userId,
    target_id: targetId,
    target_type: targetType,
    action,
  });

  if (error) {
    console.warn('Failed to record swipe:', error);
  }
}
