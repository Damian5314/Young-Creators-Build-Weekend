import { Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { MapPin, Star, Euro, Navigation, Info } from 'lucide-react';
import { Restaurant } from '@/shared/types';

const restaurantIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface RestaurantMarkerProps {
  restaurant: Restaurant;
  onViewDetails: (id: string) => void;
}

export function RestaurantMarker({ restaurant, onViewDetails }: RestaurantMarkerProps) {
  const handleNavigate = () => {
    const lat = restaurant.latitude;
    const lng = restaurant.longitude;
    const label = encodeURIComponent(restaurant.name);

    // Detect platform
    const userAgent = navigator.userAgent || navigator.vendor;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
    const isAndroid = /Android/.test(userAgent);

    // Always use Google Maps URL as it works on all platforms
    // On mobile devices, it will open in the native Google Maps app if installed
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${label}`;

    if (isIOS) {
      // Try Apple Maps first, fallback to Google Maps
      // Using comgooglemaps:// for Google Maps app on iOS
      const appleMapsUrl = `https://maps.apple.com/?daddr=${lat},${lng}&q=${label}`;
      window.open(appleMapsUrl, '_blank');
    } else if (isAndroid) {
      // Use Google Maps URL - Android will prompt to open in app
      window.open(googleMapsUrl, '_blank');
    } else {
      // Desktop: Open Google Maps in browser
      window.open(googleMapsUrl, '_blank');
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
