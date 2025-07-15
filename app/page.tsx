"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Search, ShoppingCart, BookOpen, ChefHat, Loader2, X, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/theme-toggle"
import { RecipeCard } from "@/components/recipe-card"
import { GroceryList } from "@/components/grocery-list"
import { SavedRecipes } from "@/components/saved-recipes"
import { RecipeDetailModal } from "@/components/recipe-detail-modal"

interface MealDBRecipe {
  idMeal: string
  strMeal: string
  strMealThumb: string
  strCategory: string
  strArea: string
  strInstructions: string
  [key: string]: string | null
}

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

interface IngredientSuggestion {
  original: string
  suggestions: string[]
}

export default function RecipeGenerator() {
  const [ingredients, setIngredients] = useState<string[]>([])
  const [currentIngredient, setCurrentIngredient] = useState("")
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([])
  const [groceryItems, setGroceryItems] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [invalidIngredients, setInvalidIngredients] = useState<string[]>([])
  const [availableIngredients, setAvailableIngredients] = useState<string[]>([])
  const [ingredientSuggestions, setIngredientSuggestions] = useState<IngredientSuggestion[]>([])
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null)
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false)

  // Load available ingredients and random recipes on initial load
  useEffect(() => {
    loadAvailableIngredients()
    loadRandomRecipes()
  }, [])

  const loadAvailableIngredients = async () => {
    try {
      const response = await fetch("https://www.themealdb.com/api/json/v1/1/list.php?i=list")
      const data = await response.json()
      if (data.meals) {
        const ingredientNames = data.meals.map((meal: any) => meal.strIngredient.toLowerCase())
        setAvailableIngredients(ingredientNames)
      }
    } catch (error) {
      console.error("Error loading available ingredients:", error)
    }
  }

  const findSimilarIngredients = (searchTerm: string, availableList: string[]): string[] => {
    const term = searchTerm.toLowerCase()
    const suggestions: { ingredient: string; score: number }[] = []

    availableList.forEach((ingredient) => {
      const ingredientLower = ingredient.toLowerCase()
      let score = 0

      // Exact match
      if (ingredientLower === term) {
        score = 100
      }
      // Starts with
      else if (ingredientLower.startsWith(term)) {
        score = 90
      }
      // Contains the term
      else if (ingredientLower.includes(term)) {
        score = 80
      }
      // Term contains the ingredient
      else if (term.includes(ingredientLower)) {
        score = 70
      }
      // Levenshtein distance for similar words
      else {
        const distance = levenshteinDistance(term, ingredientLower)
        if (distance <= 2 && Math.min(term.length, ingredientLower.length) > 3) {
          score = 60 - distance * 10
        }
      }

      if (score > 0) {
        suggestions.push({ ingredient, score })
      }
    })

    return suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((s) => s.ingredient)
  }

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = []
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        }
      }
    }
    return matrix[str2.length][str1.length]
  }

  const loadRandomRecipes = async () => {
    setLoading(true)
    try {
      const randomRecipes = []
      // Get 6 random recipes
      for (let i = 0; i < 6; i++) {
        const response = await fetch("https://www.themealdb.com/api/json/v1/1/random.php")
        const data = await response.json()
        if (data.meals && data.meals[0]) {
          randomRecipes.push(transformMealDBRecipe(data.meals[0], []))
        }
      }
      setRecipes(randomRecipes)
    } catch (error) {
      console.error("Error loading random recipes:", error)
    } finally {
      setLoading(false)
    }
  }

  const transformMealDBRecipe = (meal: MealDBRecipe, matchedIngredients: string[]): Recipe => {
    // Extract ingredients from the meal object
    const ingredients = []
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`]
      if (ingredient && ingredient.trim()) {
        ingredients.push(ingredient.toLowerCase())
      }
    }

    return {
      id: meal.idMeal,
      title: meal.strMeal,
      image: meal.strMealThumb,
      cookTime: "30 mins", // API doesn't provide cook time
      servings: 4, // API doesn't provide servings
      rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // Random rating between 3-5
      ingredients,
      difficulty: ["Easy", "Medium", "Hard"][Math.floor(Math.random() * 3)],
      description: meal.strInstructions.slice(0, 120) + "...",
      instructions: meal.strInstructions,
      category: meal.strCategory,
      area: meal.strArea,
      matchedIngredients,
    }
  }

  const searchRecipesByMultipleIngredients = async (ingredientList: string[]) => {
    setLoading(true)
    setInvalidIngredients([])
    setIngredientSuggestions([])

    try {
      const recipesByIngredient: { [key: string]: any[] } = {}
      const validIngredients: string[] = []
      const invalidIngs: string[] = []
      const suggestions: IngredientSuggestion[] = []

      // Search for each ingredient individually
      for (const ingredient of ingredientList) {
        try {
          const response = await fetch(
            `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ingredient)}`,
          )
          const data = await response.json()

          if (data.meals && data.meals.length > 0) {
            recipesByIngredient[ingredient] = data.meals
            validIngredients.push(ingredient)
          } else {
            invalidIngs.push(ingredient)
            // Find similar ingredients
            if (availableIngredients.length > 0) {
              const similarIngredients = findSimilarIngredients(ingredient, availableIngredients)
              if (similarIngredients.length > 0) {
                suggestions.push({
                  original: ingredient,
                  suggestions: similarIngredients,
                })
              }
            }
          }
        } catch (error) {
          console.error(`Error searching for ${ingredient}:`, error)
          invalidIngs.push(ingredient)
        }
      }

      setInvalidIngredients(invalidIngs)
      setIngredientSuggestions(suggestions)

      if (validIngredients.length === 0) {
        setRecipes([])
        setSearchPerformed(true)
        return
      }

      // Find common recipes across ingredients
      let commonRecipes: any[] = []

      if (validIngredients.length === 1) {
        // If only one valid ingredient, use all its recipes
        commonRecipes = recipesByIngredient[validIngredients[0]]
      } else {
        // Find intersection of recipes
        const firstIngredient = validIngredients[0]
        commonRecipes = recipesByIngredient[firstIngredient].filter((recipe: any) =>
          validIngredients
            .slice(1)
            .every((ingredient) => recipesByIngredient[ingredient].some((r: any) => r.idMeal === recipe.idMeal)),
        )
      }

      // If no common recipes found, get recipes from each ingredient and merge
      if (commonRecipes.length === 0 && validIngredients.length > 1) {
        const allRecipes = validIngredients.flatMap((ingredient) => recipesByIngredient[ingredient])
        const recipeMap = new Map()

        // Count how many ingredients each recipe matches
        allRecipes.forEach((recipe) => {
          if (recipeMap.has(recipe.idMeal)) {
            recipeMap.get(recipe.idMeal).count++
            recipeMap
              .get(recipe.idMeal)
              .matchedIngredients.push(
                ...validIngredients.filter((ing) =>
                  recipesByIngredient[ing].some((r: any) => r.idMeal === recipe.idMeal),
                ),
              )
          } else {
            recipeMap.set(recipe.idMeal, {
              recipe,
              count: 1,
              matchedIngredients: validIngredients.filter((ing) =>
                recipesByIngredient[ing].some((r: any) => r.idMeal === recipe.idMeal),
              ),
            })
          }
        })

        // Sort by number of matched ingredients (descending)
        commonRecipes = Array.from(recipeMap.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, 12)
          .map((item) => item.recipe)
      }

      // Get detailed information for each recipe
      const detailedRecipes = await Promise.all(
        commonRecipes.slice(0, 9).map(async (meal: any) => {
          try {
            const detailResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`)
            const detailData = await detailResponse.json()

            // Find which ingredients this recipe matches
            const matchedIngredients = validIngredients.filter((ingredient) =>
              recipesByIngredient[ingredient].some((r: any) => r.idMeal === meal.idMeal),
            )

            return transformMealDBRecipe(detailData.meals[0], matchedIngredients)
          } catch (error) {
            console.error(`Error getting details for meal ${meal.idMeal}:`, error)
            return null
          }
        }),
      )

      const validRecipes = detailedRecipes.filter((recipe) => recipe !== null) as Recipe[]

      // Sort by number of matched ingredients
      validRecipes.sort((a, b) => b.matchedIngredients.length - a.matchedIngredients.length)

      setRecipes(validRecipes)
      setSearchPerformed(true)
    } catch (error) {
      console.error("Error searching recipes:", error)
      setRecipes([])
    } finally {
      setLoading(false)
    }
  }

  const addIngredient = () => {
    if (currentIngredient.trim() && !ingredients.includes(currentIngredient.trim().toLowerCase())) {
      const newIngredients = [...ingredients, currentIngredient.trim().toLowerCase()]
      setIngredients(newIngredients)
      setCurrentIngredient("")

      // Search for recipes with all ingredients
      searchRecipesByMultipleIngredients(newIngredients)
    }
  }

  const replaceIngredient = (originalIngredient: string, newIngredient: string) => {
    const newIngredients = ingredients.map((ing) => (ing === originalIngredient ? newIngredient : ing))
    setIngredients(newIngredients)

    // Remove the suggestion for this ingredient
    setIngredientSuggestions((prev) => prev.filter((s) => s.original !== originalIngredient))

    // Search with the new ingredients
    searchRecipesByMultipleIngredients(newIngredients)
  }

  const removeIngredient = (ingredient: string) => {
    const newIngredients = ingredients.filter((i) => i !== ingredient)
    setIngredients(newIngredients)

    // Remove from invalid ingredients and suggestions if it was there
    setInvalidIngredients((prev) => prev.filter((i) => i !== ingredient))
    setIngredientSuggestions((prev) => prev.filter((s) => s.original !== ingredient))

    if (newIngredients.length === 0) {
      setSearchPerformed(false)
      setInvalidIngredients([])
      setIngredientSuggestions([])
      loadRandomRecipes()
    } else {
      // Search with remaining ingredients
      searchRecipesByMultipleIngredients(newIngredients)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addIngredient()
    }
  }

  const saveRecipe = (recipe: Recipe) => {
    if (!savedRecipes.find((r) => r.id === recipe.id)) {
      setSavedRecipes([...savedRecipes, recipe])
    }
  }

  const addToGroceryList = (recipeIngredients: string[]) => {
    const newItems = recipeIngredients.filter((item) => !groceryItems.includes(item))
    setGroceryItems([...groceryItems, ...newItems])
  }

  const viewRecipeDetails = (recipeId: string) => {
    setSelectedRecipeId(recipeId)
    setIsRecipeModalOpen(true)
  }

  const closeRecipeModal = () => {
    setIsRecipeModalOpen(false)
    setSelectedRecipeId(null)
  }

  const filteredRecipes = recipes

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChefHat className="h-8 w-8 text-orange-500" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">RecipeGen</h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="generator" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="generator" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Generator
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Saved
            </TabsTrigger>
            <TabsTrigger value="grocery" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Grocery List
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="space-y-6">
            {/* Ingredient Input Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-orange-500" />
                  Add Your Ingredients
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter an ingredient (e.g., chicken, tomatoes, pasta)"
                    value={currentIngredient}
                    onChange={(e) => setCurrentIngredient(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                    disabled={loading}
                  />
                  <Button
                    onClick={addIngredient}
                    className="bg-orange-500 hover:bg-orange-600"
                    disabled={loading || !currentIngredient.trim()}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  </Button>
                </div>

                {ingredients.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Your ingredients:</p>
                    <div className="flex flex-wrap gap-2">
                      {ingredients.map((ingredient) => (
                        <Badge
                          key={ingredient}
                          variant="secondary"
                          className={`cursor-pointer ${
                            invalidIngredients.includes(ingredient)
                              ? "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200"
                              : "bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-200"
                          }`}
                          onClick={() => removeIngredient(ingredient)}
                        >
                          {ingredient}
                          {invalidIngredients.includes(ingredient) && <span className="ml-1 text-xs">(not found)</span>}
                          <X className="h-3 w-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ingredient Suggestions */}
                {ingredientSuggestions.length > 0 && (
                  <div className="space-y-3">
                    {ingredientSuggestions.map((suggestion) => (
                      <div
                        key={suggestion.original}
                        className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md"
                      >
                        <div className="flex items-start gap-2 mb-2">
                          <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                              "{suggestion.original}" not found. Did you mean:
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {suggestion.suggestions.map((suggestedIngredient) => (
                                <Button
                                  key={suggestedIngredient}
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs bg-white dark:bg-gray-800 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                  onClick={() => replaceIngredient(suggestion.original, suggestedIngredient)}
                                >
                                  {suggestedIngredient}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {invalidIngredients.length > 0 && ingredientSuggestions.length === 0 && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Note:</strong> Some ingredients couldn't be found in the database. Try using common
                      ingredient names like "chicken", "beef", "tomato", etc.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recipe Results */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {ingredients.length > 0
                    ? `Recipes with ${ingredients.filter((i) => !invalidIngredients.includes(i)).join(", ")}`
                    : "Popular Recipes"}
                </h2>
                <Badge variant="outline" className="text-sm">
                  {loading ? "Loading..." : `${filteredRecipes.length} recipes found`}
                </Badge>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    Finding recipes with your ingredients...
                  </span>
                </div>
              ) : filteredRecipes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRecipes.map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      onSaveAction={() => saveRecipe(recipe)}
                      onAddToGroceryAction={() => addToGroceryList(recipe.ingredients)}
                      onViewDetailsAction={viewRecipeDetails}
                      isSaved={savedRecipes.some((r) => r.id === recipe.id)}
                    />
                  ))}
                </div>
              ) : searchPerformed ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-2">No recipes found</p>
                    <p className="text-sm text-gray-400">
                      {invalidIngredients.length === ingredients.length
                        ? "None of the ingredients were found. Try the suggested alternatives above."
                        : "Try different ingredient combinations or check spelling"}
                    </p>
                  </CardContent>
                </Card>
              ) : null}
            </div>
          </TabsContent>

          <TabsContent value="saved">
            <SavedRecipes recipes={savedRecipes} onAddToGrocery={addToGroceryList} onViewDetails={viewRecipeDetails} />
          </TabsContent>

          <TabsContent value="grocery">
            <GroceryList items={groceryItems} onUpdateItems={setGroceryItems} />
          </TabsContent>
        </Tabs>
      </div>
      <RecipeDetailModal recipeId={selectedRecipeId} isOpen={isRecipeModalOpen} onClose={closeRecipeModal} />
    </div>
  )
}
