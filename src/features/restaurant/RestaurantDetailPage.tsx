import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Clock, Star, Play, ShoppingBag, CalendarCheck, Bookmark, Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Restaurant, Video } from '@/shared/types';
import { SaveToCollectionModal, ActionModal, ShareModal } from '@/features/home/components';
import { useAuth } from '@/shared/hooks';
import { toast } from 'sonner';

export default function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [similar, setSimilar] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [saveModal, setSaveModal] = useState(false);
  const [actionModal, setActionModal] = useState<{ open: boolean; type: 'order' | 'reserve' }>({
    open: false,
    type: 'order'
  });
  const [shareModal, setShareModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchRestaurant();
    }
  }, [id]);

  const fetchRestaurant = async () => {
    // Fetch restaurant
    const { data: restaurantData } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .single();

    if (restaurantData) {
      setRestaurant(restaurantData as Restaurant);

      // Fetch videos
      const { data: videoData } = await supabase
        .from('videos')
        .select('*')
        .eq('restaurant_id', id);

      if (videoData) {
        setVideos(videoData as Video[]);
      }

      // Fetch similar restaurants
      const { data: similarData } = await supabase
        .from('restaurants')
        .select('*')
        .eq('city', restaurantData.city)
        .neq('id', id)
        .limit(4);

      if (similarData) {
        setSimilar(similarData as Restaurant[]);
      }
    }

    setLoading(false);
  };

  const PriceLevel = ({ level }: { level: number }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4].map((i) => (
        <span 
          key={i} 
          className={`text-lg font-bold ${
            i <= level ? 'text-primary' : 'text-muted-foreground/30'
          }`}
        >
          €
        </span>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <h1 className="text-xl font-bold mb-2">Restaurant not found</h1>
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Hero */}
      <div className="relative h-72">
        <img 
          src={restaurant.image_url || videos[0]?.thumbnail_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'} 
          alt={restaurant.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
        {/* Back button */}
        <Button
          variant="glass"
          size="icon"
          className="absolute top-4 left-4 z-10"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="px-4 -mt-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-3xl font-display font-bold">{restaurant.name}</h1>
              {restaurant.halal && (
                <span className="halal-badge">Halal</span>
              )}
            </div>
            
            {/* Rating and price */}
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-gold text-gold" />
                <span className="font-semibold">{restaurant.average_rating.toFixed(1)}</span>
              </div>
              <PriceLevel level={restaurant.price_level} />
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {restaurant.cuisine_types.map((cuisine) => (
                <span key={cuisine} className="tag-chip">{cuisine}</span>
              ))}
            </div>

            {/* Location and hours */}
            <div className="space-y-2 text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{restaurant.address}, {restaurant.city}</span>
              </div>
              {restaurant.opening_hours && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{restaurant.opening_hours}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {restaurant.description && (
            <p className="text-muted-foreground mb-6">{restaurant.description}</p>
          )}

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <Button
              variant="order"
              size="lg"
              onClick={() => setActionModal({ open: true, type: 'order' })}
            >
              <ShoppingBag className="h-5 w-5 mr-2" />
              Order
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => setActionModal({ open: true, type: 'reserve' })}
            >
              <CalendarCheck className="h-5 w-5 mr-2" />
              Reserve
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => {
                if (!user) {
                  toast.error('Please sign in to save');
                  navigate('/auth');
                  return;
                }
                setSaveModal(true);
              }}
            >
              <Bookmark className="h-5 w-5 mr-2" />
              Save
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => setShareModal(true)}
            >
              <Share2 className="h-5 w-5 mr-2" />
              Delen
            </Button>
          </div>

          {/* Videos section */}
          {videos.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-display font-bold mb-4">Videos</h2>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {videos.map((video) => (
                  <button
                    key={video.id}
                    className="flex-shrink-0 w-32 group"
                    onClick={() => navigate('/')}
                  >
                    <div className="relative h-48 w-32 rounded-xl overflow-hidden mb-2">
                      <img 
                        src={video.thumbnail_url || restaurant.image_url || ''} 
                        alt={video.title}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-background/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="h-8 w-8 fill-foreground text-foreground" />
                      </div>
                      <div className="absolute bottom-2 left-2 flex items-center gap-1 text-xs text-foreground/90">
                        <Heart className="h-3 w-3" />
                        {video.like_count}
                      </div>
                    </div>
                    <p className="text-sm font-medium truncate">{video.title}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Similar restaurants */}
          {similar.length > 0 && (
            <div>
              <h2 className="text-lg font-display font-bold mb-4">Similar Nearby</h2>
              <div className="space-y-3">
                {similar.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => navigate(`/restaurant/${r.id}`)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="h-16 w-16 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                      {r.image_url ? (
                        <img src={r.image_url} alt={r.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-2xl">🍽️</div>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold">{r.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {r.cuisine_types.slice(0, 2).join(', ')}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Modals */}
      <SaveToCollectionModal
        isOpen={saveModal}
        onClose={() => setSaveModal(false)}
        itemId={restaurant.id}
        itemType="RESTAURANT"
      />

      <ActionModal
        isOpen={actionModal.open}
        onClose={() => setActionModal({ ...actionModal, open: false })}
        type={actionModal.type}
        restaurantName={restaurant.name}
      />

      <ShareModal
        isOpen={shareModal}
        onClose={() => setShareModal(false)}
        itemId={restaurant.id}
        itemType="RESTAURANT"
        itemName={restaurant.name}
      />
    </div>
  );
}
