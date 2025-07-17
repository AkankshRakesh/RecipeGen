"use client"
import React from "react"
import { useState, useEffect } from "react"
import { Plus, Search, ShoppingCart, BookOpen, ChefHat, Loader2, X, Lightbulb, Menu } from "lucide-react"
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
import Link from "next/link"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter, useSearchParams } from "next/navigation"

// Grocery list interfaces
interface GroceryItem {
  item: string
  checked: boolean
}
interface GroceryListRecipe {
  id: string
  name: string
  ingredients: GroceryItem[]
}
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
  const [groceryItems, setGroceryItems] = useState<GroceryListRecipe[]>([])
  const [loading, setLoading] = useState(false)
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [invalidIngredients, setInvalidIngredients] = useState<string[]>([])
  const [availableIngredients, setAvailableIngredients] = useState<string[]>([])
  const [ingredientSuggestions, setIngredientSuggestions] = useState<IngredientSuggestion[]>([])
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null)
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [selectedTab, setSelectedTab] = useState("generator")
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()

  // Fetch saved recipes when authentication status changes
  const fetchSavedRecipes = async () => {
    const token = localStorage.getItem("authToken")
    if (!token) return

    try {
      const response = await fetch("/api/save", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setSavedRecipes(data.savedRecipes || [])
      }
    } catch (error) {
      console.error("Error fetching saved recipes:", error)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    setIsAuthenticated(!!token)
    if (token) {
      fetchSavedRecipes()
    } else {
      setSavedRecipes([])
    }
  }, [])

  useEffect(() => {
    const token = searchParams.get("token")
    if (token) {
      localStorage.setItem("authToken", token)
      localStorage.setItem("name", searchParams.get("name") || "User")
      localStorage.setItem("picture", searchParams.get("picture") || "/placeholder-user.jpg")
      setIsAuthenticated(true)
      fetchSavedRecipes()
      router.replace("/")
    }
  }, [searchParams, router])

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    setIsAuthenticated(false)
    setSavedRecipes([])
    setIsSheetOpen(false)
  }

  const loadRandomRecipes = React.useCallback(async () => {
    setLoading(true)
    try {
      const randomRecipes = []
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
  }, [])

  useEffect(() => {
    loadAvailableIngredients()
    loadRandomRecipes()
  }, [loadRandomRecipes])

  const loadAvailableIngredients = async () => {
    try {
      const response = await fetch("https://www.themealdb.com/api/json/v1/1/list.php?i=list")
      const data = await response.json()
      if (data.meals) {
        const ingredientNames = data.meals.map((meal: MealDBRecipe) => (meal.strIngredient ?? "").toLowerCase())
        setAvailableIngredients(ingredientNames)
      }
    } catch (error) {
      console.error("Error loading available ingredients:", error)
    }
  }

  const transformMealDBRecipe = (meal: MealDBRecipe, matchedIngredients: string[]): Recipe => {
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
      cookTime: "30 mins",
      servings: 4,
      rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
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
      const recipesByIngredient: { [key: string]: MealDBRecipe[] } = {}
      const validIngredients: string[] = []
      const invalidIngs: string[] = []
      const suggestions: IngredientSuggestion[] = []

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

      let commonRecipes: MealDBRecipe[] = []
      if (validIngredients.length === 1) {
        commonRecipes = recipesByIngredient[validIngredients[0]]
      } else {
        const firstIngredient = validIngredients[0]
        commonRecipes = (recipesByIngredient[firstIngredient] as MealDBRecipe[]).filter((recipe: MealDBRecipe) =>
          validIngredients
            .slice(1)
            .every((ingredient) =>
              (recipesByIngredient[ingredient] as MealDBRecipe[]).some((r: MealDBRecipe) => r.idMeal === recipe.idMeal),
            ),
        )
      }

      if (commonRecipes.length === 0 && validIngredients.length > 1) {
        const allRecipes = validIngredients.flatMap((ingredient) => recipesByIngredient[ingredient])
        const recipeMap = new Map()
        allRecipes.forEach((recipe) => {
          if (recipeMap.has(recipe.idMeal)) {
            recipeMap.get(recipe.idMeal).count++
            recipeMap
              .get(recipe.idMeal)
              .matchedIngredients.push(
                ...validIngredients.filter((ing) =>
                  recipesByIngredient[ing].some((r: MealDBRecipe) => r.idMeal === recipe.idMeal),
                ),
              )
          } else {
            recipeMap.set(recipe.idMeal, {
              recipe,
              count: 1,
              matchedIngredients: validIngredients.filter((ing) =>
                recipesByIngredient[ing].some((r: MealDBRecipe) => r.idMeal === recipe.idMeal),
              ),
            })
          }
        })
        commonRecipes = Array.from(recipeMap.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, 12)
          .map((item) => item.recipe)
      }

      const detailedRecipes = await Promise.all(
        commonRecipes.slice(0, 9).map(async (meal: MealDBRecipe) => {
          try {
            const detailResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`)
            const detailData = await detailResponse.json()
            const matchedIngredients = validIngredients.filter((ingredient) =>
              recipesByIngredient[ingredient].some((r: MealDBRecipe) => r.idMeal === meal.idMeal),
            )
            return transformMealDBRecipe(detailData.meals[0], matchedIngredients)
          } catch (error) {
            console.error(`Error getting details for meal ${meal.idMeal}:`, error)
            return null
          }
        }),
      )

      const validRecipes = detailedRecipes.filter((recipe) => recipe !== null) as Recipe[]
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

  const handleSaveRecipe = async (recipe: Recipe) => {
    const token = localStorage.getItem("authToken")
    if (!token) return alert("Please log in first.")

    const isAlreadySaved = savedRecipes.some(r => r.id === recipe.id)

    try {
      const res = await fetch("/api/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ recipe }),
      })

      if (res.ok) {
        if (isAlreadySaved) {
          setSavedRecipes(prev => prev.filter(r => r.id !== recipe.id))
        } else {
          setSavedRecipes(prev => [...prev, recipe])
        }
      } else {
        console.error("Failed to save recipe")
      }
    } catch (error) {
      console.error("Error saving recipe:", error)
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

  const addToGroceryList = (recipeIngredients: string[], recipeName?: string, recipeId?: string) => {
    setGroceryItems((prevItems) => {
      const updatedItems = [...prevItems]
      // If we have recipe info, create a recipe-specific entry
      if (recipeName && recipeId) {
        const existingRecipeIndex = updatedItems.findIndex((item) => item.id === recipeId)
        if (existingRecipeIndex === -1) {
          // Create new recipe entry
          const newRecipeEntry: GroceryListRecipe = {
            id: recipeId,
            name: recipeName,
            ingredients: recipeIngredients.map((ingredient) => ({
              item: ingredient,
              checked: false,
            })),
          }
          updatedItems.push(newRecipeEntry)
        } else {
          // Add to existing recipe entry, avoiding duplicates
          const existingEntry = updatedItems[existingRecipeIndex]
          const newIngredients = recipeIngredients
            .filter(
              (ingredient) =>
                !existingEntry.ingredients.some((existing) => existing.item.toLowerCase() === ingredient.toLowerCase()),
            )
            .map((ingredient) => ({
              item: ingredient,
              checked: false,
            }))
          updatedItems[existingRecipeIndex] = {
            ...existingEntry,
            ingredients: [...existingEntry.ingredients, ...newIngredients],
          }
        }
      } else {
        // Fallback: add to miscellaneous if no recipe info provided
        const miscId = "miscellaneous-items"
        const miscIndex = updatedItems.findIndex((item) => item.id === miscId)
        if (miscIndex === -1) {
          // Create miscellaneous entry
          const miscEntry: GroceryListRecipe = {
            id: miscId,
            name: "Miscellaneous Items",
            ingredients: recipeIngredients.map((ingredient) => ({
              item: ingredient,
              checked: false,
            })),
          }
          updatedItems.push(miscEntry)
        } else {
          // Add to existing miscellaneous entry, avoiding duplicates
          const existingEntry = updatedItems[miscIndex]
          const newIngredients = recipeIngredients
            .filter(
              (ingredient) =>
                !existingEntry.ingredients.some((existing) => existing.item.toLowerCase() === ingredient.toLowerCase()),
            )
            .map((ingredient) => ({
              item: ingredient,
              checked: false,
            }))
          updatedItems[miscIndex] = {
            ...existingEntry,
            ingredients: [...existingEntry.ingredients, ...newIngredients],
          }
        }
      }
      return updatedItems
    })
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
            <Link
              href="#"
              onClick={() => setSelectedTab("generator")}
              className="flex items-center gap-2 group"
              aria-label="Go to Recipe Generator"
            >
              <ChefHat className="h-8 w-8 text-orange-500 group-hover:scale-105 transition-transform" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                RecipeGen
              </h1>
            </Link>

            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full" aria-label="User menu">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={localStorage.getItem("picture") || "/placeholder-user.jpg"} alt="User Avatar" />
                        <AvatarFallback>
                          {(localStorage.getItem("name") || "User").charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login">
                  <Button variant="outline" className="bg-orange-500 hover:bg-orange-600 text-white">
                    Login
                  </Button>
                </Link>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
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
                    placeholder="Enter an ingredient (e.g., chicken, tomatoes, rice)"
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
                              &quot;{suggestion.original}&quot; not found. Did you mean:
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
                      <strong>Note:</strong> Some ingredients couldn&apos;t be found in the database. Try using common
                      ingredient names like &quot;chicken&quot;, &quot;onion&quot;, &quot;tomato&quot;, etc.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

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
                      onSaveAction={() => handleSaveRecipe(recipe)}
                      onAddToGroceryAction={() => addToGroceryList(recipe.ingredients, recipe.title, recipe.id)}
                      onViewDetailsAction={viewRecipeDetails}
                      isSaved={savedRecipes.some(r => r.id === recipe.id)}
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
            <SavedRecipes 
              recipes={savedRecipes} 
              onAddToGrocery={addToGroceryList} 
              onViewDetails={viewRecipeDetails}
              // onUnsaveRecipe={handleSaveRecipe}
            />
          </TabsContent>

          <TabsContent value="grocery">
            <GroceryList items={groceryItems} onUpdateItemsAction={setGroceryItems} />
          </TabsContent>
        </Tabs>
      </div>

      <RecipeDetailModal recipeId={selectedRecipeId} isOpen={isRecipeModalOpen} onCloseAction={closeRecipeModal} />
    </div>
  )
}