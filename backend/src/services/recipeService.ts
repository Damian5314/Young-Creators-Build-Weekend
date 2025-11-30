import { supabase } from '../config/supabase';
import { env } from '../config/env';
import { Recipe, PaginationParams, RecipeChatRequest } from '../types';
import { AppError } from '../middleware/errorHandler';
import { generateRecipesWithAI } from './aiService';

export async function getRecipes(params: PaginationParams = {}) {
  const { page = 1, limit = 20 } = params;
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from('recipes')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new AppError(`Failed to fetch recipes: ${error.message}`, 500);
  }

  return {
    recipes: data || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

export async function getRecipeById(id: string) {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new AppError(`Recipe not found: ${error.message}`, 404);
  }

  return data;
}

export async function getUserRecipes(userId: string, params: PaginationParams = {}) {
  const { page = 1, limit = 20 } = params;
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from('recipes')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new AppError(`Failed to fetch user recipes: ${error.message}`, 500);
  }

  return {
    recipes: data || [],
    total: count || 0,
    page,
    limit,
  };
}

export async function createRecipe(recipe: Omit<Recipe, 'id'>, userId: string) {
  const { data, error } = await supabase
    .from('recipes')
    .insert({
      ...recipe,
      user_id: userId,
      source: recipe.source || 'USER',
    })
    .select()
    .single();

  if (error) {
    throw new AppError(`Failed to create recipe: ${error.message}`, 500);
  }

  return data;
}

export async function generateAndSaveRecipes(ingredients: string, userId?: string) {
  const aiRecipes = await generateRecipesWithAI(ingredients);

  if (!aiRecipes.length) {
    throw new AppError('No recipes generated', 500);
  }

  // Optionally save to database
  if (userId) {
    const recipesToSave = aiRecipes.map(recipe => ({
      title: recipe.title,
      description: recipe.description,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      source: 'AI' as const,
      user_id: userId,
    }));

    const { error } = await supabase.from('recipes').insert(recipesToSave);
    if (error) {
      console.warn('Failed to save AI recipes:', error);
    }
  }

  return aiRecipes;
}

export async function deleteRecipe(id: string, userId: string) {
  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    throw new AppError(`Failed to delete recipe: ${error.message}`, 500);
  }

  return { success: true };
}

export async function chatAboutRecipe(recipeId: string, payload: RecipeChatRequest) {
  const url =
    env.RECIPE_CHAT_WEBHOOK_URL ||
    process.env.N8N_WEBHOOK_URL ||
    'https://wishh.app.n8n.cloud/webhook/recipe-chat';
  if (!url) {
    throw new AppError('Recipe chat webhook is not configured', 500);
  }

  if (!payload.context?.title || !payload.context?.ingredients?.length) {
    throw new AppError('Recipe context is incomplete', 400);
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipeId,
        ...payload,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Recipe chat webhook error:', response.status, errorText);
      throw new AppError(
        `Failed to fetch AI chef response from ${url} (webhook ${response.status}): ${errorText || 'no body returned'}`,
        502
      );
    }

    const text = await response.text();

    try {
      return JSON.parse(text);
    } catch (err) {
      console.error('Recipe chat response parse error:', err, 'raw:', text);
      throw new AppError('Invalid response from AI chef', 502);
    }
  } catch (error) {
    console.error('Recipe chat webhook request failed:', error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to reach AI chef webhook', 502);
  }
}
