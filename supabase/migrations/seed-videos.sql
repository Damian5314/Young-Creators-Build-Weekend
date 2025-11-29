-- Seed script voor videos en Jaffa restaurant
-- Voer dit uit in de Supabase SQL Editor

-- Eerst: Maak het Jaffa restaurant aan
-- We gebruiken een dummy owner_id (kan later aangepast worden naar een echte owner)
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
    'Jaffa',
    'Authentieke Israëlische shoarma en falafel',
    'Javastraat 100',
    'Amsterdam',
    52.3676,
    4.9041,
    ARRAY['Middle Eastern', 'Israeli', 'Mediterranean'],
    true,
    2,
    4.5,
    'Ma-Zo: 12:00-22:00',
    'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800'
) ON CONFLICT DO NOTHING
RETURNING id;

-- Voeg de Jaffa video toe aan de videos tabel
-- Let op: je moet de restaurant_id van Jaffa gebruiken
-- Voer eerst de query hieronder uit om het ID te krijgen:
-- SELECT id FROM public.restaurants WHERE name = 'Jaffa';

-- Dan voer je deze INSERT uit met het juiste restaurant_id:
/*
INSERT INTO public.videos (
    restaurant_id,
    title,
    description,
    video_url,
    tags,
    like_count,
    view_count
) VALUES (
    '<JAFFA_RESTAURANT_ID_HIER>',
    'Jaffa Shoarma',
    'Heerlijke shoarma van Jaffa',
    '/videos/restaurants/ssstik.io_jaffashoarma_1764437624613.mp4',
    ARRAY['shoarma', 'halal', 'amsterdam'],
    0,
    0
);
*/

-- Voor nu gebruiken we een andere aanpak met een subquery:
DO $$
DECLARE
    jaffa_id UUID;
BEGIN
    -- Haal het Jaffa restaurant ID op
    SELECT id INTO jaffa_id FROM public.restaurants WHERE name = 'Jaffa' LIMIT 1;

    -- Als Jaffa bestaat, voeg dan de video toe
    IF jaffa_id IS NOT NULL THEN
        INSERT INTO public.videos (
            restaurant_id,
            title,
            description,
            video_url,
            tags,
            like_count,
            view_count
        ) VALUES (
            jaffa_id,
            'Jaffa Shoarma',
            'Heerlijke shoarma van Jaffa',
            '/videos/restaurants/ssstik.io_jaffashoarma_1764437624613.mp4',
            ARRAY['shoarma', 'halal', 'amsterdam'],
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
SELECT 'Restaurants:', COUNT(*) FROM public.restaurants WHERE name = 'Jaffa';
SELECT 'Videos:', COUNT(*) FROM public.videos WHERE title = 'Jaffa Shoarma';
SELECT 'Recipes:', COUNT(*) FROM public.recipes WHERE title LIKE 'Recept Video%';
