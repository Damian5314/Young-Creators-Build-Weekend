import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Bookmark, MapPin, Clock, ChevronRight, ShoppingBag, CalendarCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VideoWithRestaurant } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface VideoCardProps {
  video: VideoWithRestaurant;
  isActive: boolean;
  isLiked: boolean;
  onLike: () => void;
  onSave: () => void;
  onOrder: () => void;
  onReserve: () => void;
}

export function VideoCard({
  video,
  isActive,
  isLiked,
  onLike,
  onSave,
  onOrder,
  onReserve,
}: VideoCardProps) {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showHeart, setShowHeart] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isActive]);

  const handleDoubleTap = () => {
    if (!isLiked) {
      onLike();
    }
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 800);
  };

  const PriceLevel = ({ level }: { level: number }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={cn(
            'text-sm font-bold',
            i <= level ? 'text-primary' : 'text-muted-foreground/30'
          )}
        >
          €
        </span>
      ))}
    </div>
  );

  return (
    <div
      className="relative h-[100dvh] w-full snap-start snap-always overflow-hidden bg-card"
      onDoubleClick={handleDoubleTap}
    >
      {/* Video/Thumbnail Background */}
      <div className="absolute inset-0">
        {video.video_url.includes('.mp4') || video.video_url.includes('video') ? (
          <video
            ref={videoRef}
            src={video.video_url}
            className="h-full w-full object-cover"
            loop
            muted
            playsInline
            poster={video.thumbnail_url || undefined}
          />
        ) : (
          <img
            src={video.thumbnail_url || video.video_url}
            alt={video.title}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      {/* Gradient Overlay */}
      <div className="video-overlay absolute inset-0" />

      {/* Heart animation on double tap */}
      <AnimatePresence>
        {showHeart && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-20"
          >
            <Heart className="h-32 w-32 fill-primary text-primary drop-shadow-lg" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right side action buttons */}
      <div className="absolute right-3 bottom-32 flex flex-col items-center gap-4 z-10">
        <div className="flex flex-col items-center gap-1">
          <Button
            variant="action"
            size="iconLg"
            onClick={onLike}
            className={cn(
              'shadow-lg backdrop-blur-sm',
              isLiked && 'bg-primary text-primary-foreground'
            )}
          >
            <Heart className={cn('h-6 w-6', isLiked && 'fill-current animate-heart-pop')} />
          </Button>
          <span className="text-xs font-bold text-foreground/90 drop-shadow-md">
            {video.like_count > 999 ? `${(video.like_count / 1000).toFixed(1)}k` : video.like_count}
          </span>
        </div>

        <Button variant="action" size="iconLg" onClick={onSave} className="shadow-lg backdrop-blur-sm">
          <Bookmark className="h-6 w-6" />
        </Button>

        <Button variant="action" size="iconLg" onClick={onOrder} className="shadow-lg backdrop-blur-sm">
          <ShoppingBag className="h-6 w-6" />
        </Button>

        <Button variant="action" size="iconLg" onClick={onReserve} className="shadow-lg backdrop-blur-sm">
          <CalendarCheck className="h-6 w-6" />
        </Button>
      </div>

      {/* Bottom info section */}
      <div className="absolute bottom-16 left-0 right-20 px-4 pb-4 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          {/* Restaurant name with halal badge */}
          <button
            onClick={() => navigate(`/restaurant/${video.restaurant.id}`)}
            className="text-left w-full group"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl font-display font-bold text-foreground drop-shadow-lg">
                {video.restaurant.name}
              </h2>
              {video.restaurant.halal && <span className="halal-badge">Halal</span>}
              <ChevronRight className="h-5 w-5 text-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>

          {/* Description */}
          <p className="text-foreground/90 text-sm line-clamp-2 drop-shadow-md">
            {video.description || video.restaurant.description}
          </p>

          {/* Cuisine tags */}
          <div className="flex flex-wrap gap-2">
            {video.restaurant.cuisine_types?.slice(0, 3).map((cuisine) => (
              <span key={cuisine} className="tag-chip">
                {cuisine}
              </span>
            ))}
          </div>

          {/* Meta info row */}
          <div className="flex items-center gap-4 text-sm text-foreground/80">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="font-medium">{video.restaurant.city}</span>
            </div>
            {video.restaurant.price_level && <PriceLevel level={video.restaurant.price_level} />}
            {video.restaurant.opening_hours && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" />
                <span>{video.restaurant.opening_hours}</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
