import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChefHat,
  Sparkles,
  Loader2,
  BookmarkPlus,
  ChevronDown,
  Share2,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/hooks";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { ShareModal } from "@/components/Modals";

interface Recipe {
  title: string;
  description: string;
  ingredients: string[];
  steps: string[];
}

export default function Cook() {
  const { user, getToken } = useAuth();
  const [inputValue, setInputValue] = useState("");
  const [mode, setMode] = useState<"ingredients" | "meal">("ingredients");
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [expandedRecipe, setExpandedRecipe] = useState<number | null>(0);
  const [savingRecipe, setSavingRecipe] = useState<number | null>(null);
  const [shareModal, setShareModal] = useState<{
    open: boolean;
    recipeIndex: number | null;
  }>({
    open: false,
    recipeIndex: null,
  });

  const handleGenerate = async () => {
    if (!inputValue.trim()) {
      toast.error(
        mode === "ingredients"
          ? "Please enter some ingredients"
          : "Please enter what you want to eat"
      );
      return;
    }

    setLoading(true);
    setRecipes([]);

    try {
      const token = await getToken();
      const response = await api.post<{ data: { recipes: Recipe[] } }>(
        "/recipes/generate",
        {
          ingredients: inputValue.trim(),
          mode,
        },
        token || undefined
      );
      if (response.data?.recipes) {
        setRecipes(response.data.recipes);
        toast.success(`Generated ${response.data.recipes.length} recipes!`);
      }
    } catch (err) {
      console.error("Error generating recipes:", err);
      toast.error("Failed to generate recipes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const saveRecipe = async (recipe: Recipe, index: number) => {
    if (!user) {
      toast.error("Please sign in to save recipes");
      return;
    }
    setSavingRecipe(index);

    const { error } = await supabase.from("recipes").insert({
      user_id: user.id,
      title: recipe.title,
      description: recipe.description,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      source: "AI",
    });

    if (error) toast.error("Failed to save recipe");
    else toast.success("Recipe saved!");
    setSavingRecipe(null);
  };

  return (
    <Layout>
      <div className="page-container">
        <div className="text-center page-header">
          <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg">
            <ChefHat className="h-8 w-8 text-white" />
          </div>
          <h1 className="page-title mb-2">Your AI Chef</h1>
          <p className="text-muted-foreground max-w-xs mx-auto">
            {mode === "ingredients"
              ? "Tell me what ingredients you have!"
              : "Tell me what you want to eat!"}
          </p>
        </div>

        <div className="flex justify-center gap-3 mb-8">
          <Button
            variant={mode === "ingredients" ? "default" : "outline"}
            onClick={() => setMode("ingredients")}
            className="rounded-full"
          >
            I Have Ingredients
          </Button>
          <Button
            variant={mode === "meal" ? "default" : "outline"}
            onClick={() => setMode("meal")}
            className="rounded-full"
          >
            I Want to Eat
          </Button>
        </div>

        <div className="max-w-lg mx-auto mb-8">
          <div className="card-elevated p-0 overflow-hidden mb-3">
            <Textarea
              placeholder={
                mode === "ingredients"
                  ? "e.g. chicken, rice, tomatoes..."
                  : "e.g. lasagna, ramen, tacos..."
              }
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="min-h-[140px] bg-transparent border-0 text-base p-4 resize-none focus-visible:ring-0"
            />
          </div>

          <div className="flex gap-2 mb-6 flex-wrap">
            {(mode === "ingredients"
              ? ["chicken, rice", "pasta, tomato sauce", "eggs, cheese"]
              : ["pasta dish", "stir fry", "soup"]
            ).map((s) => (
              <button
                key={s}
                onClick={() => setInputValue(s)}
                className="text-xs bg-secondary/50 hover:bg-secondary px-3 py-1.5 rounded-full"
              >
                {s}
              </button>
            ))}
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading || !inputValue.trim()}
            className="w-full h-12 text-lg font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Thinking...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generate Recipes
              </>
            )}
          </Button>
        </div>

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
                  <button
                    onClick={() =>
                      setExpandedRecipe(expandedRecipe === index ? null : index)
                    }
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
                    <div
                      className={`p-2 rounded-full bg-secondary transition-transform ${
                        expandedRecipe === index ? "rotate-180" : ""
                      }`}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </button>

                  <AnimatePresence>
                    {expandedRecipe === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 space-y-5">
                          <div className="bg-secondary/50 rounded-xl p-4">
                            <h4 className="section-title text-primary">
                              Ingredients
                            </h4>
                            <ul className="space-y-2">
                              {recipe.ingredients.map((ing, i) => (
                                <li
                                  key={i}
                                  className="text-sm flex items-start gap-2"
                                >
                                  <span className="text-primary">•</span>
                                  {ing}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="section-title text-primary">
                              Instructions
                            </h4>
                            <ol className="space-y-3">
                              {recipe.steps.map((step, i) => (
                                <li
                                  key={i}
                                  className="text-sm flex items-start gap-3"
                                >
                                  <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                                    {i + 1}
                                  </span>
                                  <span className="pt-0.5">{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <Button
                              onClick={() => saveRecipe(recipe, index)}
                              disabled={savingRecipe === index}
                              className="h-12"
                            >
                              {savingRecipe === index ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <BookmarkPlus className="h-4 w-4 mr-2" />
                              )}
                              Save to My Recipes
                            </Button>
                            <Button
                              variant="secondary"
                              onClick={() =>
                                setShareModal({
                                  open: true,
                                  recipeIndex: index,
                                })
                              }
                              className="h-12"
                            >
                              <Share2 className="h-4 w-4 mr-2" />
                              Delen
                            </Button>
                          </div>
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

      {/* Share Modal */}
      {shareModal.recipeIndex !== null && (
        <ShareModal
          isOpen={shareModal.open}
          onClose={() => setShareModal({ open: false, recipeIndex: null })}
          itemId={`recipe-${shareModal.recipeIndex}`}
          itemType="RECIPE"
          itemName={recipes[shareModal.recipeIndex]?.title || ""}
        />
      )}
    </Layout>
  );
}
