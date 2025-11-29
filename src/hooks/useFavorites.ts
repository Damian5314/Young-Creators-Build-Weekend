import { useState, useEffect, useCallback } from 'react';

const FAVORITES_KEY = 'foodswipe_favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
  }, [favorites]);

  const isFavorite = useCallback((id: string) => {
    return favorites.has(id);
  }, [favorites]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const addFavorite = useCallback((id: string) => {
    setFavorites(prev => new Set([...prev, id]));
  }, []);

  const removeFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  return {
    favorites: [...favorites],
    isFavorite,
    toggleFavorite,
    addFavorite,
    removeFavorite
  };
}
