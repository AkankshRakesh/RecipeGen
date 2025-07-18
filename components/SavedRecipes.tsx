import { BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecipeCard } from "@/components/recipe-card";
import { Recipe } from "@/lib/types";

interface SavedRecipesTabProps {
  savedRecipes: Recipe[];
  onAddToGrocery: (
    ingredients: string[],
    recipeName?: string,
    recipeId?: string
  ) => void;
  onViewDetails: (recipeId: string) => void;
  onSaveRecipe: (recipe: Recipe, addNewSaved: boolean) => void;
}

export function SavedRecipesTab({
  savedRecipes,
  onAddToGrocery,
  onViewDetails,
  onSaveRecipe,
}: SavedRecipesTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-orange-500" />
            Saved Recipes
            <span className="text-sm font-normal text-gray-500">
              ({savedRecipes.length} saved)
            </span>
          </CardTitle>
        </CardHeader>
      </Card>

      {savedRecipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onSaveAction={() => onSaveRecipe(recipe, false)}
              onAddToGroceryAction={() =>
                onAddToGrocery(recipe.ingredients, recipe.title, recipe.id)
              }
              onViewDetailsAction={onViewDetails}
              isSaved={true}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              No saved recipes yet
            </p>
            <p className="text-sm text-gray-400">
              Save recipes from the generator to access them here
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}