"use client"

import type React from "react"
import { useState } from "react"
import { Plus, Trash2, ShoppingCart, UtensilsCrossed, ChefHat } from "lucide-react" // Added UtensilsCrossed, ChefHat
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

// New interfaces for grocery list
interface GroceryItem {
  item: string
  checked: boolean
}

interface GroceryListRecipe {
  id: string // Recipe ID or a unique ID for miscellaneous
  name: string // Recipe name or "Miscellaneous"
  ingredients: GroceryItem[]
}

interface GroceryListProps {
  items?: GroceryListRecipe[]
  onUpdateItemsAction: (items: GroceryListRecipe[] | ((prevItems: GroceryListRecipe[]) => GroceryListRecipe[])) => void
}

const MISC_RECIPE_ID = "miscellaneous-items"

export function GroceryList({ items, onUpdateItemsAction }: GroceryListProps) {
  const [newItem, setNewItem] = useState("")

  // Guard against undefined items
  const safeItems = items || []

  // Helper to find the miscellaneous recipe entry
  const getMiscRecipe = (currentItems: GroceryListRecipe[]) => currentItems.find((item) => item.id === MISC_RECIPE_ID)
  const getMiscRecipeIndex = (currentItems: GroceryListRecipe[]) =>
    currentItems.findIndex((item) => item.id === MISC_RECIPE_ID)

  const addItem = () => {
    if (newItem.trim()) {
      onUpdateItemsAction((prevItems: GroceryListRecipe[]) => {
        const updatedItems: GroceryListRecipe[] = [...prevItems]
        let miscRecipe: GroceryListRecipe | undefined = getMiscRecipe(updatedItems)
        let miscRecipeIndex: number = getMiscRecipeIndex(updatedItems)

        if (miscRecipeIndex === -1) {
          // Create miscellaneous category if it doesn't exist
          miscRecipe = {
        id: MISC_RECIPE_ID,
        name: "Miscellaneous Items",
        ingredients: [],
          }
          updatedItems.push(miscRecipe)
          miscRecipeIndex = updatedItems.length - 1
        }

        // Check if item already exists in miscellaneous
        const existingItem: GroceryItem | undefined = updatedItems[miscRecipeIndex].ingredients.find(
          (ing: GroceryItem) => ing.item.toLowerCase() === newItem.trim().toLowerCase(),
        )
        if (existingItem) {
          setNewItem("") // Clear input even if duplicate
          return prevItems // Don't add duplicate
        }

        updatedItems[miscRecipeIndex].ingredients.push({ item: newItem.trim(), checked: false })
        return updatedItems
      })
      setNewItem("")
    }
  }

  const removeItem = (recipeId: string, itemToRemove: string) => {
    onUpdateItemsAction((prevItems) => {
      return prevItems
        .map((recipeEntry) => {
          if (recipeEntry.id === recipeId) {
            return {
              ...recipeEntry,
              ingredients: recipeEntry.ingredients.filter((ing) => ing.item !== itemToRemove),
            }
          }
          return recipeEntry
        })
        .filter((recipeEntry) => recipeEntry.ingredients.length > 0) // Remove recipe entry if no ingredients left
    })
  }

  const toggleCheck = (recipeId: string, itemToToggle: string) => {
    onUpdateItemsAction((prevItems) => {
      return prevItems.map((recipeEntry) => {
        if (recipeEntry.id === recipeId) {
          return {
            ...recipeEntry,
            ingredients: recipeEntry.ingredients.map((ing) =>
              ing.item === itemToToggle ? { ...ing, checked: !ing.checked } : ing,
            ),
          }
        }
        return recipeEntry
      })
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addItem()
    }
  }

  const clearCompleted = () => {
    onUpdateItemsAction((prevItems) => {
      return prevItems
        .map((recipeEntry) => ({
          ...recipeEntry,
          ingredients: recipeEntry.ingredients.filter((ing) => !ing.checked),
        }))
        .filter((recipeEntry) => recipeEntry.ingredients.length > 0) // Remove empty recipe entries
    })
  }

  const totalItems = safeItems.reduce((acc, recipeEntry) => acc + (recipeEntry?.ingredients?.length || 0), 0)
  const completedItems = safeItems.reduce(
    (acc, recipeEntry) => acc + (recipeEntry?.ingredients?.filter((ing) => ing?.checked).length || 0),
    0,
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-orange-500" />
            Grocery List
            {totalItems > 0 && (
              <span className="text-sm font-normal text-gray-500">({totalItems - completedItems} remaining)</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add item to grocery list..."
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={addItem} className="bg-orange-500 hover:bg-orange-600">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {totalItems > 0 && (
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {completedItems} of {totalItems} items completed
              </p>
              {completedItems > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCompleted}
                  className="text-red-600 hover:text-red-700 bg-transparent"
                >
                  Clear Completed
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {totalItems > 0 ? (
        <div className="space-y-6">
          {safeItems.map((recipeEntry) => (
            <Card key={recipeEntry.id}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  {recipeEntry.id === MISC_RECIPE_ID ? (
                    <UtensilsCrossed className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChefHat className="h-5 w-5 text-orange-500" />
                  )}
                  {recipeEntry.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-2">
                  {recipeEntry.ingredients?.map((item, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        item.checked
                          ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                          : "bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                      }`}
                    >
                      <Checkbox checked={item.checked} onCheckedChange={() => toggleCheck(recipeEntry.id, item.item)} />
                      <span
                        className={`flex-1 capitalize ${
                          item.checked
                            ? "line-through text-gray-500 dark:text-gray-400"
                            : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {item.item}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(recipeEntry.id, item.item)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Your grocery list is empty. Add ingredients from recipes or manually add items above.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
