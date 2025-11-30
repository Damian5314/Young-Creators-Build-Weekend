// Export all API modules
export { api } from './client';
export { recipesApi } from './recipes';
export { restaurantsApi } from './restaurants';
export { videosApi } from './videos';
export { collectionsApi } from './collections';

// Re-export types
export type { Recipe, GeneratedRecipe, RecipeChatContext, RecipeChatMessage } from './recipes';
export type { Restaurant } from './restaurants';
export type { Video } from './videos';
export type { Collection, CollectionItem } from './collections';
