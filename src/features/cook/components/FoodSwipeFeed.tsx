import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMeals } from '@/hooks/useMeals';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/shared/hooks';
import { MealCard } from './MealCard';
import { MealDetailModal } from './MealDetailModal';
import { SaveToCollectionModal } from '@/features/home/components';
import { Meal, MealTag } from '@/lib/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const filterLabels: Record<MealTag | 'all', string> = {
  all: 'All',
  pasta: 'Pasta',
  soup: 'Soup',
  stirfry: 'Stir Fry',
  vegan: 'Vegan',
  quick: 'Quick',
  cheap: 'Budget',
  'high-protein': 'High Protein',
  breakfast: 'Breakfast',
  dessert: 'Dessert',
  healthy: 'Healthy'
};

export function FoodSwipeFeed() {
  const { filteredMeals, activeFilter, setFilter, availableFilters } = useMeals();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saveModal, setSaveModal] = useState<{ open: boolean; mealId: string | null }>({
    open: false,
    mealId: null,
  });

  const handleMealClick = (meal: Meal) => {
    setSelectedMeal(meal);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedMeal(null), 200);
  };

  const handleTagClick = (tag: MealTag) => {
    setFilter(tag);
  };

  const handleSave = (mealId: string) => {
    if (!user) {
      toast.error('Please sign in to save');
      navigate('/auth');
      return;
    }
    setSaveModal({ open: true, mealId });
  };

  return (
    <div className="w-full">
      {/* Filter Bar */}
      <div className="mb-6 -mx-4 px-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 pb-2">
          {availableFilters.map(filter => (
            <button
              key={filter}
              onClick={() => setFilter(filter)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                activeFilter === filter
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "bg-secondary/50 text-secondary-foreground hover:bg-secondary"
              )}
            >
              {filterLabels[filter]}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <motion.div
        layout
        className="space-y-5"
      >
        {filteredMeals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No meals found with this filter.</p>
            <button
              onClick={() => setFilter('all')}
              className="mt-2 text-primary hover:underline text-sm"
            >
              Show all meals
            </button>
          </div>
        ) : (
          filteredMeals.map((meal, index) => (
            <motion.div
              key={meal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <MealCard
                meal={meal}
                isFavorite={isFavorite(meal.id)}
                onToggleFavorite={toggleFavorite}
                onTagClick={handleTagClick}
                onClick={() => handleMealClick(meal)}
                onSave={() => handleSave(meal.id)}
              />
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Detail Modal */}
      <MealDetailModal
        meal={selectedMeal}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        isFavorite={selectedMeal ? isFavorite(selectedMeal.id) : false}
        onToggleFavorite={toggleFavorite}
        onSave={() => selectedMeal && handleSave(selectedMeal.id)}
      />

      {/* Save to Collection Modal */}
      <SaveToCollectionModal
        isOpen={saveModal.open}
        onClose={() => setSaveModal({ open: false, mealId: null })}
        itemId={saveModal.mealId || ''}
        itemType="RECIPE"
      />
    </div>
  );
}
