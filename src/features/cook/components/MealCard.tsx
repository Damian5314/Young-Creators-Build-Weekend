import { motion } from 'framer-motion';
import { Heart, Share2, Clock, ChefHat, Bookmark } from 'lucide-react';
import { Meal, MealTag } from '@/lib/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface MealCardProps {
  meal: Meal;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onTagClick: (tag: MealTag) => void;
  onClick: () => void;
  onSave: () => void;
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

export function MealCard({ meal, isFavorite, onToggleFavorite, onTagClick, onClick, onSave }: MealCardProps) {
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();

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

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(meal.id);
    if (!isFavorite) {
      toast.success('Added to favorites!');
    }
  };

  const handleTagClick = (e: React.MouseEvent, tag: MealTag) => {
    e.stopPropagation();
    onTagClick(tag);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer group shadow-lg"
    >
      {/* Background Image */}
      <img
        src={meal.imageUrl}
        alt={meal.name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

      {/* Duration Badge */}
      {meal.durationMinutes && (
        <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full">
          <Clock className="h-3.5 w-3.5 text-white" />
          <span className="text-xs font-medium text-white">{meal.durationMinutes} min</span>
        </div>
      )}

      {/* Difficulty Badge */}
      {meal.difficulty && (
        <div className="absolute top-3 right-14 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full">
          <ChefHat className="h-3.5 w-3.5 text-white" />
          <span className="text-xs font-medium text-white capitalize">{meal.difficulty}</span>
        </div>
      )}

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        {/* Meal Name */}
        <h3 className="font-display font-bold text-xl text-white mb-2 drop-shadow-lg">
          {meal.name}
        </h3>

        {/* Tags and Actions Row */}
        <div className="flex items-end justify-between gap-2">
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 flex-1">
            {meal.tags.slice(0, 3).map(tag => (
              <button
                key={tag}
                onClick={(e) => handleTagClick(e, tag)}
                className="text-xs bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-2.5 py-1 rounded-full transition-colors"
              >
                {tagLabels[tag]}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleFavorite}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center transition-all",
                isFavorite
                  ? "bg-red-500 text-white"
                  : "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
              )}
            >
              <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSave();
              }}
              aria-label="Save to collection"
              className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-all"
            >
              <Bookmark className="h-5 w-5" />
            </button>
            <button
              onClick={handleShare}
              aria-label="Share recipe"
              className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-all"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
