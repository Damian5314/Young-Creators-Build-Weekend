-- Add video_url field to recipes table
ALTER TABLE public.recipes
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Add like_count and view_count to recipes table for consistency with videos
ALTER TABLE public.recipes
ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
