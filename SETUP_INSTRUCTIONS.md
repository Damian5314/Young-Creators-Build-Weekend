# FlavorSwipe Video Credits Betaalsysteem - Setup Instructies

Dit document beschrijft hoe je het nieuwe video credits betaalsysteem kunt instellen en testen.

## 🎯 Wat is er gebouwd?

Een compleet betaalsysteem voor restaurant eigenaren om video upload credits te kopen via Mollie:
- **1 video** - €1,50
- **3 videos** - €4,00
- **10 videos** - €12,50

## 📋 Setup Stappen

### 1. Database Migratie Uitvoeren

Ga naar je Supabase dashboard SQL editor en voer het volgende bestand uit:
```
supabase/migrations/20251130_add_video_credits.sql
```

Of kopieer de inhoud en voer deze uit in de Supabase SQL Editor:
https://supabase.com/dashboard/project/tpudktmifaijfozyzwyi/sql/new

### 2. Environment Variabelen

De Mollie API key is al toegevoegd aan `.env`:
```
MOLLIE_API_KEY="test_T3A7My9aWNE9QFbxTfvqw4gHdQjT5H"
```

### 3. Backend Dependencies

De Mollie SDK is al geïnstalleerd:
```bash
cd backend
npm install  # Als je de dependencies opnieuw wilt installeren
```

### 4. Start de Applicatie

```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
npm run dev:backend
```

## 🧪 Testen

### Test Flow:

1. **Login als Restaurant Owner**
   - Maak een account aan met role "restaurant"
   - Of login met een bestaande owner account

2. **Ga naar Dashboard**
   - Navigeer naar `/dashboard`
   - Je ziet een "Video Credits" card bovenaan

3. **Initiële Credits**
   - Standaard hebben nieuwe users 0 credits
   - Klik op "Koop Credits" om de popup te openen

4. **Kies een Pakket**
   - Selecteer 1, 3, of 10 video credits
   - Je wordt doorgestuurd naar Mollie's test checkout

5. **Test Betaling**
   - Gebruik Mollie's test omgeving
   - Test card: gebruik de test data op de Mollie checkout pagina
   - Na succesvolle betaling wordt je teruggestuurd

6. **Upload Video**
   - Probeer een video te uploaden
   - Als je 0 credits hebt, zie je de popup opnieuw
   - Met credits kun je uploaden en de credits decrementeren automatisch

## 🏗️ Architectuur

### Backend API Endpoints

```
GET  /api/payments/packages       - Haal beschikbare pakketten op
POST /api/payments/checkout       - Start betaling (authenticated)
GET  /api/payments/credits        - Haal gebruiker credits op (authenticated)
GET  /api/payments/history        - Haal betaling geschiedenis op (authenticated)
POST /api/payments/webhook        - Mollie webhook voor payment confirmatie
```

### Database Schema

**Nieuwe tabel: `payments`**
- Slaat alle betalingen op
- Tracked Mollie payment ID en status
- Links naar user via `user_id`

**Nieuwe kolom: `profiles.video_credits`**
- Integer kolom voor aantal beschikbare credits
- Wordt automatisch gedecrementeerd bij video upload (database trigger)
- Wordt geïncrementeerd bij succesvolle betaling

### Frontend Components

**`BuyCreditsDialog`** (`src/components/BuyCreditsDialog.tsx`)
- Toont beschikbare pakketten
- Handelt checkout flow af
- Redirect naar Mollie

**Dashboard Updates** (`src/features/dashboard/DashboardPage.tsx`)
- Credits display card
- Blokkering van video upload zonder credits
- Automatische popup bij 0 credits

## 🔐 Security

- ✅ RLS policies op `payments` tabel
- ✅ Authenticated endpoints voor credit management
- ✅ Database trigger voorkomt negative credits
- ✅ Mollie webhook verificatie
- ✅ Test API key (moet vervangen worden voor productie)

## 🚀 Productie Checklist

Voordat je live gaat:

- [ ] Vervang `MOLLIE_API_KEY` met je live API key
- [ ] Update webhook URL naar productie domain
- [ ] Test alle flows in productie omgeving
- [ ] Configureer Mollie webhook in dashboard
- [ ] Enable Mollie payment methods (iDEAL, Credit Card, etc.)
- [ ] Test RLS policies grondig

## 📝 Notes

- Database trigger voorkomt video uploads zonder credits (throws error)
- Frontend checked ook credits voor betere UX
- Webhook URL moet publiek toegankelijk zijn voor Mollie
- Test mode gebruikt Mollie test API key

## 🐛 Troubleshooting

**Webhook niet ontvangen?**
- Controleer of backend draait op publiek toegankelijk adres
- Gebruik ngrok voor lokale development: `ngrok http 3001`
- Update webhook URL in payment checkout

**Credits niet toegevoegd na betaling?**
- Check webhook logs in backend console
- Verifieer payment status in Mollie dashboard
- Check `payments` tabel in Supabase

**Video upload geblokkeerd?**
- Check `video_credits` in `profiles` tabel
- Verifieer database trigger is actief
- Check frontend console voor errors
