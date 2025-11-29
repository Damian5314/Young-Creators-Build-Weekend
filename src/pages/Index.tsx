import { useState, useEffect, useRef } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { VideoCard } from '@/components/feed/VideoCard';
import { SaveToCollectionModal } from '@/components/modals/SaveToCollectionModal';
import { ActionModal } from '@/components/modals/ActionModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { VideoWithRestaurant } from '@/lib/types';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Index() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [videos, setVideos] = useState<VideoWithRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

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

      toast.success('Added to Favorites!');
    }
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

  if (loading || authLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (videos.length === 0) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-screen px-6 text-center">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <span className="text-4xl">🍽️</span>
          </div>
          <h1 className="text-2xl font-display font-bold mb-2">No videos yet</h1>
          <p className="text-muted-foreground">
            Check back soon for delicious food content!
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div 
        ref={containerRef}
        className="h-screen overflow-y-scroll snap-y snap-mandatory no-scrollbar"
        onScroll={handleScroll}
      >
        {videos.map((video, index) => (
          <VideoCard
            key={video.id}
            video={video}
            isActive={index === activeIndex}
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

      {/* Modals */}
      {saveModal.videoId && (
        <SaveToCollectionModal
          isOpen={saveModal.open}
          onClose={() => setSaveModal({ open: false, videoId: null })}
          itemId={saveModal.videoId}
          itemType="VIDEO"
        />
      )}

      <ActionModal
        isOpen={actionModal.open}
        onClose={() => setActionModal({ ...actionModal, open: false })}
        type={actionModal.type}
        restaurantName={actionModal.restaurantName}
      />
    </AppLayout>
  );
}
