import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Bookmark, ChefHat, Share2, Clock, Users, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Recipe } from '@/shared/types';
import { cn } from '@/shared/utils';

interface RecipeCardProps {
  recipe: Recipe;
  isActive: boolean;
  isLiked: boolean;
  onLike: () => void;
  onSave: () => void;
  onShare: () => void;
}

export function RecipeCard({
  recipe,
  isActive,
  isLiked,
  onLike,
  onSave,
  onShare,
}: RecipeCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showHeart, setShowHeart] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isActive]);

  // Set video to use device volume (volume = 1, not muted)
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = 1;
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleDoubleTap = () => {
    if (!isLiked) {
      onLike();
    }
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 800);
  };

  return (
    <div
      className="relative h-[100dvh] w-full snap-start snap-always overflow-hidden bg-card"
      onDoubleClick={handleDoubleTap}
    >
      {/* Video/Image Background */}
      <div className="absolute inset-0">
        {recipe.video_url ? (
          <video
            ref={videoRef}
            src={recipe.video_url}
            className="h-full w-full object-cover"
            loop
            muted={isMuted}
            playsInline
            poster={recipe.image_url || undefined}
          />
        ) : (
          <img
            src={recipe.image_url || '/placeholder-recipe.jpg'}
            alt={recipe.title}
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
            className="shadow-lg backdrop-blur-sm"
          >
            <Heart className={cn('h-6 w-6', isLiked ? 'fill-red-500 text-red-500' : 'text-white')} />
          </Button>
          <span className="text-xs font-bold text-foreground/90 drop-shadow-md">
            {recipe.like_count > 999 ? `${(recipe.like_count / 1000).toFixed(1)}k` : recipe.like_count}
          </span>
        </div>

        <Button variant="action" size="iconLg" onClick={onSave} className="shadow-lg backdrop-blur-sm">
          <Bookmark className="h-6 w-6" />
        </Button>

        <Button variant="action" size="iconLg" onClick={onShare} className="shadow-lg backdrop-blur-sm">
          <Share2 className="h-6 w-6" />
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
          {/* Mute/unmute button - above recipe title */}
          {recipe.video_url && (
            <div className="relative flex items-center gap-3 mb-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="h-10 w-10 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-white backdrop-blur-sm"
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
            </div>
          )}

          {/* Recipe title */}
          <div className="flex items-center gap-2 flex-wrap">
            <ChefHat className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-display font-bold text-foreground drop-shadow-lg">
              {recipe.title}
            </h2>
          </div>

          {/* Description */}
          {recipe.description && (
            <p className="text-foreground/90 text-sm line-clamp-2 drop-shadow-md">
              {recipe.description}
            </p>
          )}

          {/* Meta info row */}
          <div className="flex items-center gap-4 text-sm text-foreground/80">
            {recipe.steps && recipe.steps.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-medium">{recipe.steps.length} stappen</span>
              </div>
            )}
            {recipe.ingredients && recipe.ingredients.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-primary" />
                <span>{recipe.ingredients.length} ingrediënten</span>
              </div>
            )}
          </div>

          {/* Ingredients preview */}
          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {recipe.ingredients.slice(0, 4).map((ingredient, idx) => (
                <span key={idx} className="tag-chip">
                  {ingredient}
                </span>
              ))}
              {recipe.ingredients.length > 4 && (
                <span className="tag-chip">
                  +{recipe.ingredients.length - 4} meer
                </span>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
