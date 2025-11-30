import { useState, useMemo } from 'react';
import { Meal, MealTag, mockMeals } from '@/lib/types';

export function useMeals() {
  const [meals] = useState<Meal[]>(mockMeals);
  const [activeFilter, setActiveFilter] = useState<MealTag | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMeals = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (activeFilter === 'all') {
      const baseMeals = meals;
      if (!query) return baseMeals;
      return baseMeals.filter(meal =>
        meal.name.toLowerCase().includes(query) ||
        meal.description?.toLowerCase().includes(query) ||
        meal.ingredients.some(ing => ing.toLowerCase().includes(query))
      );
    }

    const taggedMeals = meals.filter(meal => meal.tags.includes(activeFilter));
    if (!query) return taggedMeals;

    return taggedMeals.filter(meal =>
      meal.name.toLowerCase().includes(query) ||
      meal.description?.toLowerCase().includes(query) ||
      meal.ingredients.some(ing => ing.toLowerCase().includes(query))
    );
  }, [meals, activeFilter, searchQuery]);

  const setFilter = (filter: MealTag | 'all') => {
    setActiveFilter(filter);
  };

  const clearSearch = () => setSearchQuery('');

  const availableFilters: (MealTag | 'all')[] = [
    'all',
    'pasta',
    'soup',
    'stirfry',
    'vegan',
    'quick',
    'cheap',
    'high-protein',
    'breakfast',
    'dessert',
    'healthy'
  ];

  return {
    meals,
    filteredMeals,
    activeFilter,
    setFilter,
    availableFilters,
    searchQuery,
    setSearchQuery,
    clearSearch
  };
}
