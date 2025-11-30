import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChefHat,
  Sparkles,
  Loader2,
  BookmarkPlus,
  ChevronDown,
  Share2,
  ArrowLeft,
} from "lucide-react";
import { AppLayout } from "@/shared/components";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/shared/hooks";
import { recipesApi, GeneratedRecipe } from "@/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { FoodSwipeFeed } from "./components";
import { SaveToCollectionModal, ShareModal } from "@/features/home/components";

export default function CookPage() {
  const { user, getToken } = useAuth();
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const [mode, setMode] = useState<"ingredients" | "meal">("meal");
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState<GeneratedRecipe[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [expandedRecipe, setExpandedRecipe] = useState<number | null>(0);
  const [savingRecipe, setSavingRecipe] = useState<number | null>(null);
  const [savedRecipeIds, setSavedRecipeIds] = useState<Map<number, string>>(
    new Map()
  );
  const [saveModal, setSaveModal] = useState<{
    open: boolean;
    recipeId: string | null;
  }>({
    open: false,
    recipeId: null,
  });
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
    setShowResults(false);

    try {
      const token = await getToken();
      const response = await recipesApi.generate(
        inputValue.trim(),
        token || undefined
      );

      if (response.data?.recipes) {
        setRecipes(response.data.recipes);
        setShowResults(true);
        toast.success(`Generated ${response.data.recipes.length} recipes!`);
      }
    } catch (err) {
      console.error("Error generating recipes:", err);
      toast.error("Failed to generate recipes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const saveRecipe = async (recipe: GeneratedRecipe, index: number) => {
    if (!user) {
      toast.error("Please sign in to save recipes");
      navigate("/auth");
      return;
    }

    setSavingRecipe(index);

    const { data, error } = await supabase
      .from("recipes")
      .insert({
        user_id: user.id,
        title: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        source: "AI",
      })
      .select("id")
      .single();

    if (error) {
      toast.error("Failed to save recipe");
    } else if (data) {
      setSavedRecipeIds((prev) => new Map(prev).set(index, data.id));
      toast.success("Recipe saved! Now add it to a collection.");
      setSaveModal({ open: true, recipeId: data.id });
    }

    setSavingRecipe(null);
  };

  const handleSaveToCollection = (index: number) => {
    const recipeId = savedRecipeIds.get(index);
    if (recipeId) {
      setSaveModal({ open: true, recipeId });
    } else {
      toast.error("Please save the recipe first");
    }
  };

  return (
    <AppLayout>
      <div className="page-container">
        {/* Header */}
        <div className="text-center page-header">
          <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg">
            <ChefHat className="h-8 w-8 text-white" />
          </div>
          <h1 className="page-title mb-2">Your AI Chef</h1>
          <p className="text-muted-foreground max-w-xs mx-auto">
            {mode === "ingredients"
              ? "Tell me what ingredients you have, and I'll suggest delicious recipes!"
              : "Discover delicious recipes and swipe through inspiration!"}
          </p>
        </div>

        {/* Mode Switch */}
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

        {/* Content based on mode */}
        {mode === "meal" ? (
          /* FoodSwipe Feed */
          <div className="max-w-lg mx-auto">
            <FoodSwipeFeed />
          </div>
        ) : (
          /* Ingredients Mode - Original UI */
          <>
            {!showResults ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-lg mx-auto mb-8"
              >
                <label className="block mb-3 text-sm font-medium text-muted-foreground ml-1">
                  What ingredients do you have?
                </label>

                <div className="card-elevated p-0 overflow-hidden mb-3">
                  <Textarea
                    placeholder="e.g. chicken, rice, tomatoes, onions..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="min-h-[140px] bg-transparent border-0 text-base p-4 resize-none focus-visible:ring-0"
                  />
                </div>

                {/* Suggestion Chips */}
                <div className="flex gap-2 mb-6 flex-wrap">
                  {["chicken, rice", "pasta, tomato sauce", "eggs, cheese"].map(
                    (suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setInputValue(suggestion)}
                        className="text-xs bg-secondary/50 hover:bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full transition-colors"
                      >
                        {suggestion}
                      </button>
                    )
                  )}
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={loading || !inputValue.trim()}
                  className="w-full h-12 text-lg font-semibold shadow-lg shadow-primary/20 mb-3"
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

                <p className="text-xs text-center text-muted-foreground mb-8">
                  The AI will suggest several recipe ideas and basic steps.
                </p>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or
                    </span>
                  </div>
                </div>

                {/* Future feature placeholder */}
                <Button
                  variant="secondary"
                  className="w-full mt-6 h-12 opacity-50"
                  size="lg"
                  disabled
                >
                  📷 Upload Fridge Photo (Coming Soon)
                </Button>
              </motion.div>
            ) : (
              /* Results View */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-lg mx-auto space-y-4 pb-20"
              >
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="ghost"
                    onClick={() => setShowResults(false)}
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Input
                  </Button>
                  <h2 className="section-title m-0">
                    Here's what you can make
                  </h2>
                  <div className="w-24" /> {/* Spacer for centering */}
                </div>

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
                        setExpandedRecipe(
                          expandedRecipe === index ? null : index
                        )
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
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
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
                                    className="text-sm text-foreground flex items-start gap-2"
                                  >
                                    <span className="text-primary mt-0.5">
                                      •
                                    </span>
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
                                    className="text-sm text-foreground flex items-start gap-3"
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
                                disabled={
                                  savingRecipe === index ||
                                  savedRecipeIds.has(index)
                                }
                                className="h-12"
                              >
                                {savingRecipe === index ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                  <BookmarkPlus className="h-4 w-4 mr-2" />
                                )}
                                {savedRecipeIds.has(index) ? "Saved!" : "Save"}
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
                            {savedRecipeIds.has(index) && (
                              <Button
                                variant="outline"
                                onClick={() => handleSaveToCollection(index)}
                                className="w-full h-10 mt-2"
                              >
                                Add to Collection
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Save to Collection Modal */}
      <SaveToCollectionModal
        isOpen={saveModal.open}
        onClose={() => setSaveModal({ open: false, recipeId: null })}
        itemId={saveModal.recipeId || ""}
        itemType="RECIPE"
      />

      {/* Share Modal */}
      {shareModal.recipeIndex !== null && (
        <ShareModal
          isOpen={shareModal.open}
          onClose={() => setShareModal({ open: false, recipeIndex: null })}
          itemId={
            savedRecipeIds.get(shareModal.recipeIndex) ||
            `recipe-${shareModal.recipeIndex}`
          }
          itemType="RECIPE"
          itemName={recipes[shareModal.recipeIndex]?.title || ""}
        />
      )}
    </AppLayout>
  );
}
