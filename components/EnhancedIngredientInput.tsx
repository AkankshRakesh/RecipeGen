"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, Search, X, ChefHat, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface EnhancedIngredientInputProps {
  ingredients: string[];
  currentIngredient: string;
  availableIngredients: string[];
  loading: boolean;
  setCurrentIngredientAction: (value: string) => void;
  addIngredientAction: () => void;
  removeIngredientAction: (ingredient: string) => void;
  handleKeyPressAction: (e: React.KeyboardEvent) => void;
}

const POPULAR_INGREDIENTS = [
  "chicken", "beef", "pork", "fish", "salmon", "eggs",
  "onion", "garlic", "tomato", "potato", "carrot", "bell pepper",
  "rice", "pasta", "bread", "flour", "milk", "cheese",
  "olive oil", "salt", "pepper", "basil", "oregano", "thyme"
];

export function EnhancedIngredientInput({
  ingredients,
  currentIngredient,
  availableIngredients,
  loading,
  setCurrentIngredientAction,
  addIngredientAction,
  removeIngredientAction,
  handleKeyPressAction,
}: EnhancedIngredientInputProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentIngredient.trim() && availableIngredients.length > 0) {
      const query = currentIngredient.toLowerCase().trim();
      const suggestions = availableIngredients
        .filter(ingredient => 
          ingredient.toLowerCase().includes(query) &&
          !ingredients.includes(ingredient.toLowerCase())
        )
        .sort((a, b) => {
          const aLower = a.toLowerCase();
          const bLower = b.toLowerCase();
          
          if (aLower === query) return -1;
          if (bLower === query) return 1;
          
          if (aLower.startsWith(query) && !bLower.startsWith(query)) return -1;
          if (bLower.startsWith(query) && !aLower.startsWith(query)) return 1;
          
          return aLower.localeCompare(bLower);
        })
        .slice(0, 8);
      
      setFilteredSuggestions(suggestions);
      setIsDropdownOpen(suggestions.length > 0);
      setSelectedSuggestionIndex(-1);
    } else {
      setFilteredSuggestions([]);
      setIsDropdownOpen(false);
      setSelectedSuggestionIndex(-1);
    }
  }, [currentIngredient, availableIngredients, ingredients]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedSuggestionIndex >= 0) {
        selectSuggestion(filteredSuggestions[selectedSuggestionIndex]);
      } else {
        addIngredientAction();
      }
    } else if (e.key === "Escape") {
      setIsDropdownOpen(false);
      setSelectedSuggestionIndex(-1);
    } else {
      handleKeyPressAction(e);
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setCurrentIngredientAction(suggestion);
    setIsDropdownOpen(false);
    setSelectedSuggestionIndex(-1);
    setTimeout(() => {
      if (inputRef.current) {
        addIngredientAction();
      }
    }, 100);
  };

  const addPopularIngredient = (ingredient: string) => {
    if (!ingredients.includes(ingredient.toLowerCase())) {
      setCurrentIngredientAction(ingredient);
      setTimeout(() => addIngredientAction(), 100);
    }
  };


  const availablePopularIngredients = POPULAR_INGREDIENTS.filter(
    ingredient => !ingredients.includes(ingredient.toLowerCase())
  ).slice(0, 12);

  return (
    <Card className="relative">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Add Your Ingredients
            </h3>
          </div>
        </div>

        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                ref={inputRef}
                placeholder="Type an ingredient... (e.g., chicken, tomatoes, garlic)"
                value={currentIngredient}
                onChange={(e) => setCurrentIngredientAction(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (filteredSuggestions.length > 0) {
                    setIsDropdownOpen(true);
                  }
                }}
                onBlur={(e) => {
                  setTimeout(() => {
                    if (!dropdownRef.current?.contains(e.relatedTarget)) {
                      setIsDropdownOpen(false);
                    }
                  }, 200);
                }}
                className="pl-10 pr-4 h-11 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 focus:border-orange-500 dark:focus:border-orange-400 transition-colors"
                disabled={loading}
              />
              
              {isDropdownOpen && filteredSuggestions.length > 0 && (
                <div
                  ref={dropdownRef}
                  className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto"
                >
                  {filteredSuggestions.map((suggestion, index) => (
                    <button
                      key={suggestion}
                      onClick={() => selectSuggestion(suggestion)}
                      className={`w-full text-left px-4 py-2 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors ${
                        index === selectedSuggestionIndex
                          ? "bg-orange-100 dark:bg-orange-900/30"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Search className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-900 dark:text-white">
                          {suggestion}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <Button
              onClick={addIngredientAction}
              className="bg-orange-500 hover:bg-orange-600 text-white h-11 px-6 transition-colors"
              disabled={loading || !currentIngredient.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {ingredients.length === 0 && availablePopularIngredients.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Popular ingredients to get started:
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {availablePopularIngredients.map((ingredient) => (
                <Button
                  key={ingredient}
                  variant="outline"
                  size="sm"
                  onClick={() => addPopularIngredient(ingredient)}
                  className="h-8 text-sm bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-all duration-200 hover:scale-105"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {ingredient}
                </Button>
              ))}
            </div>
          </div>
        )}
        {ingredients.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Your ingredients ({ingredients.length}):
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {ingredients.map((ingredient) => (
                <Badge
                  key={ingredient}
                  variant="secondary"
                  className="group bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 hover:bg-orange-200 dark:hover:bg-orange-900/50 cursor-pointer transition-all duration-200 pr-1 py-1.5 text-sm font-medium"
                  onClick={() => removeIngredientAction(ingredient)}
                >
                  {ingredient}
                  <X className="h-3 w-3 ml-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" />
                </Badge>
              ))}
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}