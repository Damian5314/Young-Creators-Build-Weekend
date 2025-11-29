import { Request, Response } from 'express';

export const generateRecipes = async (req: Request, res: Response) => {
  try {
    const { userId, mode, input } = req.body;

    console.log('Received AI Chef request:', { userId, mode, input });

    // TODO: Connect to OpenAI or n8n here.
    // For now, we return mock data based on the mode.

    const mockRecipes = [
      {
        title: mode === 'ingredients' ? "Quick Stir Fry" : "Classic " + input,
        description: "A delicious and easy meal based on your request.",
        ingredients: ["Ingredient 1", "Ingredient 2", "Secret Sauce"],
        steps: ["Prep ingredients", "Cook over high heat", "Serve and enjoy!"]
      },
      {
        title: "Chef's Special",
        description: "Something unique created just for you.",
        ingredients: ["Love", "Passion", "Fresh Herbs"],
        steps: ["Mix everything", "Bake at 350F", "Garnish"]
      }
    ];

    // Simulate AI delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    res.json({ recipes: mockRecipes });
  } catch (error) {
    console.error('Error in generateRecipes:', error);
    res.status(500).json({ error: 'Failed to generate recipes' });
  }
};
