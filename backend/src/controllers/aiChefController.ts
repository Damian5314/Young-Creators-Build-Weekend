import { Request, Response } from 'express';

export const generateRecipes = async (req: Request, res: Response) => {
  try {
    const { ingredients, mode } = req.body; // mode: 'ingredients' | 'meal'

    if (!ingredients) {
      res.status(400).json({ error: 'Input is required' });
      return;
    }

    const webhookUrl = process.env.N8N_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error('N8N_WEBHOOK_URL is not defined in .env');
      res.status(500).json({ error: 'Server configuration error' });
      return;
    }

    console.log(`Sending request to n8n: ${webhookUrl}`);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ingredients, mode }),
    });

    if (!response.ok) {
      throw new Error(`n8n webhook failed with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Received response from n8n:', data);
    
    let recipesData = data;

    // If data is a string (which can happen if n8n just passes the content string), parse it.
    if (typeof data === 'string') {
        try {
            recipesData = JSON.parse(data);
        } catch (e) {
            console.error('Failed to parse string response from n8n:', e);
        }
    } else if (data.content && typeof data.content === 'string') {
        // If n8n wrapped it in { content: "..." }
        try {
            recipesData = JSON.parse(data.content);
        } catch (e) {
             // Maybe it's not JSON string, just use data as is if it has recipes
             if (!data.recipes) console.error('Failed to parse content string from n8n');
        }
    }

    // Ensure we have the recipes array
    if (!recipesData.recipes && data.recipes) {
        recipesData = data;
    }

    res.json({ data: recipesData });

  } catch (error) {
    console.error('Error generating recipes:', error);
    res.status(500).json({ error: 'Failed to generate recipes' });
  }
};
