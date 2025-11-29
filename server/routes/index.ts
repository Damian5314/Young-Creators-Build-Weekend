import { Router, Request, Response } from 'express';
import { generateRecipes } from '../services/ai.js';
import { getSupabase } from '../services/supabase.js';
import { authMiddleware, optionalAuth, AuthenticatedRequest } from '../middleware.js';

const router = Router();

// ============ AI Chef Routes ============
router.post('/recipes/generate', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { ingredients } = req.body;

    if (!ingredients) {
      res.status(400).json({ success: false, error: 'Ingredients required' });
      return;
    }

    const recipes = await generateRecipes(ingredients);
    res.json({ success: true, data: { recipes } });
  } catch (error) {
    console.error('Generate recipes error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate recipes' });
  }
});

// ============ Restaurant Routes ============
router.get('/restaurants', async (req: Request, res: Response) => {
  try {
    const { city, halal, cuisine } = req.query;

    let query = getSupabase().from('restaurants').select('*');

    if (city) query = query.eq('city', city);
    if (halal === 'true') query = query.eq('halal', true);
    if (cuisine) query = query.contains('cuisine_types', [cuisine]);

    const { data, error } = await query;

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch restaurants' });
  }
});

router.get('/restaurants/:id', async (req: Request, res: Response) => {
  try {
    const { data, error } = await getSupabase()
      .from('restaurants')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch restaurant' });
  }
});

// ============ Video Routes ============
router.get('/videos', async (req: Request, res: Response) => {
  try {
    const { restaurant_id, limit = 20 } = req.query;

    let query = getSupabase()
      .from('videos')
      .select('*, restaurant:restaurants(*)')
      .order('like_count', { ascending: false })
      .limit(Number(limit));

    if (restaurant_id) query = query.eq('restaurant_id', restaurant_id);

    const { data, error } = await query;

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch videos' });
  }
});

// ============ Collection Routes ============
router.get('/collections', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { data, error } = await getSupabase()
      .from('collections')
      .select('*')
      .eq('user_id', req.user!.id);

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch collections' });
  }
});

router.post('/collections', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, type } = req.body;

    const { data, error } = await getSupabase()
      .from('collections')
      .insert({ user_id: req.user!.id, name, type })
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create collection' });
  }
});

export default router;
