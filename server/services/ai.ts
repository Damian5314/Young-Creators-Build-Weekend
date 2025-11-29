import { AppError } from '../middleware';

export interface AIRecipe {
  title: string;
  description: string;
  ingredients: string[];
  steps: string[];
}

export async function generateRecipes(ingredients: string): Promise<AIRecipe[]> {
  const apiKey = process.env.LOVABLE_API_KEY || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new AppError('AI API key not configured', 500);
  }

  const apiUrl = process.env.LOVABLE_API_KEY
    ? 'https://ai.gateway.lovable.dev/v1/chat/completions'
    : 'https://api.openai.com/v1/chat/completions';

  const model = process.env.LOVABLE_API_KEY ? 'google/gemini-2.5-flash' : 'gpt-4o-mini';

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
          content: 'You are a helpful cooking assistant. Generate 3-4 creative recipes based on the ingredients provided. Return ONLY valid JSON array with no markdown formatting. Each recipe must have: title, description (short summary), ingredients (array of strings with quantities), steps (array of instruction strings).',
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
    console.error('AI API error:', response.status, await response.text());
    throw new AppError('Failed to generate recipes', 500);
  }

  const data = await response.json() as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content || '[]';

  try {
    const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanContent);
  } catch {
    console.error('Failed to parse recipes');
    return [];
  }
}
