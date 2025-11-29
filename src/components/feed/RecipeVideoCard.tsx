import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Bookmark, User, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RecipeVideo } from '@/services/apify';
import { cn } from '@/lib/utils';

interface RecipeVideoCardProps {
  video: RecipeVideo;
  isActive: boolean;
  isLiked: boolean;
  onLike: () => void;
  onSave: () => void;
}

export function RecipeVideoCard({
  video,
  isActive,
  isLiked,
  onLike,
  onSave,
}: RecipeVideoCardProps) {
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

  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div
      className="relative h-[100dvh] w-full snap-start snap-always overflow-hidden bg-card"
      onDoubleClick={handleDoubleTap}
    >
      {/* Video/Thumbnail Background */}
      <div className="absolute inset-0">
        {video.videoUrl ? (
          <video
            ref={videoRef}
            src={video.videoUrl}
            className="h-full w-full object-cover"
            loop
            muted
            playsInline
            poster={video.thumbnailUrl}
          />
        ) : (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      {/* Gradient Overlay */}
      <div className="video-overlay absolute inset-0" />

      {/* TikTok-style watermark badge */}
      <div className="absolute top-4 left-4 z-10">
        <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
          <span className="text-xs font-medium text-foreground">Recipe Video</span>
        </div>
      </div>

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
        {/* Author Avatar */}
        <div className="flex flex-col items-center gap-1">
          <div className="relative">
            <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-background shadow-lg">
              {video.authorAvatar ? (
                <img
                  src={video.authorAvatar}
                  alt={video.authorName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary-foreground" />
                </div>
              )}
            </div>
          </div>
          <span className="text-xs font-medium text-foreground/90 drop-shadow-md max-w-[60px] truncate">
            {video.authorName}
          </span>
        </div>

        {/* Like Button */}
        <div className="flex flex-col items-center gap-1">
          <Button
            variant="action"
            size="iconLg"
            onClick={onLike}
            className={cn(
              "shadow-lg backdrop-blur-sm",
              isLiked && "bg-primary text-primary-foreground"
            )}
          >
            <Heart className={cn("h-6 w-6", isLiked && "fill-current animate-heart-pop")} />
          </Button>
          <span className="text-xs font-bold text-foreground/90 drop-shadow-md">
            {formatCount(video.likeCount)}
          </span>
        </div>

        {/* Save Button */}
        <div className="flex flex-col items-center gap-1">
          <Button variant="action" size="iconLg" onClick={onSave} className="shadow-lg backdrop-blur-sm">
            <Bookmark className="h-6 w-6" />
          </Button>
        </div>

        {/* View Count */}
        <div className="flex flex-col items-center gap-1">
          <div className="h-12 w-12 rounded-full bg-background/10 backdrop-blur-sm flex items-center justify-center">
            <Eye className="h-6 w-6 text-foreground" />
          </div>
          <span className="text-xs font-bold text-foreground/90 drop-shadow-md">
            {formatCount(video.viewCount)}
          </span>
        </div>
      </div>

      {/* Bottom info section */}
      <div className="absolute bottom-16 left-0 right-20 px-4 pb-4 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          {/* Author info */}
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-foreground drop-shadow-lg">
              @{video.authorName}
            </span>
          </div>

          {/* Title/Description */}
          <h2 className="text-lg font-semibold text-foreground drop-shadow-lg line-clamp-2">
            {video.title}
          </h2>

          {video.description && video.description !== video.title && (
            <p className="text-foreground/90 text-sm line-clamp-2 drop-shadow-md">
              {video.description}
            </p>
          )}

          {/* Tags */}
          {video.tags && video.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {video.tags.slice(0, 4).map((tag, index) => (
                <span key={index} className="tag-chip">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
