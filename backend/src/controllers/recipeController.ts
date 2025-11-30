import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest, GenerateRecipesRequest, RecipeChatRequest } from '../types';
import * as recipeService from '../services/recipeService';

export async function getRecipes(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await recipeService.getRecipes({ page, limit });

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getRecipeById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const recipe = await recipeService.getRecipeById(id);

    res.json({ success: true, data: recipe });
  } catch (error) {
    next(error);
  }
}

export async function getUserRecipes(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await recipeService.getUserRecipes(req.user!.id, { page, limit });

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function createRecipe(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const recipe = await recipeService.createRecipe(req.body, req.user!.id);

    res.status(201).json({ success: true, data: recipe });
  } catch (error) {
    next(error);
  }
}

export async function generateRecipes(
  req: Request<{}, {}, GenerateRecipesRequest>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { ingredients } = req.body;

    if (!ingredients) {
      res.status(400).json({ success: false, error: 'Ingredients are required' });
      return;
    }

    const authReq = req as AuthenticatedRequest;
    const recipes = await recipeService.generateAndSaveRecipes(
      ingredients,
      authReq.user?.id
    );

    res.json({ success: true, data: { recipes } });
  } catch (error) {
    next(error);
  }
}

export async function deleteRecipe(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    await recipeService.deleteRecipe(id, req.user!.id);

    res.json({ success: true, message: 'Recipe deleted' });
  } catch (error) {
    next(error);
  }
}

export async function chatAboutRecipe(
  req: Request<{ id: string }, {}, RecipeChatRequest>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { message, context, history } = req.body;

    if (!message?.trim()) {
      res.status(400).json({ success: false, error: 'Message is required' });
      return;
    }

    const response = await recipeService.chatAboutRecipe(id, {
      message: message.trim(),
      context,
      history,
    });

    res.json({ success: true, data: response });
  } catch (error) {
    next(error);
  }
}
