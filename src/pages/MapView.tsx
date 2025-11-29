import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, LatLngTuple } from 'leaflet';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Restaurant } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import { MapPin, Filter, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
const customIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const CUISINE_OPTIONS = ['Thai', 'Sushi', 'Ramen', 'Burger', 'Brunch', 'Italian', 'Mexican', 'Indian'];

function MapController({ center }: { center: LatLngTuple }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

export default function MapView() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filters
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [halalOnly, setHalalOnly] = useState(false);

  // Rotterdam center as default
  const [center] = useState<LatLngTuple>([51.9225, 4.47917]);

  useEffect(() => {
    fetchRestaurants();
  }, [selectedCuisines, halalOnly]);

  const fetchRestaurants = async () => {
    let query = supabase.from('restaurants').select('*');
    
    if (halalOnly) {
      query = query.eq('halal', true);
    }
    
    const { data, error } = await query;

    if (!error && data) {
      let filtered = data as Restaurant[];
      
      if (selectedCuisines.length > 0) {
        filtered = filtered.filter(r => 
          r.cuisine_types.some(c => selectedCuisines.includes(c))
        );
      }
      
      setRestaurants(filtered);
    }
    setLoading(false);
  };

  const toggleCuisine = (cuisine: string) => {
    setSelectedCuisines(prev => 
      prev.includes(cuisine) 
        ? prev.filter(c => c !== cuisine)
        : [...prev, cuisine]
    );
  };

  return (
    <AppLayout>
      <div className="relative h-[calc(100vh-5rem)]">
        {/* Map */}
        <MapContainer 
          center={center} 
          zoom={13} 
          className="h-full w-full z-0"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController center={center} />
          
          {restaurants.map((restaurant) => (
            <Marker 
              key={restaurant.id}
              position={[restaurant.latitude, restaurant.longitude]}
              icon={customIcon}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <h3 className="font-bold text-lg mb-1">{restaurant.name}</h3>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {restaurant.halal && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                        Halal
                      </span>
                    )}
                    {restaurant.cuisine_types.slice(0, 2).map(c => (
                      <span key={c} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                        {c}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {restaurant.description}
                  </p>
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                  >
                    View Details
                  </Button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Filter button */}
        <Button
          variant="secondary"
          size="lg"
          className="absolute top-4 right-4 z-[1000] shadow-card"
          onClick={() => setShowFilters(true)}
        >
          <Filter className="h-5 w-5 mr-2" />
          Filters
          {(selectedCuisines.length > 0 || halalOnly) && (
            <span className="ml-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
              {selectedCuisines.length + (halalOnly ? 1 : 0)}
            </span>
          )}
        </Button>

        {/* Restaurant count */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-card/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-card">
          <p className="text-sm font-medium">
            <MapPin className="h-4 w-4 inline mr-1 text-primary" />
            {restaurants.length} restaurants
          </p>
        </div>

        {/* Filters modal */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[2000] flex items-end justify-center bg-background/80 backdrop-blur-sm"
              onClick={() => setShowFilters(false)}
            >
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                className="w-full max-w-lg rounded-t-3xl bg-card p-6 shadow-elevated"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-display font-bold">Filters</h2>
                  <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Halal toggle */}
                <div className="mb-6">
                  <button
                    onClick={() => setHalalOnly(!halalOnly)}
                    className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all ${
                      halalOnly 
                        ? 'border-primary bg-primary/10' 
                        : 'border-secondary bg-secondary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🥩</span>
                      <span className="font-semibold">Halal only</span>
                    </div>
                    {halalOnly && <Check className="h-5 w-5 text-primary" />}
                  </button>
                </div>

                {/* Cuisine types */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                    Cuisine Type
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {CUISINE_OPTIONS.map((cuisine) => (
                      <button
                        key={cuisine}
                        onClick={() => toggleCuisine(cuisine)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          selectedCuisines.includes(cuisine)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-foreground hover:bg-secondary/80'
                        }`}
                      >
                        {cuisine}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => {
                      setSelectedCuisines([]);
                      setHalalOnly(false);
                    }}
                  >
                    Clear All
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => setShowFilters(false)}
                  >
                    Apply
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
