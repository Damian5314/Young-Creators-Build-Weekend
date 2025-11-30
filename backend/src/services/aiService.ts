import { env } from '../config/env';
import { Recipe } from '../types';
import { AppError } from '../middleware/errorHandler';

export interface AIRecipeResponse {
  title: string;
  description: string;
  ingredients: string[];
  steps: string[];
}

export async function generateRecipesWithAI(ingredients: string): Promise<AIRecipeResponse[]> {
  const apiKey = env.LOVABLE_API_KEY || env.OPENAI_API_KEY;
  const n8nUrl = env.N8N_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL;

  // Fallback to n8n webhook if no direct AI key is configured
  if (!apiKey && n8nUrl) {
    const response = await fetch(n8nUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ingredients, mode: 'ingredients' }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('n8n generate webhook error:', response.status, errorText);
      throw new AppError('Failed to generate recipes via webhook', 500);
    }

    const data = await response.json() as any;
    const cleanJsonString = (str: string) => str.replace(/```json\n?|\n?```/g, '').trim();

    let recipesData: any = data;

    if (typeof data === 'string') {
      try {
        recipesData = JSON.parse(cleanJsonString(data));
      } catch (e) {
        console.error('Failed to parse string response from n8n:', e);
      }
    } else if (data?.content && typeof data.content === 'string') {
      try {
        recipesData = JSON.parse(cleanJsonString(data.content));
      } catch (e) {
        console.error('Failed to parse content string from n8n:', e);
      }
    } else if (Array.isArray(data) && data[0]?.content?.[0]?.text) {
      try {
        const rawText = data[0].content[0].text;
        recipesData = JSON.parse(cleanJsonString(rawText));
      } catch (e) {
        console.error('Failed to parse raw OpenAI output from n8n:', e);
      }
    }

    const recipesArray = Array.isArray(recipesData)
      ? recipesData
      : recipesData?.recipes || [];

    if (!Array.isArray(recipesArray) || recipesArray.length === 0) {
      throw new AppError('No recipes returned from webhook', 500);
    }

    return recipesArray;
  }

  if (!apiKey) {
    throw new AppError('AI API key not configured', 500);
  }

  // Use Lovable gateway if available, otherwise use OpenAI
  const apiUrl = env.LOVABLE_API_KEY
    ? 'https://ai.gateway.lovable.dev/v1/chat/completions'
    : 'https://api.openai.com/v1/chat/completions';

  const model = env.LOVABLE_API_KEY ? 'google/gemini-2.5-flash' : 'gpt-4o-mini';

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: `You are a helpful cooking assistant. Generate 3-4 creative recipes based on the ingredients provided. Return ONLY valid JSON array with no markdown formatting. Each recipe must have: title, description (short summary), ingredients (array of strings with quantities), steps (array of instruction strings).`,
        },
        {
          role: 'user',
          content: `Generate recipes using these ingredients: ${ingredients}. Return as JSON array only.`,
        },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('AI API error:', response.status, errorText);
    throw new AppError('Failed to generate recipes', 500);
  }

  const data = await response.json() as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content || '[]';

  // Parse the JSON from the response
  try {
    const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanContent);
  } catch (parseError) {
    console.error('Failed to parse recipes:', parseError);
    return [];
  }
}

export async function generateRecipeImage(recipeName: string): Promise<string | null> {
  // Placeholder for image generation - can integrate DALL-E or other services
  return null;
}
