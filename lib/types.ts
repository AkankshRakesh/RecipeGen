export interface GroceryItem {
  item: string;
  checked: boolean;
}

export interface GroceryListRecipe {
  id: string;
  name: string;
  ingredients: GroceryItem[];
}

export interface MealDBRecipe {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  [key: string]: string | null;
}

export interface Recipe {
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

export interface IngredientSuggestion {
  original: string;
  suggestions: string[];
}