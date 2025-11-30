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
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
  const {
    filteredMeals,
    activeFilter,
    setFilter,
    availableFilters,
    searchQuery,
    setSearchQuery,
    clearSearch
  } = useMeals();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saveModal, setSaveModal] = useState<{ open: boolean; recipeId: string | null }>({
    open: false,
    recipeId: null,
  });
  const [savingMealId, setSavingMealId] = useState<string | null>(null);
  // Keep track of meals we've already saved to DB (mealId -> recipeId)
  const [savedMealIds, setSavedMealIds] = useState<Map<string, string>>(new Map());

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

  const handleSave = async (meal: Meal) => {
    if (!user) {
      toast.error('Please sign in to save');
      navigate('/auth');
      return;
    }

    // Check if we already saved this meal to DB
    const existingRecipeId = savedMealIds.get(meal.id);
    if (existingRecipeId) {
      setSaveModal({ open: true, recipeId: existingRecipeId });
      return;
    }

    // Save meal to database first
    setSavingMealId(meal.id);

    try {
      const { data, error } = await supabase
        .from('recipes')
        .insert({
          user_id: user.id,
          title: meal.name,
          description: meal.description || '',
          ingredients: meal.ingredients,
          steps: meal.steps,
          image_url: meal.imageUrl,
          video_url: meal.videoUrl || null,
          source: 'SAVED', // Mark as saved from feed, not user-created
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error saving recipe:', error);
        toast.error('Kon recept niet opslaan');
        return;
      }

      if (data) {
        // Remember this mapping
        setSavedMealIds(prev => new Map(prev).set(meal.id, data.id));
        // Open collection modal with the new recipe ID
        setSaveModal({ open: true, recipeId: data.id });
        toast.success('Recept opgeslagen!');
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Er ging iets mis');
    } finally {
      setSavingMealId(null);
    }
  };

  return (
    <div className="w-full">
      {/* Search */}
      <div className="mb-5">
        <div className="relative">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recipes or ingredients..."
            className="pl-11 pr-10 h-11 bg-secondary/50 border-secondary/60 focus-visible:ring-2 focus-visible:ring-primary/40"
          />
          <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

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
            <p className="text-muted-foreground">
              No meals match your search{activeFilter !== 'all' ? ' and filter' : ''}.
            </p>
            <button
              onClick={() => setFilter('all')}
              className="mt-2 text-primary hover:underline text-sm"
            >
              Reset filters
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
                onSave={() => handleSave(meal)}
                isSaving={savingMealId === meal.id}
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
        onSave={() => selectedMeal && handleSave(selectedMeal)}
        isSaving={selectedMeal ? savingMealId === selectedMeal.id : false}
      />

      {/* Save to Collection Modal */}
      <SaveToCollectionModal
        isOpen={saveModal.open}
        onClose={() => setSaveModal({ open: false, recipeId: null })}
        itemId={saveModal.recipeId || ''}
        itemType="RECIPE"
      />
    </div>
  );
}
