import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Layout } from '@/components/Layout';
import { supabase } from '@/lib/supabase';
import { Restaurant } from '@/lib/types';
import { DEFAULT_LOCATION } from '@/lib/constants';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, Euro, Navigation, Info } from 'lucide-react';
import { toast } from 'sonner';
import 'leaflet/dist/leaflet.css';

// Restaurant marker icon
const restaurantIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Map controller component
function MapCenterController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 14);
  }, [center, map]);
  return null;
}

// Restaurant marker component
function RestaurantMarker({ restaurant, onViewDetails }: { restaurant: Restaurant; onViewDetails: (id: string) => void }) {
  const handleNavigate = () => {
    const destination = `${restaurant.latitude},${restaurant.longitude}`;
    const label = encodeURIComponent(restaurant.name);

    // Detect platform
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    if (isIOS) {
      // iOS: This will show options for Apple Maps, Google Maps, Waze, etc.
      window.open(`maps://maps.apple.com/?daddr=${destination}&q=${label}`, '_blank');
    } else if (isAndroid) {
      // Android: This will show available navigation apps
      window.open(`geo:0,0?q=${destination}(${label})`, '_blank');
    } else {
      // Desktop/Other: Open Google Maps in browser
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}&destination_place_id=${label}`, '_blank');
    }
  };

  return (
    <Marker
      position={[restaurant.latitude, restaurant.longitude]}
      icon={restaurantIcon}
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
            {restaurant.average_rating && (
              <div className="flex items-center">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                <span>{restaurant.average_rating.toFixed(1)}</span>
              </div>
            )}
            {restaurant.price_level && (
              <div className="flex items-center">
                {Array.from({ length: restaurant.price_level }).map((_, i) => (
                  <Euro key={i} className="h-3 w-3" />
                ))}
              </div>
            )}
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

          <div className="flex gap-2 mt-2">
            <button
              onClick={() => onViewDetails(restaurant.id)}
              className="flex-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-1"
            >
              <Info className="h-4 w-4" />
              Info
            </button>
            <button
              onClick={handleNavigate}
              className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
            >
              <Navigation className="h-4 w-4" />
              Navigeer
            </button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

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

      setRestaurants((data || []) as Restaurant[]);
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
    <Layout>
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
              <RestaurantMarker
                key={restaurant.id}
                restaurant={restaurant}
                onViewDetails={handleMarkerClick}
              />
            ))}

            {/* User location marker */}
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
    </Layout>
  );
}
