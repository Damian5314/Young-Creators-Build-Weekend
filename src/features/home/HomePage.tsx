import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed, ChefHat } from 'lucide-react';
import { toast } from 'sonner';

import { AppLayout } from '@/shared/components';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/shared/hooks';
import { VideoWithRestaurant, Recipe } from '@/shared/types';

import { VideoCard, RecipeCard, SaveToCollectionModal, ActionModal, ShareModal } from './components';

export default function HomePage() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [videos, setVideos] = useState<VideoWithRestaurant[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeRecipeIndex, setActiveRecipeIndex] = useState(0);
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
  const [likedRecipes, setLikedRecipes] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'restaurants' | 'recipes'>('restaurants');
  const [isMuted, setIsMuted] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const recipeContainerRef = useRef<HTMLDivElement>(null);

  const [saveModal, setSaveModal] = useState<{ open: boolean; videoId: string | null }>({
    open: false,
    videoId: null,
  });
  const [actionModal, setActionModal] = useState<{
    open: boolean;
    type: 'order' | 'reserve';
    restaurantName: string;
  }>({
    open: false,
    type: 'order',
    restaurantName: '',
  });
  const [shareModal, setShareModal] = useState<{
    open: boolean;
    itemId: string;
    itemType: 'RESTAURANT' | 'RECIPE';
    itemName: string;
  }>({
    open: false,
    itemId: '',
    itemType: 'RESTAURANT',
    itemName: '',
  });

  useEffect(() => {
    if (!authLoading && user && profile && !profile.onboarding_completed) {
      navigate('/onboarding');
      return;
    }

    fetchVideos();
    fetchRecipes();
    if (user) {
      fetchLikedVideos();
      fetchLikedRecipes();
    }
  }, [user, profile, authLoading]);

  const fetchVideos = async () => {
    const { data, error } = await supabase
      .from('videos')
      .select(`*, restaurant:restaurants(*)`)
      .order('like_count', { ascending: false })
      .limit(20);

    if (!error && data) {
      setVideos(data as VideoWithRestaurant[]);
    }
    setLoading(false);
  };

  const fetchLikedVideos = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_likes')
      .select('video_id')
      .eq('user_id', user.id);

    if (data) {
      setLikedVideos(new Set(data.map((l) => l.video_id)));
    }
  };

  const fetchRecipes = async () => {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .not('video_url', 'is', null)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      setRecipes(data as Recipe[]);
    }
    setLoading(false);
  };

  const fetchLikedRecipes = async () => {
    if (!user) return;

    // For now, we'll use collection items to track liked recipes
    // You might want to create a separate user_recipe_likes table later
    const { data } = await supabase
      .from('collection_items')
      .select('item_id')
      .eq('item_type', 'RECIPE');

    if (data) {
      setLikedRecipes(new Set(data.map((l) => l.item_id)));
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
      await supabase.from('user_likes').delete().eq('user_id', user.id).eq('video_id', videoId);
      await supabase.rpc('decrement_video_like', { video_uuid: videoId });

      setLikedVideos((prev) => {
        const next = new Set(prev);
        next.delete(videoId);
        return next;
      });

      setVideos((prev) =>
        prev.map((v) => (v.id === videoId ? { ...v, like_count: Math.max(0, v.like_count - 1) } : v))
      );
    } else {
      await supabase.from('user_likes').insert({ user_id: user.id, video_id: videoId });
      await supabase.rpc('increment_video_stat', { video_uuid: videoId, stat_type: 'like' });

      setLikedVideos((prev) => new Set([...prev, videoId]));
      setVideos((prev) =>
        prev.map((v) => (v.id === videoId ? { ...v, like_count: v.like_count + 1 } : v))
      );
    }
  };

  const handleScroll = () => {
    if (!containerRef.current) return;

    const scrollTop = containerRef.current.scrollTop;
    const cardHeight = window.innerHeight;
    const newIndex = Math.round(scrollTop / cardHeight);

    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);

      const video = videos[newIndex];
      if (video) {
        supabase.rpc('increment_video_stat', {
          video_uuid: video.id,
          stat_type: 'view',
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

      const recipe = recipes[newIndex];
      if (recipe) {
        // Increment recipe view count
        supabase
          .from('recipes')
          .update({ view_count: recipe.view_count + 1 } as any)
          .eq('id', recipe.id)
          .then(() => {});
      }
    }
  };

  const handleLikeRecipe = async (recipeId: string) => {
    if (!user) {
      toast.error('Please sign in to like recipes');
      navigate('/auth');
      return;
    }

    const isLiked = likedRecipes.has(recipeId);
    const recipe = recipes.find((r) => r.id === recipeId);
    if (!recipe) return;

    if (isLiked) {
      // Unlike: remove from collection
      const { data: collectionItem } = await supabase
        .from('collection_items')
        .select('id')
        .eq('item_id', recipeId)
        .eq('item_type', 'RECIPE')
        .single();

      if (collectionItem) {
        await supabase.from('collection_items').delete().eq('id', collectionItem.id);
      }

      await supabase
        .from('recipes')
        .update({ like_count: Math.max(0, recipe.like_count - 1) } as any)
        .eq('id', recipeId);

      setLikedRecipes((prev) => {
        const next = new Set(prev);
        next.delete(recipeId);
        return next;
      });

      setRecipes((prev) =>
        prev.map((r) => (r.id === recipeId ? { ...r, like_count: Math.max(0, r.like_count - 1) } : r))
      );
    } else {
      // Like: add to favorites collection
      const { data: favCollection } = await supabase
        .from('collections')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', 'Favorites')
        .eq('type', 'RECIPE')
        .single();

      let collectionId = favCollection?.id;

      if (!collectionId) {
        const { data: newCollection } = await supabase
          .from('collections')
          .insert({ user_id: user.id, name: 'Favorites', type: 'RECIPE' })
          .select('id')
          .single();
        collectionId = newCollection?.id;
      }

      if (collectionId) {
        await supabase
          .from('collection_items')
          .insert({ collection_id: collectionId, item_id: recipeId, item_type: 'RECIPE' });
      }

      await supabase
        .from('recipes')
        .update({ like_count: recipe.like_count + 1 } as any)
        .eq('id', recipeId);

      setLikedRecipes((prev) => new Set([...prev, recipeId]));
      setRecipes((prev) =>
        prev.map((r) => (r.id === recipeId ? { ...r, like_count: r.like_count + 1 } : r))
      );
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
        {/* Centered Category Tabs */}
        <div className="fixed top-0 left-0 right-0 z-30 flex justify-center pt-4 safe-top-with-padding">
          <TabsList className="h-11 bg-black/40 backdrop-blur-md border border-white/20 rounded-full px-1">
            <TabsTrigger
              value="restaurants"
              className="flex items-center gap-2 rounded-full px-4 data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all text-white/70"
            >
              <UtensilsCrossed className="h-4 w-4" />
              Restaurants
            </TabsTrigger>
            <TabsTrigger
              value="recipes"
              className="flex items-center gap-2 rounded-full px-4 data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all text-white/70"
            >
              <ChefHat className="h-4 w-4" />
              Recepten
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Restaurant Videos Tab */}
        <TabsContent value="restaurants" className="flex-1 mt-0">
          {videos.length === 0 ? (
            <div className="empty-state h-screen">
              <div className="empty-state-icon">
                <span className="text-4xl">🍽️</span>
              </div>
              <h1 className="empty-state-title">No videos yet</h1>
              <p className="empty-state-description">Check back soon for delicious food content!</p>
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
                  isMuted={isMuted}
                  onToggleMute={() => setIsMuted(!isMuted)}
                  onLike={() => handleLike(video.id)}
                  onSave={() => {
                    if (!user) {
                      toast.error('Please sign in to save');
                      navigate('/auth');
                      return;
                    }
                    setSaveModal({ open: true, videoId: video.id });
                  }}
                  onOrder={() =>
                    setActionModal({
                      open: true,
                      type: 'order',
                      restaurantName: video.restaurant.name,
                    })
                  }
                  onReserve={() =>
                    setActionModal({
                      open: true,
                      type: 'reserve',
                      restaurantName: video.restaurant.name,
                    })
                  }
                  onShare={() =>
                    setShareModal({
                      open: true,
                      itemId: video.restaurant.id,
                      itemType: 'RESTAURANT',
                      itemName: video.restaurant.name,
                    })
                  }
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Recipes Tab */}
        <TabsContent value="recipes" className="flex-1 mt-0">
          {recipes.length === 0 ? (
            <div className="empty-state h-screen">
              <div className="empty-state-icon">
                <ChefHat className="h-16 w-16 text-muted-foreground" />
              </div>
              <h1 className="empty-state-title">Geen recepten gevonden</h1>
              <p className="empty-state-description">Probeer de AI Chef op de Cook pagina!</p>
            </div>
          ) : (
            <div
              ref={recipeContainerRef}
              className="h-screen overflow-y-scroll snap-y snap-mandatory no-scrollbar overscroll-none"
              onScroll={handleRecipeScroll}
            >
              {recipes.map((recipe, index) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  isActive={index === activeRecipeIndex && activeTab === 'recipes'}
                  isLiked={likedRecipes.has(recipe.id)}
                  isMuted={isMuted}
                  onToggleMute={() => setIsMuted(!isMuted)}
                  onLike={() => handleLikeRecipe(recipe.id)}
                  onSave={() => {
                    if (!user) {
                      toast.error('Please sign in to save');
                      navigate('/auth');
                      return;
                    }
                    setSaveModal({ open: true, videoId: recipe.id });
                  }}
                  onShare={() =>
                    setShareModal({
                      open: true,
                      itemId: recipe.id,
                      itemType: 'RECIPE',
                      itemName: recipe.title,
                    })
                  }
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

      <ShareModal
        isOpen={shareModal.open}
        onClose={() => setShareModal({ ...shareModal, open: false })}
        itemId={shareModal.itemId}
        itemType={shareModal.itemType}
        itemName={shareModal.itemName}
      />
    </AppLayout>
  );
}
