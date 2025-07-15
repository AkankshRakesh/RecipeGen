"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Trash2, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

interface GroceryListProps {
  items: string[]
  onUpdateItemsAction: (items: string[]) => void
}

export function GroceryList({ items, onUpdateItemsAction }: GroceryListProps) {
  const [newItem, setNewItem] = useState("")
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())

  const addItem = () => {
    if (newItem.trim() && !items.includes(newItem.trim())) {
      onUpdateItemsAction([...items, newItem.trim()])
      setNewItem("")
    }
  }

  const removeItem = (item: string) => {
    onUpdateItemsAction(items.filter((i) => i !== item))
    setCheckedItems((prev) => {
      const newSet = new Set(prev)
      newSet.delete(item)
      return newSet
    })
  }

  const toggleCheck = (item: string) => {
    setCheckedItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(item)) {
        newSet.delete(item)
      } else {
        newSet.add(item)
      }
      return newSet
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addItem()
    }
  }

  const clearCompleted = () => {
    const remainingItems = items.filter((item) => !checkedItems.has(item))
    onUpdateItemsAction(remainingItems)
    setCheckedItems(new Set())
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-orange-500" />
            Grocery List
            {items.length > 0 && (
              <span className="text-sm font-normal text-gray-500">({items.length - checkedItems.size} remaining)</span>
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

          {items.length > 0 && (
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {checkedItems.size} of {items.length} items completed
              </p>
              {checkedItems.size > 0 && (
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

      {items.length > 0 ? (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              {items.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    checkedItems.has(item)
                      ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                      : "bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                  }`}
                >
                  <Checkbox checked={checkedItems.has(item)} onCheckedChange={() => toggleCheck(item)} />
                  <span
                    className={`flex-1 capitalize ${
                      checkedItems.has(item)
                        ? "line-through text-gray-500 dark:text-gray-400"
                        : "text-gray-900 dark:text-white"
                    }`}
                  >
                    {item}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
