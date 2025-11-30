import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { AppLayout } from '@/shared/components';
import { Restaurant } from '@/shared/types';
import { DEFAULT_LOCATION } from '@/shared/constants';
import { useNavigate } from 'react-router-dom';
import { MapPin, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { MapCenterController, RestaurantMarker } from './components';
import { restaurantsApi } from '@/api/restaurants';
import { Button } from '@/components/ui/button';

// n8n webhook URL for triggering restaurant scraping
const N8N_WEBHOOK_URL = 'https://wishh.app.n8n.cloud/webhook/860456af-46ea-45cd-ae77-a3a4f1e0ac96';

export default function MapPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number]>([
    DEFAULT_LOCATION.lat,
    DEFAULT_LOCATION.lng,
  ]);
  const [locationError, setLocationError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch nearby restaurants from backend
  const fetchNearbyRestaurants = useCallback(async (lat: number, lng: number) => {
    try {
      setLoading(true);
      console.log(`[Map] Fetching nearby restaurants at ${lat}, ${lng}`);

      // Get restaurants within 5km radius
      const response = await restaurantsApi.getNearby(lat, lng, 5, 50);

      if (response.success && response.data) {
        setRestaurants(response.data);
        console.log(`[Map] Found ${response.data.length} nearby restaurants`);
      } else {
        setRestaurants([]);
      }
    } catch (error) {
      console.error('[Map] Error fetching restaurants:', error);
      toast.error('Kon restaurants niet laden');
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Trigger n8n scraping workflow with current GPS location
  const triggerScraping = async () => {
    const [lat, lng] = userLocation;

    setScraping(true);
    toast.info('Restaurants zoeken in jouw omgeving...');

    try {
      console.log(`[Map] Triggering n8n scraping at ${lat}, ${lng}`);

      // Send GPS coordinates directly to n8n webhook
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lat, lng }),
      });

      if (!response.ok) {
        throw new Error(`n8n webhook failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('[Map] n8n response:', data);

      toast.success('Scraping gestart! Restaurants worden geladen...');

      // Wait a bit for n8n to process and import restaurants
      // Then refresh the restaurant list
      setTimeout(async () => {
        await fetchNearbyRestaurants(lat, lng);
        toast.success('Restaurants bijgewerkt!');
      }, 5000);

    } catch (error) {
      console.error('[Map] Scraping error:', error);
      toast.error('Kon geen restaurants zoeken. Probeer opnieuw.');
    } finally {
      setScraping(false);
    }
  };

  // Get user's GPS location
  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocatie wordt niet ondersteund');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log(`[Map] Got user location: ${latitude}, ${longitude}`);
        setUserLocation([latitude, longitude]);
        setLocationError(null);

        // Fetch nearby restaurants for this location
        fetchNearbyRestaurants(latitude, longitude);
      },
      (error) => {
        console.error('[Map] Geolocation error:', error);
        setLocationError('Kon locatie niet ophalen');

        // Fall back to default location and still fetch restaurants
        fetchNearbyRestaurants(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }, [fetchNearbyRestaurants]);

  // Initialize on mount
  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

  const handleMarkerClick = (restaurantId: string) => {
    navigate(`/restaurant/${restaurantId}`);
  };

  return (
    <AppLayout>
      <div className="fixed inset-0 bottom-14 bg-background">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-2">
              <MapPin className="h-8 w-8 text-primary animate-pulse" />
              <p className="text-sm text-muted-foreground">Kaart laden...</p>
              {locationError && (
                <p className="text-xs text-destructive">{locationError}</p>
              )}
            </div>
          </div>
        ) : (
          <>
            <MapContainer
              center={userLocation}
              zoom={14}
              scrollWheelZoom={true}
              className="h-full w-full map-container-base"
            >
              <MapCenterController center={userLocation} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {restaurants.map((restaurant) => (
                <RestaurantMarker
                  key={restaurant.id}
                  restaurant={restaurant}
                  onViewDetails={handleMarkerClick}
                />
              ))}

              {/* User location marker */}
              <CircleMarker
                center={userLocation}
                radius={12}
                pathOptions={{
                  fillColor: '#3b82f6',
                  fillOpacity: 0.9,
                  color: '#ffffff',
                  weight: 3,
                }}
              >
                <Popup>
                  <div className="text-center">
                    <p className="font-semibold">Jouw locatie</p>
                    <p className="text-xs text-muted-foreground">
                      {userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}
                    </p>
                  </div>
                </Popup>
              </CircleMarker>
            </MapContainer>

            {/* Floating action button to refresh/scrape restaurants */}
            <div className="absolute bottom-20 right-4 z-[1000] flex flex-col gap-2">
              {/* Scrape button - triggers n8n workflow */}
              <Button
                onClick={triggerScraping}
                disabled={scraping}
                className="rounded-full w-14 h-14 shadow-lg"
                size="icon"
              >
                {scraping ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <RefreshCw className="h-6 w-6" />
                )}
              </Button>

              {/* Restaurant count badge */}
              <div className="bg-background/90 backdrop-blur-sm rounded-full px-3 py-1 text-center shadow-md">
                <span className="text-sm font-medium">
                  {restaurants.length} restaurants
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
