// Recipe API calls
import api from './client';

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  steps: string[];
  image_url?: string;
  source: 'AI' | 'USER';
  user_id?: string;
  created_at?: string;
}

export interface GeneratedRecipe {
  title: string;
  description: string;
  ingredients: string[];
  steps: string[];
}

export interface RecipeChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface RecipeChatContext {
  title: string;
  description?: string;
  ingredients: string[];
  steps: string[];
}

interface RecipeChatResponse {
  success: boolean;
  data: {
    reply?: string;
    message?: string;
    [key: string]: unknown;
  };
}

interface RecipesResponse {
  success: boolean;
  data: {
    recipes: Recipe[];
    total: number;
    page: number;
    limit: number;
  };
}

interface GenerateResponse {
  success: boolean;
  data: {
    recipes: GeneratedRecipe[];
  };
}

export const recipesApi = {
  // Get all recipes
  getAll: (page = 1, limit = 20) =>
    api.get<RecipesResponse>(`/recipes?page=${page}&limit=${limit}`),

  // Get recipe by ID
  getById: (id: string) =>
    api.get<{ success: boolean; data: Recipe }>(`/recipes/${id}`),

  // Get user's recipes
  getUserRecipes: (token: string, page = 1, limit = 20) =>
    api.get<RecipesResponse>(`/recipes/user/me?page=${page}&limit=${limit}`, token),

  // Generate AI recipes
  generate: (ingredients: string, token?: string) =>
    api.post<GenerateResponse>('/recipes/generate', { ingredients }, token),

  // Create recipe
  create: (recipe: Omit<Recipe, 'id' | 'created_at'>, token: string) =>
    api.post<{ success: boolean; data: Recipe }>('/recipes', recipe, token),

  // Delete recipe
  delete: (id: string, token: string) =>
    api.delete<{ success: boolean }>(`/recipes/${id}`, token),

  // Chat about a recipe
  chat: (
    id: string,
    body: {
      message: string;
      context: RecipeChatContext;
      history?: RecipeChatMessage[];
    }
  ) => api.post<RecipeChatResponse>(`/recipes/${id}/chat`, body),
};
