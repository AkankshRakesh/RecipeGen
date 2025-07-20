import { Search, Loader2, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RecipeCard } from "@/components/RecipeCard";
import { EnhancedIngredientInput } from "@/components/EnhancedIngredientInput";
import { Recipe } from "@/lib/types";

interface GeneratorTabProps {
  ingredients: string[];
  currentIngredient: string;
  recipes: Recipe[];
  loading: boolean;
  searchPerformed: boolean;
  invalidIngredients: string[];
  ingredientSuggestions: {
    original: string;
    suggestions: string[];
  }[];
  savedRecipes: Recipe[];
  availableIngredients: string[];
  setCurrentIngredient: (value: string) => void;
  addIngredient: () => void;
  removeIngredient: (ingredient: string) => void;
  replaceIngredient: (original: string, newIngredient: string) => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  handleSaveRecipe: (recipe: Recipe, addNewSaved: boolean) => void;
  addToGroceryList: (
    ingredients: string[],
    recipeName?: string,
    recipeId?: string,
  ) => void;
  viewRecipeDetails: (recipeId: string) => void;
}

export function GeneratorTab({
  ingredients,
  currentIngredient,
  recipes,
  loading,
  searchPerformed,
  invalidIngredients,
  ingredientSuggestions,
  savedRecipes,
  availableIngredients,
  setCurrentIngredient,
  addIngredient,
  removeIngredient,
  replaceIngredient,
  handleKeyPress,
  handleSaveRecipe,
  addToGroceryList,
  viewRecipeDetails,
}: GeneratorTabProps) {
  return (
    <div className="space-y-6">
      {/* Enhanced Ingredient Input */}
      <EnhancedIngredientInput
        ingredients={ingredients}
        currentIngredient={currentIngredient}
        availableIngredients={availableIngredients}
        loading={loading}
        setCurrentIngredientAction={setCurrentIngredient}
        addIngredientAction={addIngredient}
        removeIngredientAction={removeIngredient}
        handleKeyPressAction={handleKeyPress}
      />

      {/* Invalid ingredients and suggestions */}
      {ingredientSuggestions.length > 0 && (
        <div className="space-y-3">
          {ingredientSuggestions.map((suggestion) => (
            <Card
              key={suggestion.original}
              className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20"
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      &quot;{suggestion.original}&quot; not found. Did you mean:
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {suggestion.suggestions.map((suggestedIngredient) => (
                        <Button
                          key={suggestedIngredient}
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs bg-white dark:bg-gray-800 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                          onClick={() =>
                            replaceIngredient(
                              suggestion.original,
                              suggestedIngredient,
                            )
                          }
                        >
                          {suggestedIngredient}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {invalidIngredients.length > 0 && ingredientSuggestions.length === 0 && (
        <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
          <CardContent className="p-3">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Note:</strong> Some ingredients couldn&apos;t be found in
              the database. Try using common ingredient names like
              &quot;chicken&quot;, &quot;onion&quot;, &quot;tomato&quot;, etc.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {ingredients.length > 0
              ? `Recipes with ${ingredients
                  .filter((i) => !invalidIngredients.includes(i))
                  .join(", ")}`
              : "Popular Recipes"}
          </h2>
          <Badge variant="outline" className="text-sm">
            {loading ? "Loading..." : `${recipes.length} recipes found`}
          </Badge>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">
              Finding recipes with your ingredients...
            </span>
          </div>
        ) : recipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onSaveAction={() => handleSaveRecipe(recipe, true)}
                onAddToGroceryAction={() =>
                  addToGroceryList(recipe.ingredients, recipe.title, recipe.id)
                }
                onViewDetailsAction={viewRecipeDetails}
                isSaved={savedRecipes.some((r) => r.id === recipe.id)}
              />
            ))}
          </div>
        ) : searchPerformed ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                No recipes found
              </p>
              <p className="text-sm text-gray-400">
                {invalidIngredients.length === ingredients.length
                  ? "None of the ingredients were found. Try the suggested alternatives above."
                  : "Try different ingredient combinations or check spelling"}
              </p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
