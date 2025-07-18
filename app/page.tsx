"use client";
import React from "react";
import { useState, useEffect } from "react";
import { BookOpen, ChefHat, Search, ShoppingCart } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/theme-toggle";
import { RecipeDetailModal } from "@/components/recipe-detail-modal";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter, useSearchParams } from "next/navigation";
import { GeneratorTab } from "@/components/GeneratorTab";
import { SavedRecipesTab } from "@/components/SavedRecipes";
import { GroceryListTab } from "@/components/GroceryList";
import {
  GroceryListRecipe,
  IngredientSuggestion,
  MealDBRecipe,
} from "@/lib/types";
import { Recipe } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function RecipeGenerator() {
  // State declarations (same as before)
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [groceryItems, setGroceryItems] = useState<GroceryListRecipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [invalidIngredients, setInvalidIngredients] = useState<string[]>([]);
  const [availableIngredients, setAvailableIngredients] = useState<string[]>([]);
  const [ingredientSuggestions, setIngredientSuggestions] = useState<
    IngredientSuggestion[]
  >([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedTab, setSelectedTab] = useState("generator");
  const searchParams = useSearchParams();
  const router = useRouter();

  // Fetch saved recipes when authentication status changes
  const fetchSavedRecipes = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      const response = await fetch("/api/save", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSavedRecipes(data.savedRecipes || []);
        
      }
    } catch (error) {
      console.error("Error fetching saved recipes:", error);
    }
  };

  // Fetch grocery list when authentication status changes
  const fetchGroceryList = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      const response = await fetch("/api/groceryList", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGroceryItems(data.groceryList || []);
      }
    } catch (error) {
      console.error("Error fetching grocery list:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsAuthenticated(!!token);
    if (token) {
      fetchSavedRecipes();
      fetchGroceryList();
    } else {
      setSavedRecipes([]);
      setGroceryItems([]);
    }
  }, []);

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("authToken", token);
      localStorage.setItem("name", searchParams.get("name") || "User");
      localStorage.setItem(
        "picture",
        searchParams.get("picture") || "/placeholder-user.jpg",
      );
      setIsAuthenticated(true);
      fetchSavedRecipes();
      fetchGroceryList();
      router.replace("/");
    }
  }, [searchParams, router]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("name");
    localStorage.removeItem("picture");
    setIsAuthenticated(false);
    setSavedRecipes([]);
    setGroceryItems([]);
  };

  const loadRandomRecipes = React.useCallback(async () => {
    setLoading(true);
    try {
      const randomRecipes = [];
      for (let i = 0; i < 6; i++) {
        const response = await fetch(
          "https://www.themealdb.com/api/json/v1/1/random.php",
        );
        const data = await response.json();
        if (data.meals && data.meals[0]) {
          randomRecipes.push(transformMealDBRecipe(data.meals[0], []));
        }
      }
      setRecipes(randomRecipes);
    } catch (error) {
      console.error("Error loading random recipes:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAvailableIngredients();
    loadRandomRecipes();
  }, [loadRandomRecipes]);

  const loadAvailableIngredients = async () => {
    try {
      const response = await fetch(
        "https://www.themealdb.com/api/json/v1/1/list.php?i=list",
      );
      const data = await response.json();
      if (data.meals) {
        const ingredientNames = data.meals.map((meal: MealDBRecipe) =>
          (meal.strIngredient ?? "").toLowerCase(),
        );
        setAvailableIngredients(ingredientNames);
      }
    } catch (error) {
      console.error("Error loading available ingredients:", error);
    }
  };

  const transformMealDBRecipe = (
    meal: MealDBRecipe,
    matchedIngredients: string[],
  ): Recipe => {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      if (ingredient && ingredient.trim()) {
        ingredients.push(ingredient.toLowerCase());
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
    };
  };
  const findSimilarIngredients = (
    searchTerm: string,
    availableList: string[],
  ): string[] => {
    const term = searchTerm.toLowerCase();
    const suggestions: { ingredient: string; score: number }[] = [];

    availableList.forEach((ingredient) => {
      const ingredientLower = ingredient.toLowerCase();
      let score = 0;

      // Exact match
      if (ingredientLower === term) {
        score = 100;
      }
      // Starts with
      else if (ingredientLower.startsWith(term)) {
        score = 90;
      }
      // Contains the term
      else if (ingredientLower.includes(term)) {
        score = 80;
      }
      // Term contains the ingredient
      else if (term.includes(ingredientLower)) {
        score = 70;
      }
      // Levenshtein distance for similar words
      else {
        const distance = levenshteinDistance(term, ingredientLower);
        if (
          distance <= 2 &&
          Math.min(term.length, ingredientLower.length) > 3
        ) {
          score = 60 - distance * 10;
        }
      }

      if (score > 0) {
        suggestions.push({ ingredient, score });
      }
    });

    return suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((s) => s.ingredient);
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1,
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  };
  const searchRecipesByMultipleIngredients = async (
    ingredientList: string[],
  ) => {
    setLoading(true);
    setInvalidIngredients([]);
    setIngredientSuggestions([]);
    try {
      const recipesByIngredient: { [key: string]: MealDBRecipe[] } = {};
      const validIngredients: string[] = [];
      const invalidIngs: string[] = [];
      const suggestions: IngredientSuggestion[] = [];

      for (const ingredient of ingredientList) {
        try {
          const response = await fetch(
            `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ingredient)}`,
          );
          const data = await response.json();
          if (data.meals && data.meals.length > 0) {
            recipesByIngredient[ingredient] = data.meals;
            validIngredients.push(ingredient);
          } else {
            invalidIngs.push(ingredient);
            if (availableIngredients.length > 0) {
              const similarIngredients = findSimilarIngredients(
                ingredient,
                availableIngredients,
              );
              if (similarIngredients.length > 0) {
                suggestions.push({
                  original: ingredient,
                  suggestions: similarIngredients,
                });
              }
            }
          }
        } catch (error) {
          console.error(`Error searching for ${ingredient}:`, error);
          invalidIngs.push(ingredient);
        }
      }

      setInvalidIngredients(invalidIngs);
      setIngredientSuggestions(suggestions);

      if (validIngredients.length === 0) {
        setRecipes([]);
        setSearchPerformed(true);
        return;
      }

      let commonRecipes: MealDBRecipe[] = [];
      if (validIngredients.length === 1) {
        commonRecipes = recipesByIngredient[validIngredients[0]];
      } else {
        const firstIngredient = validIngredients[0];
        commonRecipes = (
          recipesByIngredient[firstIngredient] as MealDBRecipe[]
        ).filter((recipe: MealDBRecipe) =>
          validIngredients
            .slice(1)
            .every((ingredient) =>
              (recipesByIngredient[ingredient] as MealDBRecipe[]).some(
                (r: MealDBRecipe) => r.idMeal === recipe.idMeal,
              ),
            ),
        );
      }

      if (commonRecipes.length === 0 && validIngredients.length > 1) {
        const allRecipes = validIngredients.flatMap(
          (ingredient) => recipesByIngredient[ingredient],
        );
        const recipeMap = new Map();
        allRecipes.forEach((recipe) => {
          if (recipeMap.has(recipe.idMeal)) {
            recipeMap.get(recipe.idMeal).count++;
            recipeMap
              .get(recipe.idMeal)
              .matchedIngredients.push(
                ...validIngredients.filter((ing) =>
                  recipesByIngredient[ing].some(
                    (r: MealDBRecipe) => r.idMeal === recipe.idMeal,
                  ),
                ),
              );
          } else {
            recipeMap.set(recipe.idMeal, {
              recipe,
              count: 1,
              matchedIngredients: validIngredients.filter((ing) =>
                recipesByIngredient[ing].some(
                  (r: MealDBRecipe) => r.idMeal === recipe.idMeal,
                ),
              ),
            });
          }
        });
        commonRecipes = Array.from(recipeMap.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, 12)
          .map((item) => item.recipe);
      }

      const detailedRecipes = await Promise.all(
        commonRecipes.slice(0, 9).map(async (meal: MealDBRecipe) => {
          try {
            const detailResponse = await fetch(
              `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`,
            );
            const detailData = await detailResponse.json();
            const matchedIngredients = validIngredients.filter((ingredient) =>
              recipesByIngredient[ingredient].some(
                (r: MealDBRecipe) => r.idMeal === meal.idMeal,
              ),
            );
            return transformMealDBRecipe(
              detailData.meals[0],
              matchedIngredients,
            );
          } catch (error) {
            console.error(
              `Error getting details for meal ${meal.idMeal}:`,
              error,
            );
            return null;
          }
        }),
      );

      const validRecipes = detailedRecipes.filter(
        (recipe) => recipe !== null,
      ) as Recipe[];
      validRecipes.sort(
        (a, b) => b.matchedIngredients.length - a.matchedIngredients.length,
      );
      setRecipes(validRecipes);
      setSearchPerformed(true);
    } catch (error) {
      console.error("Error searching recipes:", error);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRecipe = async (recipe: Recipe, addNewSaved: boolean) => {
    const token = localStorage.getItem("authToken");
    if (!token) return toast("Please log in first.", {cancel: {label: "X", onClick: () => console.log('Cancel!'),}});

    const isAlreadySaved = savedRecipes.some((r) => r.id === recipe.id);

    try {
      const res = await fetch("/api/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipe, addNewSaved: addNewSaved }),
      });

      if (res.ok) {
        if (isAlreadySaved) {
          setSavedRecipes((prev) => prev.filter((r) => r.id !== recipe.id));
        } else {
          setSavedRecipes((prev) => [...prev, recipe]);
        }
        if (addNewSaved) {
                toast.success('Saved successfully!', {
                duration: 3000,
                style: {
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                  border: '1px solid var(--border)',
                },
                cancel: {
                  label: <span style={{ color: 'var(--foreground)' }}>X</span>,
                  onClick: () => console.log('Cancel!'),
                },
                });
              } else {
                toast.success('Unsaved successfully!', {
                duration: 3000,
                style: {
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                  border: '1px solid var(--border)',
                },
                cancel: {
                  label: <span style={{ color: 'var(--foreground)' }}>X</span>,
                  onClick: () => console.log('Cancel!'),
                },
                });
        }
      } else {
        console.error("Failed to save recipe");
      }
    } catch (error) {
      console.error("Error saving recipe:", error);
    }
  };

  const addIngredient = () => {
    if (
      currentIngredient.trim() &&
      !ingredients.includes(currentIngredient.trim().toLowerCase())
    ) {
      const newIngredients = [
        ...ingredients,
        currentIngredient.trim().toLowerCase(),
      ];
      setIngredients(newIngredients);
      setCurrentIngredient("");
      // Search for recipes with all ingredients
      searchRecipesByMultipleIngredients(newIngredients);
    }
  };

  const replaceIngredient = (
    originalIngredient: string,
    newIngredient: string,
  ) => {
    const newIngredients = ingredients.map((ing) =>
      ing === originalIngredient ? newIngredient : ing,
    );
    setIngredients(newIngredients);
    // Remove the suggestion for this ingredient
    setIngredientSuggestions((prev) =>
      prev.filter((s) => s.original !== originalIngredient),
    );
    // Search with the new ingredients
    searchRecipesByMultipleIngredients(newIngredients);
  };

  const removeIngredient = (ingredient: string) => {
    const newIngredients = ingredients.filter((i) => i !== ingredient);
    setIngredients(newIngredients);
    // Remove from invalid ingredients and suggestions if it was there
    setInvalidIngredients((prev) => prev.filter((i) => i !== ingredient));
    setIngredientSuggestions((prev) =>
      prev.filter((s) => s.original !== ingredient),
    );
    if (newIngredients.length === 0) {
      setSearchPerformed(false);
      setInvalidIngredients([]);
      setIngredientSuggestions([]);
      loadRandomRecipes();
    } else {
      // Search with remaining ingredients
      searchRecipesByMultipleIngredients(newIngredients);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addIngredient();
    }
  };

  // const saveRecipe = (recipe: Recipe) => {
  //   if (!savedRecipes.find((r) => r.id === recipe.id)) {
  //     setSavedRecipes([...savedRecipes, recipe])
  //   }
  // }

  const addToGroceryList = async (
    recipeIngredients: string[],
    recipeName?: string,
    recipeId?: string,
  ) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.warning('Please login to add grocery items', {
        duration: 3000,
        style: {
          background: 'var(--background)',
          color: 'var(--foreground)',
          border: '1px solid var(--border)',
        },
        cancel: {
          label: <span style={{ color: 'var(--foreground)' }}>X</span>,
          onClick: () => console.log('Cancel!'),
        },
        });
      return;
    }

    try {
      const response = await fetch("/api/groceryList", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipeIngredients,
          recipeName,
          recipeId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGroceryItems(data.groceryList);
        toast.success('Ingredients added to grocery list!', {
          duration: 3000,
          style: {
            background: 'var(--background)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
          },
          cancel: {
            label: <span style={{ color: 'var(--foreground)' }}>X</span>,
            onClick: () => console.log('Cancel!'),
          },
        });
      } else {
        console.error("Failed to add ingredients to grocery list");
        alert("Failed to add ingredients to grocery list");
      }
    } catch (error) {
      console.error("Error adding to grocery list:", error);
      alert("Error adding ingredients to grocery list");
    }
  };

  const updateGroceryList = async (
    items: GroceryListRecipe[] | ((prevItems: GroceryListRecipe[]) => GroceryListRecipe[])
  ) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Please log in to manage your grocery list.");
      return;
    }

    // Handle function updates
    let updatedItems: GroceryListRecipe[];
    if (typeof items === "function") {
      updatedItems = items(groceryItems);
    } else {
      updatedItems = items;
    }

    // Optimistically update the UI
    setGroceryItems(updatedItems);

    try {
      const response = await fetch("/api/groceryList", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          groceryList: updatedItems,
        }),
      });

      if (!response.ok) {
        console.error("Failed to update grocery list");
        // Revert on failure by fetching fresh data
        fetchGroceryList();
      }
    } catch (error) {
      console.error("Error updating grocery list:", error);
      // Revert on failure by fetching fresh data
      fetchGroceryList();
    }
  };

  const viewRecipeDetails = (recipeId: string) => {
    setSelectedRecipeId(recipeId);
    setIsRecipeModalOpen(true);
  };

  const closeRecipeModal = () => {
    setIsRecipeModalOpen(false);
    setSelectedRecipeId(null);
  };

  // const filteredRecipes = recipes;

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
                    <Button
                      variant="ghost"
                      className="relative h-9 w-9 rounded-full"
                      aria-label="User menu"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src={
                            localStorage.getItem("picture") ||
                            "/placeholder-user.jpg"
                          }
                          alt="User Avatar"
                        />
                        <AvatarFallback>
                          {(localStorage.getItem("name") || "User").charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuItem onClick={handleLogout}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
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
        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="space-y-6"
        >
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

          <TabsContent value="generator">
            <GeneratorTab
              ingredients={ingredients}
              currentIngredient={currentIngredient}
              recipes={recipes}
              loading={loading}
              searchPerformed={searchPerformed}
              invalidIngredients={invalidIngredients}
              ingredientSuggestions={ingredientSuggestions}
              savedRecipes={savedRecipes}
              setCurrentIngredient={setCurrentIngredient}
              addIngredient={addIngredient}
              removeIngredient={removeIngredient}
              replaceIngredient={replaceIngredient}
              handleKeyPress={handleKeyPress}
              handleSaveRecipe={handleSaveRecipe}
              addToGroceryList={addToGroceryList}
              viewRecipeDetails={viewRecipeDetails}
            />
          </TabsContent>

          <TabsContent value="saved">
            <SavedRecipesTab
              savedRecipes={savedRecipes}
              onAddToGrocery={addToGroceryList}
              onViewDetails={viewRecipeDetails}
              onSaveRecipe={handleSaveRecipe}
            />
          </TabsContent>

          <TabsContent value="grocery">
            <GroceryListTab
              groceryItems={groceryItems}
              onUpdateItemsAction={updateGroceryList}
            />
          </TabsContent>
        </Tabs>
      </div>

      <RecipeDetailModal
        recipeId={selectedRecipeId}
        isOpen={isRecipeModalOpen}
        onCloseAction={closeRecipeModal}
      />
    </div>
  );
}