-- Seed script voor videos en restaurants
-- Voer dit uit in de Supabase SQL Editor

-- Voeg Ashoka restaurant toe
INSERT INTO public.restaurants (
    name,
    description,
    address,
    city,
    latitude,
    longitude,
    cuisine_types,
    halal,
    price_level,
    average_rating,
    opening_hours,
    image_url
) VALUES (
    'Ashoka',
    'Authentiek Indiaas restaurant in het hart van Amsterdam | Rating: 4.6 (3456 reviews) | Tel: +31 20 221 0446 | www.ashokarestaurant.nl',
    'Spuistraat 3G',
    'Amsterdam',
    52.3738,
    4.8910,
    ARRAY['Indian', 'Asian'],
    false,
    2,
    4.6,
    'Ma-Zo: 12:00-23:00',
    'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800'
) ON CONFLICT DO NOTHING;

-- Voeg Omelegg City Centre restaurant toe
INSERT INTO public.restaurants (
    name,
    description,
    address,
    city,
    latitude,
    longitude,
    cuisine_types,
    halal,
    price_level,
    average_rating,
    opening_hours,
    image_url
) VALUES (
    'Omelegg City Centre',
    'Breakfast restaurant in Amsterdam | Rating: 4.6 (5907 reviews) | Tel: +31 20 233 2406 | www.omelegg.com',
    'Nieuwebrugsteeg 24',
    'Amsterdam',
    52.3719,
    4.8945,
    ARRAY['Breakfast', 'Brunch', 'European'],
    false,
    2,
    4.6,
    'Ma-Zo: 08:00-16:00',
    'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800'
) ON CONFLICT DO NOTHING;

-- Voeg The Pantry restaurant toe
INSERT INTO public.restaurants (
    name,
    description,
    address,
    city,
    latitude,
    longitude,
    cuisine_types,
    halal,
    price_level,
    average_rating,
    opening_hours,
    image_url
) VALUES (
    'The Pantry',
    'Traditional Dutch restaurant | Rating: 4.7 (8696 reviews) | Tel: +31 20 620 0922 | www.thepantry.nl',
    'Leidsekruisstraat 21',
    'Amsterdam',
    52.3644,
    4.8826,
    ARRAY['Dutch', 'European', 'Traditional'],
    false,
    3,
    4.7,
    'Ma-Zo: 12:00-22:00',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'
) ON CONFLICT DO NOTHING;

-- Voeg Restaurant Olijfje toe
INSERT INTO public.restaurants (
    name,
    description,
    address,
    city,
    latitude,
    longitude,
    cuisine_types,
    halal,
    price_level,
    average_rating,
    opening_hours,
    image_url
) VALUES (
    'Restaurant Olijfje',
    'Mediterranean restaurant | Rating: 4.7 (3911 reviews) | Tel: +31 20 330 4444 | www.restaurantolijfje.nl',
    'Valkenburgerstraat 223D',
    'Amsterdam',
    52.3688,
    4.9080,
    ARRAY['Mediterranean', 'European', 'International'],
    false,
    3,
    4.7,
    'Ma-Zo: 17:00-23:00',
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=800'
) ON CONFLICT DO NOTHING;

-- Voeg video's toe voor alle restaurants
DO $$
DECLARE
    ashoka_id UUID;
    omelegg_id UUID;
    pantry_id UUID;
    olijfje_id UUID;
BEGIN
    -- Haal de restaurant IDs op
    SELECT id INTO ashoka_id FROM public.restaurants WHERE name = 'Ashoka' LIMIT 1;
    SELECT id INTO omelegg_id FROM public.restaurants WHERE name = 'Omelegg City Centre' LIMIT 1;
    SELECT id INTO pantry_id FROM public.restaurants WHERE name = 'The Pantry' LIMIT 1;
    SELECT id INTO olijfje_id FROM public.restaurants WHERE name = 'Restaurant Olijfje' LIMIT 1;

    -- Voeg Ashoka video toe
    IF ashoka_id IS NOT NULL THEN
        INSERT INTO public.videos (
            restaurant_id,
            title,
            description,
            video_url,
            tags,
            like_count,
            view_count
        ) VALUES (
            ashoka_id,
            'Ashoka Amsterdam',
            'Heerlijke Indiaas gerechten bij Ashoka',
            '/videos/restaurants/AshokaAmsterdam.mp4',
            ARRAY['indian', 'curry', 'amsterdam', 'spicy'],
            0,
            0
        ) ON CONFLICT DO NOTHING;
    END IF;

    -- Voeg Omelegg video toe
    IF omelegg_id IS NOT NULL THEN
        INSERT INTO public.videos (
            restaurant_id,
            title,
            description,
            video_url,
            tags,
            like_count,
            view_count
        ) VALUES (
            omelegg_id,
            'Omelegg City Centre',
            'Heerlijk ontbijt bij Omelegg',
            '/videos/restaurants/omeleggamsterdam.mp4',
            ARRAY['breakfast', 'brunch', 'amsterdam', 'eggs'],
            0,
            0
        ) ON CONFLICT DO NOTHING;
    END IF;

    -- Voeg The Pantry video toe
    IF pantry_id IS NOT NULL THEN
        INSERT INTO public.videos (
            restaurant_id,
            title,
            description,
            video_url,
            tags,
            like_count,
            view_count
        ) VALUES (
            pantry_id,
            'The Pantry',
            'Authentieke Nederlandse gerechten bij The Pantry',
            '/videos/restaurants/thepantryamsterdam.mp4',
            ARRAY['dutch', 'traditional', 'amsterdam', 'local'],
            0,
            0
        ) ON CONFLICT DO NOTHING;
    END IF;

    -- Voeg Restaurant Olijfje video toe
    IF olijfje_id IS NOT NULL THEN
        INSERT INTO public.videos (
            restaurant_id,
            title,
            description,
            video_url,
            tags,
            like_count,
            view_count
        ) VALUES (
            olijfje_id,
            'Restaurant Olijfje',
            'Mediterrane gerechten bij Restaurant Olijfje',
            '/videos/restaurants/olijfjeamsterdam.mp4',
            ARRAY['mediterranean', 'seafood', 'amsterdam', 'fresh'],
            0,
            0
        ) ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Voeg de recipe videos toe aan de recipes tabel
-- Let op: voor recipes gebruiken we de recipes tabel, niet de videos tabel
INSERT INTO public.recipes (
    title,
    description,
    ingredients,
    steps,
    video_url,
    source,
    like_count,
    view_count
) VALUES
(
    'Pasta Carbonara',
    'Traditionele Italiaanse pasta carbonara',
    ARRAY['Pasta', 'Eieren', 'Pecorino Romano', 'Guanciale', 'Zwarte peper'],
    ARRAY['Kook de pasta al dente', 'Bak het guanciale knapperig', 'Meng eieren en kaas', 'Combineer alles buiten het vuur'],
    '/videos/recipes/v12044gd0000cplpuk7og65g9ue0qdrg.mp4',
    'USER',
    0,
    0
),
(
    'Chocolate Chip Cookies',
    'Krokante chocolate chip cookies',
    ARRAY['Bloem', 'Boter', 'Suiker', 'Eieren', 'Chocolate chips', 'Vanille extract'],
    ARRAY['Mix droge ingrediënten', 'Room boter en suiker', 'Voeg eieren toe', 'Meng alles en vorm koekjes', 'Bak 12 minuten op 180°C'],
    '/videos/recipes/v24044gl0000d05qd7fog65gq54rc2g0.mp4',
    'USER',
    0,
    0
) ON CONFLICT DO NOTHING;

-- Controleer of alles is toegevoegd:
SELECT 'Restaurants:', COUNT(*) FROM public.restaurants WHERE name IN ('Ashoka', 'Omelegg City Centre', 'The Pantry', 'Restaurant Olijfje');
SELECT 'Videos:', COUNT(*) FROM public.videos WHERE title IN ('Ashoka Amsterdam', 'Omelegg City Centre', 'The Pantry', 'Restaurant Olijfje');
SELECT 'Recipes:', COUNT(*) FROM public.recipes WHERE title IN ('Pasta Carbonara', 'Chocolate Chip Cookies');
