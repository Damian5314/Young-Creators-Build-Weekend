-- Add place_id column to restaurants table for Google Maps Place ID
-- This enables duplicate detection when importing from Apify/Google Maps

ALTER TABLE public.restaurants
ADD COLUMN IF NOT EXISTS place_id TEXT UNIQUE;

-- Create index on place_id for faster duplicate lookups
CREATE INDEX IF NOT EXISTS idx_restaurants_place_id
ON public.restaurants(place_id)
WHERE place_id IS NOT NULL;

-- Add updated_at column if it doesn't exist
ALTER TABLE public.restaurants
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create or replace function to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at on restaurants
DROP TRIGGER IF EXISTS update_restaurants_updated_at ON public.restaurants;
CREATE TRIGGER update_restaurants_updated_at
    BEFORE UPDATE ON public.restaurants
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Comment explaining the place_id field
COMMENT ON COLUMN public.restaurants.place_id IS 'Google Maps Place ID (e.g., ChIJ123...) for duplicate detection during imports';
