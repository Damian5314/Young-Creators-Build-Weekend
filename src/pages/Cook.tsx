import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, Sparkles, Loader2, BookmarkPlus, ChevronDown, ChevronUp } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface GeneratedRecipe {
  title: string;
  description: string;
  ingredients: string[];
  steps: string[];
}

export default function Cook() {
  const { user } = useAuth();
  const [ingredients, setIngredients] = useState('');
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState<GeneratedRecipe[]>([]);
  const [expandedRecipe, setExpandedRecipe] = useState<number | null>(0);
  const [savingRecipe, setSavingRecipe] = useState<number | null>(null);

  const generateRecipes = async () => {
    if (!ingredients.trim()) {
      toast.error('Please enter some ingredients');
      return;
    }

    setLoading(true);
    setRecipes([]);

    try {
      const { data, error } = await supabase.functions.invoke('generate-recipes', {
        body: { ingredients: ingredients.trim() }
      });

      if (error) throw error;

      if (data?.recipes) {
        setRecipes(data.recipes);
        toast.success(`Generated ${data.recipes.length} recipes!`);
      }
    } catch (err) {
      console.error('Error generating recipes:', err);
      toast.error('Failed to generate recipes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveRecipe = async (recipe: GeneratedRecipe, index: number) => {
    if (!user) {
      toast.error('Please sign in to save recipes');
      return;
    }

    setSavingRecipe(index);

    const { error } = await supabase
      .from('recipes')
      .insert({
        user_id: user.id,
        title: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        source: 'AI'
      });

    if (error) {
      toast.error('Failed to save recipe');
    } else {
      toast.success('Recipe saved to your collection!');
    }

    setSavingRecipe(null);
  };

  return (
    <AppLayout>
      <div className="page-container">
        {/* Header */}
        <div className="text-center page-header">
          <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg">
            <ChefHat className="h-8 w-8 text-white" />
          </div>
          <h1 className="page-title mb-2">AI Cooking Assistant</h1>
          <p className="text-muted-foreground max-w-xs mx-auto">
            Tell me what ingredients you have, and I'll suggest delicious recipes!
          </p>
        </div>

        {/* Input section */}
        <div className="max-w-lg mx-auto mb-8">
          <div className="card-elevated p-0 overflow-hidden">
            <Textarea
              placeholder="e.g. chicken, rice, tomatoes, onions, garlic..."
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              className="min-h-[140px] bg-transparent border-0 text-base p-4 resize-none focus-visible:ring-0"
            />
          </div>

          <Button
            onClick={generateRecipes}
            disabled={loading || !ingredients.trim()}
            className="w-full mt-4 h-14 text-base font-semibold"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Cooking up ideas...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Generate Recipes
              </>
            )}
          </Button>

          {/* Future feature placeholder */}
          <Button
            variant="secondary"
            className="w-full mt-3 h-12 opacity-50"
            size="lg"
            disabled
          >
            📷 Upload Fridge Photo (Coming Soon)
          </Button>
        </div>

        {/* Results */}
        <AnimatePresence>
          {recipes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-lg mx-auto space-y-4"
            >
              <h2 className="section-title text-center">
                Here's what you can make
              </h2>

              {recipes.map((recipe, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card-elevated overflow-hidden"
                >
                  {/* Recipe header */}
                  <button
                    onClick={() => setExpandedRecipe(expandedRecipe === index ? null : index)}
                    className="w-full flex items-start justify-between text-left"
                  >
                    <div className="flex-1">
                      <h3 className="font-display font-bold text-lg mb-1">
                        {recipe.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {recipe.description}
                      </p>
                    </div>
                    <div className={`p-2 rounded-full bg-secondary transition-transform ${expandedRecipe === index ? 'rotate-180' : ''}`}>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </button>

                  {/* Expanded content */}
                  <AnimatePresence>
                    {expandedRecipe === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 space-y-5">
                          {/* Ingredients */}
                          <div className="bg-secondary/50 rounded-xl p-4">
                            <h4 className="section-title text-primary">
                              Ingredients
                            </h4>
                            <ul className="space-y-2">
                              {recipe.ingredients.map((ing, i) => (
                                <li key={i} className="text-sm text-foreground flex items-start gap-2">
                                  <span className="text-primary mt-0.5">•</span>
                                  {ing}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Steps */}
                          <div>
                            <h4 className="section-title text-primary">
                              Instructions
                            </h4>
                            <ol className="space-y-3">
                              {recipe.steps.map((step, i) => (
                                <li key={i} className="text-sm text-foreground flex items-start gap-3">
                                  <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                                    {i + 1}
                                  </span>
                                  <span className="pt-0.5">{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>

                          {/* Save button */}
                          <Button
                            onClick={() => saveRecipe(recipe, index)}
                            disabled={savingRecipe === index}
                            className="w-full h-12"
                          >
                            {savingRecipe === index ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <BookmarkPlus className="h-4 w-4 mr-2" />
                            )}
                            Save to My Recipes
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
