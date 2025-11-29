import { Request, Response } from 'express';
import OpenAI from 'openai';

// Initialize OpenAI client
// Note: This will throw if OPENAI_API_KEY is not set when making a request, 
// so we should handle that gracefully or ensure it's set.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key', // Prevent crash on init if key is missing
  dangerouslyAllowBrowser: false
});

export const generateRecipes = async (req: Request, res: Response) => {
  try {
    const { ingredients, mode } = req.body; // mode: 'ingredients' | 'meal'

    if (!ingredients) {
      res.status(400).json({ error: 'Input is required' });
      return;
    }

    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OPENAI_API_KEY is not set. Returning mock data.');
      // Return mock data if no key
      const mockRecipes = [
        {
          title: "Mock Recipe 1: " + (mode === 'meal' ? ingredients : "Special Dish"),
          description: "A delicious mock recipe generated because no API key was found.",
          ingredients: ["Ingredient 1", "Ingredient 2", "Love"],
          steps: ["Mix everything.", "Cook it.", "Enjoy."]
        },
        {
          title: "Mock Recipe 2: Spicy " + (mode === 'meal' ? ingredients : "Delight"),
          description: "Another tasty mock option.",
          ingredients: ["Spice", "Everything nice"],
          steps: ["Heat pan.", "Add spice.", "Serve hot."]
        }
      ];
      res.json({ data: { recipes: mockRecipes } });
      return;
    }

    const prompt = mode === 'meal' 
      ? `Suggest 3 recipes for a meal: ${ingredients}. Return a JSON object with a "recipes" array. Each recipe should have: title, description, ingredients (array of strings), steps (array of strings).`
      : `Suggest 3 recipes using these ingredients: ${ingredients}. Return a JSON object with a "recipes" array. Each recipe should have: title, description, ingredients (array of strings), steps (array of strings).`;

    const completion = await openai.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: "You are a helpful chef assistant. You output JSON only. The response must be a valid JSON object with a 'recipes' key containing an array of recipes." 
        }, 
        { role: "user", content: prompt }
      ],
      model: "gpt-3.5-turbo",
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }
    
    const data = JSON.parse(content);
    res.json({ data });

  } catch (error) {
    console.error('Error generating recipes:', error);
    res.status(500).json({ error: 'Failed to generate recipes' });
  }
};
