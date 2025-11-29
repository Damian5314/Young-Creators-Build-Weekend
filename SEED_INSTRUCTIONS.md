# Database Seed Instructies

Dit document legt uit hoe je de database kunt seeden met video's en het Jaffa restaurant.

## Stap 1: Database Schema Updaten

Voer eerst de schema update uit om `video_url`, `like_count` en `view_count` toe te voegen aan de `recipes` tabel:

1. Ga naar je Supabase project: https://supabase.com/dashboard/project/tpudktmifaijfozyzwyi
2. Klik op **SQL Editor** in de linker sidebar
3. Open het bestand: `supabase/migrations/20251129_add_video_to_recipes.sql`
4. Kopieer de inhoud en plak het in de SQL Editor
5. Klik op **Run** om de migratie uit te voeren

## Stap 2: Data Seeden

Voer nu de seed script uit om de videos en het Jaffa restaurant toe te voegen:

1. Blijf in de **SQL Editor**
2. Open het bestand: `supabase/migrations/seed-videos.sql`
3. Kopieer de inhoud en plak het in de SQL Editor
4. Klik op **Run** om de data toe te voegen

Dit zal het volgende toevoegen:
- 1 restaurant: **Jaffa** (Israëlische shoarma in Amsterdam)
- 1 restaurant video: Jaffa shoarma video
- 2 recipe videos: Pasta Carbonara en Chocolate Chip Cookies

## Stap 3: Verifieer de Data

Je kunt controleren of alles correct is toegevoegd door deze queries uit te voeren:

```sql
-- Check restaurant
SELECT * FROM public.restaurants WHERE name = 'Jaffa';

-- Check restaurant video
SELECT * FROM public.videos WHERE title = 'Jaffa Shoarma';

-- Check recipe videos
SELECT * FROM public.recipes WHERE video_url IS NOT NULL;
```

## Video Bestanden

De volgende video bestanden moeten aanwezig zijn in de `public/videos/` map:

### Restaurants
- `public/videos/restaurants/ssstik.io_jaffashoarma_1764437624613.mp4` ✅

### Recipes
- `public/videos/recipes/v12044gd0000cplpuk7og65g9ue0qdrg.mp4` ✅
- `public/videos/recipes/v24044gl0000d05qd7fog65gq54rc2g0.mp4` ✅

## Homepage

Na het seeden zou de homepage nu het volgende moeten tonen:

- **Restaurants tab**: Alle restaurant videos inclusief de Jaffa video
- **Recepten tab**: De 2 recipe videos (Pasta Carbonara en Chocolate Chip Cookies)

## Troubleshooting

### Videos worden niet afgespeeld
- Controleer of de video bestanden daadwerkelijk in de `public/videos/` mappen staan
- Controleer of de paden in de database correct zijn (beginnen met `/videos/...`)

### Recipes tab is leeg
- Voer de SQL query uit: `SELECT * FROM recipes WHERE video_url IS NOT NULL;`
- Als dit geen resultaten geeft, voer dan het seed script opnieuw uit

### Restaurant Jaffa heeft geen owner
- Dit is normaal. De owner_id is optioneel en kan later worden toegevoegd als je een owner account hebt
- Als je wilt, kun je dit handmatig updaten in de Supabase Table Editor
