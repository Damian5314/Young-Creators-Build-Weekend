import { useState, useMemo } from 'react';
import { Meal, MealTag, mockMeals } from '@/lib/types';

export function useMeals() {
  const [meals] = useState<Meal[]>(mockMeals);
  const [activeFilter, setActiveFilter] = useState<MealTag | 'all'>('all');

  const filteredMeals = useMemo(() => {
    if (activeFilter === 'all') {
      return meals;
    }
    return meals.filter(meal => meal.tags.includes(activeFilter));
  }, [meals, activeFilter]);

  const setFilter = (filter: MealTag | 'all') => {
    setActiveFilter(filter);
  };

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
    availableFilters
  };
}
