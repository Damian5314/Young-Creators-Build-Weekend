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

-- Voeg Pesca Seafood Restaurant Amsterdam toe
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
    'Pesca Seafood Restaurant Amsterdam',
    'Seafood restaurant | Rating: 4.6 (4127 reviews) | Tel: +31 20 334 5136 | pesca.restaurant',
    'Rozengracht 133',
    'Amsterdam',
    52.3755,
    4.8798,
    ARRAY['Seafood', 'Mediterranean', 'European'],
    false,
    3,
    4.6,
    'Ma-Zo: 17:00-23:00',
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800'
) ON CONFLICT DO NOTHING;

-- Voeg FuLu Mandarijn toe
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
    'FuLu Mandarijn',
    'Chinese restaurant | Rating: 4.5 (4562 reviews) | Tel: +31 20 623 0885 | www.fulumandarijn.com',
    'Rokin 26',
    'Amsterdam',
    52.3707,
    4.8920,
    ARRAY['Chinese', 'Asian', 'Dim Sum'],
    false,
    3,
    4.5,
    'Ma-Zo: 12:00-22:00',
    'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800'
) ON CONFLICT DO NOTHING;

-- Voeg Senses Restaurant toe
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
    'Senses Restaurant',
    'Fine dining restaurant | Rating: 4.6 (857 reviews) | Tel: +31 20 530 6266 | www.sensesrestaurant.nl',
    'Vijzelstraat 45',
    'Amsterdam',
    52.3627,
    4.8916,
    ARRAY['Fine Dining', 'European', 'Contemporary'],
    false,
    4,
    4.6,
    'Wo-Za: 18:00-22:00',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'
) ON CONFLICT DO NOTHING;

-- Voeg de Silveren Spiegel toe
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
    'de Silveren Spiegel',
    'Historic Dutch restaurant | Rating: 4.8 (764 reviews) | Tel: +31 20 624 6589 | www.desilverenspiegel.com',
    'Kattengat 4',
    'Amsterdam',
    52.3751,
    4.8932,
    ARRAY['Dutch', 'European', 'Fine Dining'],
    false,
    4,
    4.8,
    'Di-Za: 18:00-22:00',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'
) ON CONFLICT DO NOTHING;

-- Voeg Restaurant De Belhamel toe
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
    'Restaurant De Belhamel',
    'French restaurant | Rating: 4.5 (1806 reviews) | Tel: +31 20 622 1095 | www.belhamel.nl',
    'Brouwersgracht 60',
    'Amsterdam',
    52.3762,
    4.8904,
    ARRAY['French', 'European', 'International'],
    false,
    3,
    4.5,
    'Ma-Zo: 12:00-23:00',
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800'
) ON CONFLICT DO NOTHING;

-- Voeg Sab Di Hatti Streetfood toe
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
    'Sab Di Hatti Streetfood & Tropische Groenten en Fruit',
    'Indian street food restaurant | Rating: 4.1 (153 reviews) | Tel: +31 6 85543049 | sabdihatti.nl',
    'Harriët Freezerstraat 101',
    'Amsterdam',
    52.3522,
    4.9405,
    ARRAY['Indian', 'Street Food', 'Asian'],
    true,
    1,
    4.1,
    'Ma-Za: 11:00-21:00',
    'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800'
) ON CONFLICT DO NOTHING;

-- Voeg Choux toe
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
    'Choux',
    'Contemporary restaurant | Rating: 4.6 (935 reviews) | Tel: +31 20 210 3090 | choux.nl',
    'De Ruijterkade 128',
    'Amsterdam',
    52.3793,
    4.9007,
    ARRAY['Contemporary', 'European', 'International'],
    false,
    3,
    4.6,
    'Ma-Zo: 12:00-22:00',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800'
) ON CONFLICT DO NOTHING;

-- Voeg Loetje toe
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
    'Loetje',
    'Dutch restaurant chain | Rating: 4.1 (6745 reviews) | Tel: +31 20 623 3777 | www.loetje.nl',
    'Stationsplein 10',
    'Amsterdam',
    52.3791,
    4.9003,
    ARRAY['Dutch', 'European', 'Steakhouse'],
    false,
    2,
    4.1,
    'Ma-Zo: 11:00-23:00',
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=800'
) ON CONFLICT DO NOTHING;

-- Voeg video's toe voor alle restaurants
DO $$
DECLARE
    ashoka_id UUID;
    omelegg_id UUID;
    pantry_id UUID;
    olijfje_id UUID;
    pesca_id UUID;
    fulu_id UUID;
    senses_id UUID;
    spiegel_id UUID;
    belhamel_id UUID;
    sabdihatti_id UUID;
    choux_id UUID;
    loetje_id UUID;
BEGIN
    -- Haal de restaurant IDs op
    SELECT id INTO ashoka_id FROM public.restaurants WHERE name = 'Ashoka' LIMIT 1;
    SELECT id INTO omelegg_id FROM public.restaurants WHERE name = 'Omelegg City Centre' LIMIT 1;
    SELECT id INTO pantry_id FROM public.restaurants WHERE name = 'The Pantry' LIMIT 1;
    SELECT id INTO olijfje_id FROM public.restaurants WHERE name = 'Restaurant Olijfje' LIMIT 1;
    SELECT id INTO pesca_id FROM public.restaurants WHERE name = 'Pesca Seafood Restaurant Amsterdam' LIMIT 1;
    SELECT id INTO fulu_id FROM public.restaurants WHERE name = 'FuLu Mandarijn' LIMIT 1;
    SELECT id INTO senses_id FROM public.restaurants WHERE name = 'Senses Restaurant' LIMIT 1;
    SELECT id INTO spiegel_id FROM public.restaurants WHERE name = 'de Silveren Spiegel' LIMIT 1;
    SELECT id INTO belhamel_id FROM public.restaurants WHERE name = 'Restaurant De Belhamel' LIMIT 1;
    SELECT id INTO sabdihatti_id FROM public.restaurants WHERE name = 'Sab Di Hatti Streetfood & Tropische Groenten en Fruit' LIMIT 1;
    SELECT id INTO choux_id FROM public.restaurants WHERE name = 'Choux' LIMIT 1;
    SELECT id INTO loetje_id FROM public.restaurants WHERE name = 'Loetje' LIMIT 1;

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

    -- Voeg Pesca video toe
    IF pesca_id IS NOT NULL THEN
        INSERT INTO public.videos (
            restaurant_id,
            title,
            description,
            video_url,
            tags,
            like_count,
            view_count
        ) VALUES (
            pesca_id,
            'Pesca Seafood Restaurant Amsterdam',
            'Verse vis en zeevruchten bij Pesca',
            '/videos/restaurants/PescaAmsterdam.mp4',
            ARRAY['seafood', 'fish', 'amsterdam', 'mediterranean'],
            0,
            0
        ) ON CONFLICT DO NOTHING;
    END IF;

    -- Voeg FuLu Mandarijn video toe
    IF fulu_id IS NOT NULL THEN
        INSERT INTO public.videos (
            restaurant_id,
            title,
            description,
            video_url,
            tags,
            like_count,
            view_count
        ) VALUES (
            fulu_id,
            'FuLu Mandarijn',
            'Authentiek Chinees bij FuLu Mandarijn',
            '/videos/restaurants/fulumandarijnamsterdam.mp4',
            ARRAY['chinese', 'dimsum', 'amsterdam', 'asian'],
            0,
            0
        ) ON CONFLICT DO NOTHING;
    END IF;

    -- Voeg Senses Restaurant video toe
    IF senses_id IS NOT NULL THEN
        INSERT INTO public.videos (
            restaurant_id,
            title,
            description,
            video_url,
            tags,
            like_count,
            view_count
        ) VALUES (
            senses_id,
            'Senses Restaurant',
            'Fine dining bij Senses Restaurant',
            '/videos/restaurants/SensesAmsterdam.mp4',
            ARRAY['finedining', 'amsterdam', 'contemporary', 'elegant'],
            0,
            0
        ) ON CONFLICT DO NOTHING;
    END IF;

    -- Voeg de Silveren Spiegel video toe
    IF spiegel_id IS NOT NULL THEN
        INSERT INTO public.videos (
            restaurant_id,
            title,
            description,
            video_url,
            tags,
            like_count,
            view_count
        ) VALUES (
            spiegel_id,
            'de Silveren Spiegel',
            'Historisch Nederlands restaurant de Silveren Spiegel',
            '/videos/restaurants/silverenspiegel1614.mp4',
            ARRAY['dutch', 'historic', 'amsterdam', 'finedining'],
            0,
            0
        ) ON CONFLICT DO NOTHING;
    END IF;

    -- Voeg Restaurant De Belhamel video toe
    IF belhamel_id IS NOT NULL THEN
        INSERT INTO public.videos (
            restaurant_id,
            title,
            description,
            video_url,
            tags,
            like_count,
            view_count
        ) VALUES (
            belhamel_id,
            'Restaurant De Belhamel',
            'Franse keuken bij De Belhamel',
            '/videos/restaurants/DebelhamelAmsterdam.mp4',
            ARRAY['french', 'amsterdam', 'canalview', 'romantic'],
            0,
            0
        ) ON CONFLICT DO NOTHING;
    END IF;

    -- Voeg Sab Di Hatti video toe
    IF sabdihatti_id IS NOT NULL THEN
        INSERT INTO public.videos (
            restaurant_id,
            title,
            description,
            video_url,
            tags,
            like_count,
            view_count
        ) VALUES (
            sabdihatti_id,
            'Sab Di Hatti Streetfood',
            'Indiaas streetfood bij Sab Di Hatti',
            '/videos/restaurants/SabDiHatti.mp4',
            ARRAY['indian', 'streetfood', 'amsterdam', 'halal'],
            0,
            0
        ) ON CONFLICT DO NOTHING;
    END IF;

    -- Voeg Choux video toe
    IF choux_id IS NOT NULL THEN
        INSERT INTO public.videos (
            restaurant_id,
            title,
            description,
            video_url,
            tags,
            like_count,
            view_count
        ) VALUES (
            choux_id,
            'Choux',
            'Contemporary dining bij Choux',
            '/videos/restaurants/ChouxAmsterdam.mp4',
            ARRAY['contemporary', 'amsterdam', 'modern', 'creative'],
            0,
            0
        ) ON CONFLICT DO NOTHING;
    END IF;

    -- Voeg Loetje video toe
    IF loetje_id IS NOT NULL THEN
        INSERT INTO public.videos (
            restaurant_id,
            title,
            description,
            video_url,
            tags,
            like_count,
            view_count
        ) VALUES (
            loetje_id,
            'Loetje',
            'Nederlandse biefstuk bij Loetje',
            '/videos/restaurants/LoetjeAmsterdam.mp4',
            ARRAY['dutch', 'steak', 'amsterdam', 'casual'],
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
SELECT 'Restaurants:', COUNT(*) FROM public.restaurants WHERE name IN (
    'Ashoka', 'Omelegg City Centre', 'The Pantry', 'Restaurant Olijfje',
    'Pesca Seafood Restaurant Amsterdam', 'FuLu Mandarijn', 'Senses Restaurant',
    'de Silveren Spiegel', 'Restaurant De Belhamel', 'Sab Di Hatti Streetfood & Tropische Groenten en Fruit',
    'Choux', 'Loetje'
);
SELECT 'Videos:', COUNT(*) FROM public.videos WHERE title IN (
    'Ashoka Amsterdam', 'Omelegg City Centre', 'The Pantry', 'Restaurant Olijfje',
    'Pesca Seafood Restaurant Amsterdam', 'FuLu Mandarijn', 'Senses Restaurant',
    'de Silveren Spiegel', 'Restaurant De Belhamel', 'Sab Di Hatti Streetfood',
    'Choux', 'Loetje'
);
SELECT 'Recipes:', COUNT(*) FROM public.recipes WHERE title IN ('Pasta Carbonara', 'Chocolate Chip Cookies');
