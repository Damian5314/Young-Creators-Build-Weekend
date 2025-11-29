// API Client - Connects frontend to backend
import { Recipe, GeneratedRecipe } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface RequestOptions extends RequestInit {
  token?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { token, ...fetchOptions } = options;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  }

  async get<T>(endpoint: string, token?: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', token });
  }

  async post<T>(endpoint: string, body: unknown, token?: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      token,
    });
  }

  async put<T>(endpoint: string, body: unknown, token?: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      token,
    });
  }

  async delete<T>(endpoint: string, token?: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', token });
  }
}

export const api = new ApiClient(API_BASE_URL);

// Recipe API helpers
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
  getAll: (page = 1, limit = 20) =>
    api.get<RecipesResponse>(`/recipes?page=${page}&limit=${limit}`),

  getById: (id: string) =>
    api.get<{ success: boolean; data: Recipe }>(`/recipes/${id}`),

  getUserRecipes: (token: string, page = 1, limit = 20) =>
    api.get<RecipesResponse>(`/recipes/user/me?page=${page}&limit=${limit}`, token),

  generate: (ingredients: string, token?: string) =>
    api.post<GenerateResponse>('/recipes/generate', { ingredients }, token),

  create: (recipe: Omit<Recipe, 'id' | 'created_at'>, token: string) =>
    api.post<{ success: boolean; data: Recipe }>('/recipes', recipe, token),

  delete: (id: string, token: string) =>
    api.delete<{ success: boolean }>(`/recipes/${id}`, token),
};

export default api;
