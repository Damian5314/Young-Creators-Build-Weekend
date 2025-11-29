import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import { AppLayout } from '@/components/layout/AppLayout';
import { supabase } from '@/integrations/supabase/client';
import { Restaurant } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, Euro } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Define custom marker icon
const restaurantIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map centering
function MapCenterController({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);

  return null;
}

export default function MapView() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number]>([51.9225, 4.47917]); // Default: Rotterdam
  const navigate = useNavigate();
  const { toast } = useToast();

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
          // Keep default location (Rotterdam)
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
      toast({
        title: 'Error',
        description: 'Kon restaurants niet laden',
        variant: 'destructive',
      });
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
            className="h-full w-full"
            style={{ zIndex: 0 }}
          >
            <MapCenterController center={userLocation} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {restaurants.map((restaurant) => (
              <Marker
                key={restaurant.id}
                position={[restaurant.latitude, restaurant.longitude]}
                icon={restaurantIcon}
                eventHandlers={{
                  click: () => handleMarkerClick(restaurant.id),
                }}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    {restaurant.image_url && (
                      <img
                        src={restaurant.image_url}
                        alt={restaurant.name}
                        className="w-full h-32 object-cover rounded-md mb-2"
                      />
                    )}
                    <h3 className="font-semibold text-base mb-1">{restaurant.name}</h3>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <div className="flex items-center">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                        <span>{restaurant.average_rating.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center">
                        {Array.from({ length: restaurant.price_level }).map((_, i) => (
                          <Euro key={i} className="h-3 w-3" />
                        ))}
                      </div>
                    </div>

                    {restaurant.cuisine_types && restaurant.cuisine_types.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {restaurant.cuisine_types.slice(0, 3).map((cuisine, index) => (
                          <span
                            key={index}
                            className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full"
                          >
                            {cuisine}
                          </span>
                        ))}
                      </div>
                    )}

                    {restaurant.address && (
                      <p className="text-xs text-muted-foreground mb-2 flex items-start gap-1">
                        <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{restaurant.address}</span>
                      </p>
                    )}

                    <button
                      onClick={() => handleMarkerClick(restaurant.id)}
                      className="w-full mt-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      Bekijk details
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </AppLayout>
  );
}
