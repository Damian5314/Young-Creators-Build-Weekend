import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, Plus, Edit, Trash2, Video, Eye, Heart, X, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Restaurant, Video as VideoType } from '@/lib/types';
import { toast } from 'sonner';

const CUISINE_OPTIONS = ['Thai', 'Sushi', 'Ramen', 'Burger', 'Brunch', 'Italian', 'Mexican', 'Indian', 'Chinese', 'Mediterranean'];

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRestaurantForm, setShowRestaurantForm] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [saving, setSaving] = useState(false);

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

  const [videoForm, setVideoForm] = useState({
    title: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
  });

  useEffect(() => {
    if (!user || profile?.role !== 'OWNER') {
      navigate('/');
      return;
    }
    fetchRestaurants();
  }, [user, profile]);

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

  const saveVideo = async () => {
    if (!selectedRestaurant) return;
    setSaving(true);

    const { error } = await supabase
      .from('videos')
      .insert({
        ...videoForm,
        restaurant_id: selectedRestaurant.id,
        tags: [],
      });

    if (error) {
      toast.error('Failed to add video');
    } else {
      toast.success('Video added!');
      fetchVideos(selectedRestaurant.id);
    }

    setShowVideoForm(false);
    setVideoForm({ title: '', description: '', video_url: '', thumbnail_url: '' });
    setSaving(false);
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
            <motion.div
              key={restaurant.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl border border-border p-4"
            >
              <div className="flex items-start gap-4">
                <div className="h-20 w-20 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                  {restaurant.image_url ? (
                    <img src={restaurant.image_url} alt={restaurant.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-3xl">🍽️</div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{restaurant.name}</h3>
                  <p className="text-sm text-muted-foreground">{restaurant.city}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {restaurant.halal && <span className="halal-badge text-xs">Halal</span>}
                    {restaurant.cuisine_types.slice(0, 2).map(c => (
                      <span key={c} className="tag-chip text-xs">{c}</span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="icon" onClick={() => openEditRestaurant(restaurant)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="secondary" size="icon" onClick={() => deleteRestaurant(restaurant.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-border">
                <Button variant="secondary" className="w-full" onClick={() => openRestaurantVideos(restaurant)}>
                  <Video className="h-4 w-4 mr-2" />
                  Manage Videos
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Restaurant form modal */}
      <AnimatePresence>
        {showRestaurantForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm overflow-y-auto"
          >
            <div className="min-h-screen flex items-start justify-center p-4 py-12">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-lg rounded-3xl bg-card p-6 shadow-elevated"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-display font-bold">
                    {editingRestaurant ? 'Edit Restaurant' : 'Add Restaurant'}
                  </h2>
                  <Button variant="ghost" size="icon" onClick={() => {
                    setShowRestaurantForm(false);
                    setEditingRestaurant(null);
                    resetRestaurantForm();
                  }}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <Input
                    placeholder="Restaurant name"
                    value={restaurantForm.name}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, name: e.target.value })}
                  />
                  <Textarea
                    placeholder="Description"
                    value={restaurantForm.description}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, description: e.target.value })}
                  />
                  <Input
                    placeholder="Address"
                    value={restaurantForm.address}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, address: e.target.value })}
                  />
                  <Input
                    placeholder="City"
                    value={restaurantForm.city}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, city: e.target.value })}
                  />
                  <Input
                    placeholder="Opening hours (e.g. 10:00 - 22:00)"
                    value={restaurantForm.opening_hours}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, opening_hours: e.target.value })}
                  />
                  <Input
                    placeholder="Image URL"
                    value={restaurantForm.image_url}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, image_url: e.target.value })}
                  />

                  {/* Price level */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Price Level</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4].map((level) => (
                        <Button
                          key={level}
                          variant={restaurantForm.price_level === level ? 'default' : 'secondary'}
                          size="sm"
                          onClick={() => setRestaurantForm({ ...restaurantForm, price_level: level })}
                        >
                          {'€'.repeat(level)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Halal toggle */}
                  <button
                    onClick={() => setRestaurantForm({ ...restaurantForm, halal: !restaurantForm.halal })}
                    className={`w-full p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${
                      restaurantForm.halal ? 'border-primary bg-primary/10' : 'border-secondary'
                    }`}
                  >
                    <span className="text-xl">🥩</span>
                    <span className="font-medium">Halal</span>
                  </button>

                  {/* Cuisines */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Cuisines</label>
                    <div className="flex flex-wrap gap-2">
                      {CUISINE_OPTIONS.map((cuisine) => (
                        <button
                          key={cuisine}
                          onClick={() => {
                            const cuisines = restaurantForm.cuisine_types.includes(cuisine)
                              ? restaurantForm.cuisine_types.filter(c => c !== cuisine)
                              : [...restaurantForm.cuisine_types, cuisine];
                            setRestaurantForm({ ...restaurantForm, cuisine_types: cuisines });
                          }}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                            restaurantForm.cuisine_types.includes(cuisine)
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary'
                          }`}
                        >
                          {cuisine}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button onClick={saveRestaurant} disabled={!restaurantForm.name || saving} className="w-full">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {editingRestaurant ? 'Update' : 'Create'} Restaurant
                  </Button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Videos modal */}
      <AnimatePresence>
        {selectedRestaurant && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background"
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center gap-4 p-4 border-b border-border">
                <Button variant="ghost" size="icon" onClick={() => setSelectedRestaurant(null)}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                  <h2 className="font-bold">{selectedRestaurant.name}</h2>
                  <p className="text-sm text-muted-foreground">Videos</p>
                </div>
                <Button size="sm" onClick={() => setShowVideoForm(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Video
                </Button>
              </div>

              {/* Videos list */}
              <div className="flex-1 overflow-y-auto p-4">
                {videos.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No videos yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {videos.map((video) => (
                      <div
                        key={video.id}
                        className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border"
                      >
                        <div className="h-16 w-24 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                          {video.thumbnail_url ? (
                            <img src={video.thumbnail_url} alt={video.title} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Video className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{video.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {video.view_count}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="h-4 w-4" />
                              {video.like_count}
                            </span>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => deleteVideo(video.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Add video form */}
            <AnimatePresence>
              {showVideoForm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
                  onClick={() => setShowVideoForm(false)}
                >
                  <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.95 }}
                    className="w-full max-w-md rounded-3xl bg-card p-6 shadow-elevated"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 className="text-lg font-display font-bold mb-4">Add Video</h3>
                    <div className="space-y-4">
                      <Input
                        placeholder="Video title"
                        value={videoForm.title}
                        onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                      />
                      <Textarea
                        placeholder="Description"
                        value={videoForm.description}
                        onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                      />
                      <Input
                        placeholder="Video URL"
                        value={videoForm.video_url}
                        onChange={(e) => setVideoForm({ ...videoForm, video_url: e.target.value })}
                      />
                      <Input
                        placeholder="Thumbnail URL"
                        value={videoForm.thumbnail_url}
                        onChange={(e) => setVideoForm({ ...videoForm, thumbnail_url: e.target.value })}
                      />
                      <div className="flex gap-3">
                        <Button variant="secondary" onClick={() => setShowVideoForm(false)} className="flex-1">
                          Cancel
                        </Button>
                        <Button 
                          onClick={saveVideo} 
                          disabled={!videoForm.title || !videoForm.video_url || saving}
                          className="flex-1"
                        >
                          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
