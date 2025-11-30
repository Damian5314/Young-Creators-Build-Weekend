import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Plus, Loader2, ArrowLeft, Video as VideoIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/shared/hooks';
import { Restaurant, Video as VideoType } from '@/shared/types';
import { toast } from 'sonner';
import { RestaurantCard, RestaurantFormModal, VideoManagementModal } from './components';
import { BuyCreditsDialog } from '@/components/BuyCreditsDialog';
import { paymentsApi } from '@/api/payments';
import { Card } from '@/components/ui/card';

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRestaurantForm, setShowRestaurantForm] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [saving, setSaving] = useState(false);
  const [videoCredits, setVideoCredits] = useState<number>(0);
  const [showBuyCreditsDialog, setShowBuyCreditsDialog] = useState(false);

  const [restaurantForm, setRestaurantForm] = useState({
    name: '',
    description: '',
    address: '',
    city: 'Rotterdam',
    latitude: 51.9225,
    longitude: 4.47917,
    cuisine_types: [] as string[],
    halal: false,
    price_level: 2,
    opening_hours: '',
    image_url: '',
  });

  useEffect(() => {
    if (!user || profile?.role !== 'OWNER') {
      navigate('/');
      return;
    }
    fetchRestaurants();
    fetchCredits();
  }, [user, profile]);

  const fetchCredits = async () => {
    try {
      const credits = await paymentsApi.getCredits();
      setVideoCredits(credits);
    } catch (error) {
      console.error('Failed to fetch credits:', error);
    }
  };

  const fetchRestaurants = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('restaurants')
      .select('*')
      .eq('owner_id', user.id);

    if (data) {
      setRestaurants(data as Restaurant[]);
    }
    setLoading(false);
  };

  const fetchVideos = async (restaurantId: string) => {
    const { data } = await supabase
      .from('videos')
      .select('*')
      .eq('restaurant_id', restaurantId);

    if (data) {
      setVideos(data as VideoType[]);
    }
  };

  const saveRestaurant = async () => {
    if (!user) return;
    setSaving(true);

    if (editingRestaurant) {
      const { error } = await supabase
        .from('restaurants')
        .update(restaurantForm)
        .eq('id', editingRestaurant.id);

      if (error) {
        toast.error('Failed to update restaurant');
      } else {
        toast.success('Restaurant updated!');
        fetchRestaurants();
      }
    } else {
      const { error } = await supabase
        .from('restaurants')
        .insert({
          ...restaurantForm,
          owner_id: user.id,
        });

      if (error) {
        toast.error('Failed to create restaurant');
      } else {
        toast.success('Restaurant created!');
        fetchRestaurants();
      }
    }

    setShowRestaurantForm(false);
    setEditingRestaurant(null);
    resetRestaurantForm();
    setSaving(false);
  };

  const deleteRestaurant = async (id: string) => {
    if (!confirm('Are you sure? This will delete all videos too.')) return;

    await supabase.from('restaurants').delete().eq('id', id);
    setRestaurants(restaurants.filter(r => r.id !== id));
    toast.success('Restaurant deleted');
  };

  const deleteVideo = async (id: string) => {
    if (!selectedRestaurant) return;
    
    await supabase.from('videos').delete().eq('id', id);
    setVideos(videos.filter(v => v.id !== id));
    toast.success('Video deleted');
  };

  const resetRestaurantForm = () => {
    setRestaurantForm({
      name: '',
      description: '',
      address: '',
      city: 'Rotterdam',
      latitude: 51.9225,
      longitude: 4.47917,
      cuisine_types: [],
      halal: false,
      price_level: 2,
      opening_hours: '',
      image_url: '',
    });
  };

  const openEditRestaurant = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant);
    setRestaurantForm({
      name: restaurant.name,
      description: restaurant.description || '',
      address: restaurant.address || '',
      city: restaurant.city,
      latitude: restaurant.latitude,
      longitude: restaurant.longitude,
      cuisine_types: restaurant.cuisine_types,
      halal: restaurant.halal,
      price_level: restaurant.price_level,
      opening_hours: restaurant.opening_hours || '',
      image_url: restaurant.image_url || '',
    });
    setShowRestaurantForm(true);
  };

  const openRestaurantVideos = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    fetchVideos(restaurant.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="flex items-center gap-4 pt-4 pb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-display font-bold">Restaurant Dashboard</h1>
          <p className="text-muted-foreground">Manage your restaurants and videos</p>
        </div>
        <Button onClick={() => setShowRestaurantForm(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Add Restaurant
        </Button>
      </div>

      {/* Video Credits Card */}
      <Card className="mb-6 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <VideoIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Video Credits</h3>
              <p className="text-sm text-muted-foreground">
                Je hebt nog {videoCredits} video upload{videoCredits !== 1 ? 's' : ''} beschikbaar
              </p>
            </div>
          </div>
          <Button onClick={() => setShowBuyCreditsDialog(true)} variant="outline">
            <Plus className="h-4 w-4 mr-1" />
            Koop Credits
          </Button>
        </div>
      </Card>

      {/* Restaurants list */}
      {restaurants.length === 0 ? (
        <div className="text-center py-12">
          <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-secondary flex items-center justify-center">
            <Store className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-4">No restaurants yet</p>
          <Button onClick={() => setShowRestaurantForm(true)}>Add your first restaurant</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {restaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              onEdit={openEditRestaurant}
              onDelete={deleteRestaurant}
              onManageVideos={openRestaurantVideos}
            />
          ))}
        </div>
      )}

      {/* Restaurant form modal */}
      <RestaurantFormModal
        isOpen={showRestaurantForm}
        onClose={() => {
          setShowRestaurantForm(false);
          setEditingRestaurant(null);
          resetRestaurantForm();
        }}
        onSave={saveRestaurant}
        editingRestaurant={editingRestaurant}
        formData={restaurantForm}
        setFormData={setRestaurantForm}
        saving={saving}
      />

      {/* Videos modal */}
      {selectedRestaurant && (
        <VideoManagementModal
          isOpen={!!selectedRestaurant}
          onClose={() => setSelectedRestaurant(null)}
          restaurant={selectedRestaurant}
          videos={videos}
          onAddVideo={async (video) => {
            // Check if user has credits
            if (videoCredits <= 0) {
              setShowBuyCreditsDialog(true);
              toast.error('Je hebt geen video credits meer. Koop eerst credits om door te gaan.');
              return;
            }

            setSaving(true);
            const { error } = await supabase
              .from('videos')
              .insert({
                ...video,
                restaurant_id: selectedRestaurant.id,
                tags: [],
              });
            if (error) {
              toast.error('Failed to add video');
            } else {
              // Decrement credits locally
              setVideoCredits(videoCredits - 1);
              toast.success('Video added!');
              fetchVideos(selectedRestaurant.id);
              fetchCredits(); // Refresh from server
            }
            setSaving(false);
          }}
          onDeleteVideo={deleteVideo}
          saving={saving}
        />
      )}

      {/* Buy Credits Dialog */}
      <BuyCreditsDialog
        open={showBuyCreditsDialog}
        onOpenChange={setShowBuyCreditsDialog}
        onPurchaseComplete={() => {
          fetchCredits();
        }}
      />
    </div>
  );
}
