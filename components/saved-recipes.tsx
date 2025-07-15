import { BookOpen } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RecipeCard } from "@/components/recipe-card"

interface Recipe {
  id: string
  title: string
  image: string
  cookTime: string
  servings: number
  rating: number
  ingredients: string[]
  difficulty: string
  description: string
  instructions: string
  category: string
  area: string
  matchedIngredients: string[]
}

interface SavedRecipesProps {
  recipes: Recipe[]
  onAddToGrocery: (ingredients: string[]) => void
  onViewDetails: (recipeId: string) => void
}

export function SavedRecipes({ recipes, onAddToGrocery, onViewDetails }: SavedRecipesProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-orange-500" />
            Saved Recipes
            <span className="text-sm font-normal text-gray-500">({recipes.length} saved)</span>
          </CardTitle>
        </CardHeader>
      </Card>

      {recipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onSaveAction={() => {}} // Already saved
              onAddToGroceryAction={() => onAddToGrocery(recipe.ingredients)}
              onViewDetailsAction={onViewDetails}
              isSaved={true}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">No saved recipes yet</p>
            <p className="text-sm text-gray-400">Save recipes from the generator to access them here</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
