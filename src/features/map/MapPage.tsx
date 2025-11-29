import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { AppLayout } from '@/shared/components';
import { supabase } from '@/integrations/supabase/client';
import { Restaurant } from '@/shared/types';
import { DEFAULT_LOCATION } from '@/shared/constants';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { MapCenterController, RestaurantMarker } from './components';

export default function MapPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number]>([
    DEFAULT_LOCATION.lat,
    DEFAULT_LOCATION.lng,
  ]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRestaurants();
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (error) throw error;

      setRestaurants(data || []);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      toast.error('Kon restaurants niet laden');
    } finally {
      setLoading(false);
    }
  };

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
            </div>
          </div>
        ) : (
          <MapContainer
            center={userLocation}
            zoom={13}
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

            {/* User location marker with blur effect */}
            <CircleMarker
              center={userLocation}
              radius={10}
              pathOptions={{
                fillColor: '#3b82f6',
                fillOpacity: 0.8,
                color: '#ffffff',
                weight: 3,
              }}
            >
              <Popup>
                <div className="text-center">
                  <p className="font-semibold">Je locatie</p>
                </div>
              </Popup>
            </CircleMarker>
          </MapContainer>
        )}
      </div>
    </AppLayout>
  );
}
