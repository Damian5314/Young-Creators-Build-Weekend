import { useState, useEffect, useRef } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { VideoCard } from '@/components/feed/VideoCard';
import { RecipeVideoCard } from '@/components/feed/RecipeVideoCard';
import { SaveToCollectionModal } from '@/components/modals/SaveToCollectionModal';
import { ActionModal } from '@/components/modals/ActionModal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { VideoWithRestaurant } from '@/lib/types';
import { RecipeVideo, fetchTikTokRecipeVideos } from '@/services/apify';
import { toast } from 'sonner';
import { UtensilsCrossed, ChefHat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Index() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // State for restaurant videos
  const [videos, setVideos] = useState<VideoWithRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());

  // State for recipe videos
  const [recipeVideos, setRecipeVideos] = useState<RecipeVideo[]>([]);
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [activeRecipeIndex, setActiveRecipeIndex] = useState(0);
  const [likedRecipes, setLikedRecipes] = useState<Set<string>>(new Set());

  // Active tab state
  const [activeTab, setActiveTab] = useState<'restaurants' | 'recipes'>('restaurants');

  const containerRef = useRef<HTMLDivElement>(null);
  const recipeContainerRef = useRef<HTMLDivElement>(null);

  // Modal states
  const [saveModal, setSaveModal] = useState<{ open: boolean; videoId: string | null }>({
    open: false,
    videoId: null
  });
  const [actionModal, setActionModal] = useState<{
    open: boolean;
    type: 'order' | 'reserve';
    restaurantName: string
  }>({
    open: false,
    type: 'order',
    restaurantName: ''
  });

  useEffect(() => {
    // Redirect to onboarding if not completed
    if (!authLoading && user && profile && !profile.onboarding_completed) {
      navigate('/onboarding');
      return;
    }

    fetchVideos();
    if (user) {
      fetchLikedVideos();
    }
  }, [user, profile, authLoading]);

  // Fetch recipe videos when switching to recipes tab
  useEffect(() => {
    if (activeTab === 'recipes' && recipeVideos.length === 0) {
      fetchRecipeVideos();
    }
  }, [activeTab]);

  const fetchVideos = async () => {
    const { data, error } = await supabase
      .from('videos')
      .select(`
        *,
        restaurant:restaurants(*)
      `)
      .order('like_count', { ascending: false })
      .limit(20);

    if (!error && data) {
      setVideos(data as VideoWithRestaurant[]);
    }
    setLoading(false);
  };

  const fetchRecipeVideos = async () => {
    try {
      setRecipeLoading(true);
      const recipes = await fetchTikTokRecipeVideos();
      setRecipeVideos(recipes);
    } catch (error) {
      console.error('Error fetching recipe videos:', error);
      toast.error('Kon recepten niet laden');
    } finally {
      setRecipeLoading(false);
    }
  };

  const fetchLikedVideos = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_likes')
      .select('video_id')
      .eq('user_id', user.id);

    if (data) {
      setLikedVideos(new Set(data.map(l => l.video_id)));
    }
  };

  const handleLike = async (videoId: string) => {
    if (!user) {
      toast.error('Please sign in to like videos');
      navigate('/auth');
      return;
    }

    const isLiked = likedVideos.has(videoId);

    if (isLiked) {
      // Unlike
      await supabase
        .from('user_likes')
        .delete()
        .eq('user_id', user.id)
        .eq('video_id', videoId);

      await supabase.rpc('decrement_video_like', { video_uuid: videoId });

      setLikedVideos(prev => {
        const next = new Set(prev);
        next.delete(videoId);
        return next;
      });

      setVideos(prev => prev.map(v =>
        v.id === videoId ? { ...v, like_count: Math.max(0, v.like_count - 1) } : v
      ));
    } else {
      // Like
      await supabase
        .from('user_likes')
        .insert({ user_id: user.id, video_id: videoId });

      await supabase.rpc('increment_video_stat', { video_uuid: videoId, stat_type: 'like' });

      // Also add to Favorites collection
      const { data: favCollection } = await supabase
        .from('collections')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', 'Favorites')
        .single();

      if (favCollection) {
        await supabase
          .from('collection_items')
          .upsert({
            collection_id: favCollection.id,
            item_type: 'VIDEO',
            item_id: videoId
          }, { onConflict: 'collection_id,item_id' });
      }

      setLikedVideos(prev => new Set([...prev, videoId]));

      setVideos(prev => prev.map(v =>
        v.id === videoId ? { ...v, like_count: v.like_count + 1 } : v
      ));
    }
  };

  const handleRecipeLike = (recipeId: string) => {
    if (!user) {
      toast.error('Please sign in to like videos');
      navigate('/auth');
      return;
    }

    setLikedRecipes(prev => {
      const next = new Set(prev);
      if (next.has(recipeId)) {
        next.delete(recipeId);
      } else {
        next.add(recipeId);
      }
      return next;
    });

    // Update like count optimistically
    setRecipeVideos(prev => prev.map(v =>
      v.id === recipeId
        ? { ...v, likeCount: likedRecipes.has(recipeId) ? v.likeCount - 1 : v.likeCount + 1 }
        : v
    ));
  };

  const handleRecipeSave = (recipeId: string) => {
    if (!user) {
      toast.error('Please sign in to save');
      navigate('/auth');
      return;
    }
    toast.success('Recipe saved!');
  };

  const handleScroll = () => {
    if (!containerRef.current) return;

    const scrollTop = containerRef.current.scrollTop;
    const cardHeight = window.innerHeight;
    const newIndex = Math.round(scrollTop / cardHeight);

    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);

      // Track view
      const video = videos[newIndex];
      if (video) {
        supabase.rpc('increment_video_stat', {
          video_uuid: video.id,
          stat_type: 'view'
        });
      }
    }
  };

  const handleRecipeScroll = () => {
    if (!recipeContainerRef.current) return;

    const scrollTop = recipeContainerRef.current.scrollTop;
    const cardHeight = window.innerHeight;
    const newIndex = Math.round(scrollTop / cardHeight);

    if (newIndex !== activeRecipeIndex) {
      setActiveRecipeIndex(newIndex);
    }
  };

  if (loading || authLoading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-screen gap-4">
          <div className="h-12 w-12 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading delicious content...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as 'restaurants' | 'recipes')}
        className="h-screen flex flex-col"
      >
        {/* Fixed Tabs Header - Glassmorphism Style */}
        <div className="fixed top-0 left-0 right-0 z-30 backdrop-blur-xl border-b border-white/10" style={{
          background: 'rgba(0, 0, 0, 0.3)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)'
        }}>
          <div className="px-4 pt-3 pb-2" style={{ paddingTop: 'env(safe-area-inset-top, 12px)' }}>
            <TabsList className="grid w-full grid-cols-2 h-11 bg-white/10 backdrop-blur-md border border-white/20">
              <TabsTrigger value="restaurants" className="flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all text-white/70">
                <UtensilsCrossed className="h-4 w-4" />
                Restaurants
              </TabsTrigger>
              <TabsTrigger value="recipes" className="flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all text-white/70">
                <ChefHat className="h-4 w-4" />
                Recepten
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Restaurant Videos Tab */}
        <TabsContent value="restaurants" className="flex-1 mt-0">
          {videos.length === 0 ? (
            <div className="empty-state h-screen">
              <div className="empty-state-icon">
                <span className="text-4xl">🍽️</span>
              </div>
              <h1 className="empty-state-title">No videos yet</h1>
              <p className="empty-state-description">
                Check back soon for delicious food content!
              </p>
            </div>
          ) : (
            <div
              ref={containerRef}
              className="h-screen overflow-y-scroll snap-y snap-mandatory no-scrollbar overscroll-none"
              onScroll={handleScroll}
            >
              {videos.map((video, index) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  isActive={index === activeIndex && activeTab === 'restaurants'}
                  isLiked={likedVideos.has(video.id)}
                  onLike={() => handleLike(video.id)}
                  onSave={() => {
                    if (!user) {
                      toast.error('Please sign in to save');
                      navigate('/auth');
                      return;
                    }
                    setSaveModal({ open: true, videoId: video.id });
                  }}
                  onOrder={() => setActionModal({
                    open: true,
                    type: 'order',
                    restaurantName: video.restaurant.name
                  })}
                  onReserve={() => setActionModal({
                    open: true,
                    type: 'reserve',
                    restaurantName: video.restaurant.name
                  })}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Recipe Videos Tab */}
        <TabsContent value="recipes" className="flex-1 mt-0">
          {recipeLoading ? (
            <div className="flex flex-col items-center justify-center h-screen gap-4">
              <div className="h-12 w-12 border-3 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Recepten laden...</p>
            </div>
          ) : recipeVideos.length === 0 ? (
            <div className="empty-state h-screen">
              <div className="empty-state-icon">
                <ChefHat className="h-16 w-16 text-muted-foreground" />
              </div>
              <h1 className="empty-state-title">Geen recepten gevonden</h1>
              <p className="empty-state-description">
                Probeer het later opnieuw!
              </p>
            </div>
          ) : (
            <div
              ref={recipeContainerRef}
              className="h-screen overflow-y-scroll snap-y snap-mandatory no-scrollbar overscroll-none"
              onScroll={handleRecipeScroll}
            >
              {recipeVideos.map((video, index) => (
                <RecipeVideoCard
                  key={video.id}
                  video={video}
                  isActive={index === activeRecipeIndex && activeTab === 'recipes'}
                  isLiked={likedRecipes.has(video.id)}
                  onLike={() => handleRecipeLike(video.id)}
                  onSave={() => handleRecipeSave(video.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <SaveToCollectionModal
        isOpen={saveModal.open}
        onClose={() => setSaveModal({ open: false, videoId: null })}
        itemId={saveModal.videoId || ''}
        itemType="VIDEO"
      />

      <ActionModal
        isOpen={actionModal.open}
        onClose={() => setActionModal({ ...actionModal, open: false })}
        type={actionModal.type}
        restaurantName={actionModal.restaurantName}
      />
    </AppLayout>
  );
}
