import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Share2, Clock, ChefHat, ExternalLink, Play } from 'lucide-react';
import { Meal, MealTag } from '@/lib/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface MealDetailModalProps {
  meal: Meal | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

const tagLabels: Record<MealTag, string> = {
  pasta: 'Pasta',
  vegan: 'Vegan',
  soup: 'Soup',
  stirfry: 'Stir Fry',
  quick: 'Quick',
  cheap: 'Budget',
  'high-protein': 'High Protein',
  breakfast: 'Breakfast',
  dessert: 'Dessert',
  healthy: 'Healthy'
};

function getYouTubeEmbedUrl(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  return null;
}

export function MealDetailModal({
  meal,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite
}: MealDetailModalProps) {
  if (!meal) return null;

  const handleShare = async () => {
    const shareData = {
      title: meal.name,
      text: `Check out this recipe: ${meal.name}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${meal.name} - ${window.location.href}`);
        toast.success('Link copied to clipboard!');
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        await navigator.clipboard.writeText(`${meal.name} - ${window.location.href}`);
        toast.success('Link copied to clipboard!');
      }
    }
  };

  const handleFavorite = () => {
    onToggleFavorite(meal.id);
    if (!isFavorite) {
      toast.success('Added to favorites!');
    }
  };

  const embedUrl = meal.videoUrl ? getYouTubeEmbedUrl(meal.videoUrl) : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-card rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto my-auto"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="absolute top-3 right-3 z-10 h-10 w-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Image */}
            <div className="relative aspect-video">
              <img
                src={meal.imageUrl}
                alt={meal.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

              {/* Badges */}
              <div className="absolute top-3 left-3 flex gap-2">
                {meal.durationMinutes && (
                  <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full">
                    <Clock className="h-3.5 w-3.5 text-white" />
                    <span className="text-xs font-medium text-white">{meal.durationMinutes} min</span>
                  </div>
                )}
                {meal.difficulty && (
                  <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full">
                    <ChefHat className="h-3.5 w-3.5 text-white" />
                    <span className="text-xs font-medium text-white capitalize">{meal.difficulty}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display font-bold text-2xl text-foreground mb-2">
                    {meal.name}
                  </h2>
                  <div className="flex flex-wrap gap-1.5">
                    {meal.tags.map((tag: MealTag) => (
                      <span
                        key={tag}
                        className="text-xs bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full"
                      >
                        {tagLabels[tag]}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={handleFavorite}
                    aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                    className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center transition-all",
                      isFavorite
                        ? "bg-red-500 text-white"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    )}
                  >
                    <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
                  </button>
                  <button
                    onClick={handleShare}
                    aria-label="Share recipe"
                    className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground hover:bg-secondary/80 transition-all"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Description */}
              {meal.description && (
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {meal.description}
                </p>
              )}

              {/* Video Section */}
              {meal.videoUrl && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-primary">Video Tutorial</h3>
                  {embedUrl ? (
                    <div className="aspect-video rounded-xl overflow-hidden bg-secondary">
                      <iframe
                        src={embedUrl}
                        title={`${meal.name} video`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </div>
                  ) : (
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => window.open(meal.videoUrl, '_blank')}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Watch on YouTube
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              )}

              {/* Ingredients */}
              <div className="bg-secondary/50 rounded-xl p-4">
                <h3 className="font-semibold text-sm text-primary mb-3">Ingredients</h3>
                <ul className="space-y-2">
                  {meal.ingredients.map((ingredient: string, index: number) => (
                    <li key={index} className="text-sm text-foreground flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Steps */}
              <div>
                <h3 className="font-semibold text-sm text-primary mb-3">Instructions</h3>
                <ol className="space-y-3">
                  {meal.steps.map((step: string, index: number) => (
                    <li key={index} className="text-sm text-foreground flex items-start gap-3">
                      <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
