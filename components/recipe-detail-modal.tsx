"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  ChefHat,
  Loader2,
  Youtube,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface MealDBRecipe {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strYoutube?: string;
  strSource?: string;
  [key: string]: string | null | undefined;
}

interface RecipeDetailModalProps {
  recipeId: string | null;
  isOpen: boolean;
  onCloseAction: () => void;
}

export function RecipeDetailModal({
  recipeId,
  isOpen,
  onCloseAction,
}: RecipeDetailModalProps) {
  const [recipe, setRecipe] = useState<MealDBRecipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (recipeId && isOpen) {
      fetchRecipeDetails(recipeId);
    }
  }, [recipeId, isOpen]);

  const fetchRecipeDetails = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`,
      );
      const data = await response.json();

      if (data.meals && data.meals[0]) {
        setRecipe(data.meals[0]);
      } else {
        setError("Recipe not found");
      }
    } catch (err) {
      setError("Failed to load recipe details");
      console.error("Error fetching recipe details:", err);
    } finally {
      setLoading(false);
    }
  };

  const getIngredientsWithMeasurements = (meal: MealDBRecipe) => {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ingredient && ingredient.trim()) {
        ingredients.push({
          ingredient: ingredient.trim(),
          measure: measure?.trim() || "",
        });
      }
    }
    return ingredients;
  };

  const formatInstructions = (instructions: string) => {
    // Split by common delimiters and clean up
    const steps = instructions
      .split(/\r\n\r\n|\n\n|\r\r/)
      .map((step) => step.replace(/\r\n|\r|\n/g, " ").trim())
      .filter((step) => step.length > 0);

    // If no double line breaks, try single line breaks
    if (steps.length <= 1) {
      return instructions
        .split(/\r\n|\r|\n/)
        .map((step) => step.trim())
        .filter((step) => step.length > 0)
        .map((step, index) => (
          <div
            key={index}
            className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                {index + 1}
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {step}
              </p>
            </div>
          </div>
        ));
    }

    return steps.map((step, index) => (
      <div
        key={index}
        className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
            {index + 1}
          </div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {step}
          </p>
        </div>
      </div>
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCloseAction}>
      <DialogContent
        showCloseButton={false}
        className="max-w-5xl max-h-[95vh] p-0 gap-0 overflow-hidden"
      >
        <DialogTitle className="sr-only">
          {recipe?.strMeal || "Recipe Details"}
        </DialogTitle>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Loading delicious recipe...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="text-red-500 text-6xl mb-4">😞</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Oops!
            </h3>
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button
              onClick={onCloseAction}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Close
            </Button>
          </div>
        ) : recipe ? (
          <div className="flex flex-col h-full max-h-[95vh]">
            {/* Header with Image */}
            <div className="relative h-64 md:h-80 flex-shrink-0">
              <Image
                src={recipe.strMealThumb || "/placeholder.svg"}
                alt={recipe.strMeal}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={onCloseAction}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-white/20"
              >
                <X className="h-5 w-5" />
              </Button>

              {/* Recipe Title Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {recipe.strMeal}
                </h1>
                <div className="flex items-center gap-2 text-white/90">
                  <div className="flex items-center gap-1">
                    <Badge className="bg-orange-500 hover:bg-orange-600 text-white">
                    {recipe.strCategory}
                  </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge
                    variant="outline"
                    className="bg-white/20 border-white/30 text-white"
                  >
                    {recipe.strArea}
                  </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-200 dark:scrollbar-thumb-orange-800 scrollbar-track-transparent">
              <div className="p-6 space-y-8">
                {/* Quick Actions */}
                {(recipe.strYoutube || recipe.strSource) && (
                  <div className="flex gap-3">
                    {recipe.strYoutube && (
                      <Button
                        variant="outline"
                        onClick={() => window.open(recipe.strYoutube, "_blank")}
                        className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:border-red-800 dark:text-red-300"
                      >
                        <Youtube className="h-4 w-4 mr-2" />
                        Watch Video
                      </Button>
                    )}
                    {recipe.strSource && (
                      <Button
                        variant="outline"
                        onClick={() => window.open(recipe.strSource, "_blank")}
                        className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Original Recipe
                      </Button>
                    )}
                  </div>
                )}

                {/* Ingredients Section */}
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <ChefHat className="h-6 w-6 text-orange-500" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Ingredients
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {getIngredientsWithMeasurements(recipe).map(
                      (item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-xl border border-orange-100 dark:border-orange-900/30"
                        >
                          <span className="font-medium text-gray-900 dark:text-white capitalize flex-1">
                            {item.ingredient}
                          </span>
                          <Badge
                            variant="secondary"
                            className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 ml-3"
                          >
                            {item.measure || "To taste"}
                          </Badge>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                <Separator className="my-8" />

                {/* Instructions Section */}
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">📝</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Instructions
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {formatInstructions(recipe.strInstructions)}
                  </div>
                </div>

                {/* Bottom Spacing */}
                <div className="h-4" />
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
