"use client";

import Image from "next/image";
import {
  Star,
  Heart,
  ShoppingCart,
  MapPin,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Recipe {
  id: string;
  title: string;
  image: string;
  cookTime: string;
  servings: number;
  rating: number;
  ingredients: string[];
  difficulty: string;
  description: string;
  instructions: string;
  category: string;
  area: string;
  matchedIngredients: string[];
}

interface RecipeCardProps {
  recipe: Recipe;
  onSaveAction: () => void;
  onAddToGroceryAction: () => void;
  onViewDetailsAction: (recipeId: string) => void;
  isSaved: boolean;
}

export function RecipeCard({
  recipe,
  onSaveAction,
  onAddToGroceryAction,
  onViewDetailsAction,
  isSaved,
}: RecipeCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-gray-800">
      <div className="relative">
        <Image
          src={recipe.image || "/placeholder.svg"}
          alt={recipe.title}
          width={300}
          height={200}
          className="w-full h-48 object-cover"
        />
        <Badge
          className={`absolute top-2 right-2 ${
            recipe.difficulty === "Easy"
              ? "bg-green-500"
              : recipe.difficulty === "Medium"
                ? "bg-yellow-500"
                : "bg-red-500"
          }`}
        >
          {recipe.difficulty}
        </Badge>
        <Badge className="absolute top-2 left-2 bg-blue-500">
          {recipe.category}
        </Badge>
      </div>

      <CardHeader className="pb-2">
        <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-1">
          {recipe.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {recipe.description}
        </p>
        
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
          <span>{recipe.area}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            {recipe.rating}
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {recipe.matchedIngredients.length > 0 && (
            <>
              {recipe.matchedIngredients.map((ingredient) => (
                <Badge
                  key={ingredient}
                  className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                >
                  ✓ {ingredient}
                </Badge>
              ))}
              {recipe.ingredients
                .slice(0, 3 - recipe.matchedIngredients.length)
                .map((ingredient) => (
                  <Badge
                    key={ingredient}
                    variant="outline"
                    className="text-xs capitalize"
                  >
                    {ingredient}
                  </Badge>
                ))}
            </>
          )}
          {recipe.matchedIngredients.length === 0 && (
            <>
              {recipe.ingredients.slice(0, 3).map((ingredient) => (
                <Badge
                  key={ingredient}
                  variant="outline"
                  className="text-xs capitalize"
                >
                  {ingredient}
                </Badge>
              ))}
            </>
          )}
          {recipe.ingredients.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{recipe.ingredients.length - 3} more
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetailsAction(recipe.id)}
            className="flex-1 bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100 dark:bg-orange-950 dark:border-orange-800 dark:text-orange-300"
          >
            <Eye className="h-4 w-4 mr-1" />
            View Recipe
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onSaveAction}
            className={`flex-1 ${isSaved ? "bg-red-50 border-red-200 text-red-700 dark:bg-red-950 dark:border-red-800 dark:text-red-300" : ""}`}
          >
            <Heart
              className={`h-4 w-4 mr-1 ${isSaved ? "fill-current" : ""}`}
            />
            {isSaved ? "Saved" : "Save"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onAddToGroceryAction}
            className="flex-1 bg-transparent"
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            Add to List
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
