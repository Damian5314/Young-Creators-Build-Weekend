// App-wide constants

export const DIETARY_OPTIONS = [
  { id: 'halal', label: 'Halal', emoji: '🥩' },
  { id: 'vegan', label: 'Vegan', emoji: '🌱' },
  { id: 'vegetarian', label: 'Vegetarian', emoji: '🥗' },
  { id: 'spicy', label: 'Spicy', emoji: '🌶️' },
  { id: 'gluten-free', label: 'Gluten-free', emoji: '🌾' },
  { id: 'dairy-free', label: 'Dairy-free', emoji: '🥛' },
] as const;

export const DEFAULT_LOCATION = {
  lat: 51.9225,
  lng: 4.47917,
  city: 'Rotterdam',
} as const;

export const ROUTES = {
  HOME: '/',
  AUTH: '/auth',
  ONBOARDING: '/onboarding',
  MAP: '/map',
  COOK: '/cook',
  COLLECTIONS: '/collections',
  PROFILE: '/profile',
  RESTAURANT: '/restaurant',
  DASHBOARD: '/dashboard/restaurant',
} as const;

export const API_ENDPOINTS = {
  RECIPES: '/recipes',
  RESTAURANTS: '/restaurants',
  VIDEOS: '/videos',
  COLLECTIONS: '/collections',
  HEALTH: '/health',
} as const;

export const SWIPE_ACTIONS = {
  LIKE: 'LIKE',
  DISLIKE: 'DISLIKE',
  VIEW: 'VIEW',
} as const;

export const COLLECTION_TYPES = {
  RESTAURANT: 'RESTAURANT',
  RECIPE: 'RECIPE',
} as const;

export const ITEM_TYPES = {
  RESTAURANT: 'RESTAURANT',
  VIDEO: 'VIDEO',
  RECIPE: 'RECIPE',
} as const;
