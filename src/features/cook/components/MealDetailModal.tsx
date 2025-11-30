import { useEffect, useMemo, useState, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Heart,
  Share2,
  Clock,
  ChefHat,
  ExternalLink,
  Play,
  Bookmark,
  MessageCircle,
} from "lucide-react";
import { Meal, MealTag } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { recipesApi, RecipeChatMessage } from "@/api";

interface MealDetailModalProps {
  meal: Meal | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onSave: () => void;
}

type ChatMessage = RecipeChatMessage & { id: string };

const tagLabels: Record<MealTag, string> = {
  pasta: "Pasta",
  vegan: "Vegan",
  soup: "Soup",
  stirfry: "Stir Fry",
  quick: "Quick",
  cheap: "Budget",
  "high-protein": "High Protein",
  breakfast: "Breakfast",
  dessert: "Dessert",
  healthy: "Healthy",
};

function getYouTubeEmbedUrl(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  return null;
}

export function MealDetailModal({
  meal,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
  onSave,
}: MealDetailModalProps) {
  if (!meal) return null;

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    if (meal && isOpen) {
      setChatMessages([
        {
          id: "intro",
          role: "assistant",
          content: `Hey! I'm your AI sous chef for ${meal.name}. Ask me anything about this recipe.`,
        },
      ]);
      setChatInput("");
      setChatLoading(false);
      setIsChatOpen(false);
    }
  }, [meal, isOpen]);

  const recipeContext = useMemo(
    () => ({
      title: meal.name,
      description: meal.description,
      ingredients: meal.ingredients,
      steps: meal.steps,
    }),
    [meal]
  );

  const handleSendMessage = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!chatInput.trim() || !meal) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: chatInput.trim(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setChatLoading(true);

    try {
      const response = await recipesApi.chat(meal.id, {
        message: userMessage.content,
        context: recipeContext,
        history: [...chatMessages, userMessage].map(({ role, content }) => ({
          role,
          content,
        })),
      });

      const replyText =
        (response.data && (response.data.reply as string | undefined)) ||
        (response.data && (response.data.message as string | undefined)) ||
        "I could not find an answer right now, please try again.";

      setChatMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: replyText,
        },
      ]);
    } catch (error) {
      console.error("Recipe chat error:", error);
      toast.error("Chef GPT is unavailable. Please try again.");
      setChatMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: "Sorry, something went wrong while fetching an answer.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: meal.name,
      text: `Check out this recipe: ${meal.name}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          `${meal.name} - ${window.location.href}`
        );
        toast.success("Link copied to clipboard!");
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        await navigator.clipboard.writeText(
          `${meal.name} - ${window.location.href}`
        );
        toast.success("Link copied to clipboard!");
      }
    }
  };

  const handleFavorite = () => {
    onToggleFavorite(meal.id);
    if (!isFavorite) {
      toast.success("Added to favorites!");
    }
  };

  const embedUrl = meal.videoUrl ? getYouTubeEmbedUrl(meal.videoUrl) : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-card rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto my-auto"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="absolute top-3 right-3 z-10 h-10 w-10 rounded-full bg-neutral-800 flex items-center justify-center text-white hover:bg-neutral-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Image */}
            <div className="relative aspect-video">
              <img
                src={meal.imageUrl}
                alt={meal.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

              {/* Badges */}
              <div className="absolute top-3 left-3 flex gap-2">
                {meal.durationMinutes && (
                  <div className="flex items-center gap-1 bg-neutral-800 px-2.5 py-1 rounded-full">
                    <Clock className="h-3.5 w-3.5 text-white" />
                    <span className="text-xs font-medium text-white">
                      {meal.durationMinutes} min
                    </span>
                  </div>
                )}
                {meal.difficulty && (
                  <div className="flex items-center gap-1 bg-neutral-800 px-2.5 py-1 rounded-full">
                    <ChefHat className="h-3.5 w-3.5 text-white" />
                    <span className="text-xs font-medium text-white capitalize">
                      {meal.difficulty}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display font-bold text-2xl text-foreground mb-2">
                    {meal.name}
                  </h2>
                  <div className="flex flex-wrap gap-1.5">
                    {meal.tags.map((tag: MealTag) => (
                      <span
                        key={tag}
                        className="text-xs bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full"
                      >
                        {tagLabels[tag]}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={handleFavorite}
                    aria-label={
                      isFavorite ? "Remove from favorites" : "Add to favorites"
                    }
                    className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center transition-all",
                      isFavorite
                        ? "bg-red-500 text-white"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    )}
                  >
                    <Heart
                      className={cn("h-5 w-5", isFavorite && "fill-current")}
                    />
                  </button>
                  <button
                    onClick={onSave}
                    aria-label="Save to collection"
                    className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground hover:bg-secondary/80 transition-all"
                  >
                    <Bookmark className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleShare}
                    aria-label="Share recipe"
                    className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground hover:bg-secondary/80 transition-all"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Description */}
              {meal.description && (
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {meal.description}
                </p>
              )}

              {/* Video Section */}
              {meal.videoUrl && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-primary">
                    Video Tutorial
                  </h3>
                  {embedUrl ? (
                    <div className="aspect-video rounded-xl overflow-hidden bg-secondary">
                      <iframe
                        src={embedUrl}
                        title={`${meal.name} video`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </div>
                  ) : (
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => window.open(meal.videoUrl, "_blank")}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Watch on YouTube
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              )}

              {/* Ingredients */}
              <div className="bg-secondary/50 rounded-xl p-4">
                <h3 className="font-semibold text-sm text-primary mb-3">
                  Ingredients
                </h3>
                <ul className="space-y-2">
                  {meal.ingredients.map((ingredient: string, index: number) => (
                    <li
                      key={index}
                      className="text-sm text-foreground flex items-start gap-2"
                    >
                      <span className="text-primary mt-0.5">•</span>
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Steps */}
              <div>
                <h3 className="font-semibold text-sm text-primary mb-3">
                  Instructions
                </h3>
                <ol className="space-y-3">
                  {meal.steps.map((step: string, index: number) => (
                    <li
                      key={index}
                      className="text-sm text-foreground flex items-start gap-3"
                    >
                      <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Chat Assistant */}
              <div className="bg-secondary/40 rounded-xl p-4 space-y-3 border border-secondary/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-sm text-primary">
                      Ask the Chef
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 h-8"
                    onClick={() => setIsChatOpen((prev) => !prev)}
                  >
                    {isChatOpen ? "Hide" : "Open"} chat
                  </Button>
                </div>

                {isChatOpen && (
                  <div className="space-y-3">
                    <div className="bg-background/60 rounded-xl p-3 h-60 overflow-y-auto space-y-2">
                      {chatMessages.map((message) => (
                        <div
                          key={message.id}
                          className={cn(
                            "flex",
                            message.role === "user"
                              ? "justify-end"
                              : "justify-start"
                          )}
                        >
                          <div
                            className={cn(
                              "px-3 py-2 rounded-2xl text-sm max-w-[85%] shadow-sm",
                              message.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-secondary-foreground"
                            )}
                          >
                            {message.content}
                          </div>
                        </div>
                      ))}
                      {chatLoading && (
                        <p className="text-xs text-muted-foreground">
                          Chef is thinking...
                        </p>
                      )}
                    </div>

                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <Input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder={`Ask about ${meal.name}...`}
                        className="flex-1"
                        disabled={chatLoading}
                      />
                      <Button
                        type="submit"
                        disabled={chatLoading || !chatInput.trim()}
                      >
                        {chatLoading ? "..." : "Send"}
                      </Button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
