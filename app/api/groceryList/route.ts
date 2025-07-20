// app/api/groceryList/route.ts
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/jwt";

interface GroceryItem {
  item: string;
  checked: boolean;
}

interface GroceryListRecipe {
  id: string;
  name: string;
  ingredients: GroceryItem[];
}

interface UserGroceryDocument {
  email: string;
  groceryList: GroceryListRecipe[];
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 401 });
  }

  const decoded = verifyToken(token);
  if (!decoded || typeof decoded !== "object" || !("email" in decoded)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const { email } = decoded;
  const { recipeIngredients, recipeName, recipeId } = await req.json();

  if (!recipeIngredients || !Array.isArray(recipeIngredients)) {
    return NextResponse.json(
      { error: "Missing or invalid ingredients" },
      { status: 400 },
    );
  }

  const client = await clientPromise;
  const db = client.db("recipegen");
  const groceryCollection = db.collection<UserGroceryDocument>("groceryLists");

  try {
    // Find existing grocery list for user
    const userGroceryList = await groceryCollection.findOne({ email });

    let currentGroceryList: GroceryListRecipe[] = [];
    if (userGroceryList) {
      currentGroceryList = userGroceryList.groceryList;
    }

    const updatedGroceryList = [...currentGroceryList];

    if (recipeName && recipeId) {
      // Add ingredients under specific recipe
      const existingRecipeIndex = updatedGroceryList.findIndex(
        (item) => item.id === recipeId,
      );

      if (existingRecipeIndex === -1) {
        // Create new recipe entry
        const newRecipeEntry: GroceryListRecipe = {
          id: recipeId,
          name: recipeName,
          ingredients: recipeIngredients.map((ingredient: string) => ({
            item: ingredient,
            checked: false,
          })),
        };
        updatedGroceryList.push(newRecipeEntry);
      } else {
        // Add to existing recipe entry, avoiding duplicates
        const existingEntry = updatedGroceryList[existingRecipeIndex];
        const newIngredients = recipeIngredients
          .filter(
            (ingredient: string) =>
              !existingEntry.ingredients.some(
                (existing) =>
                  existing.item.toLowerCase() === ingredient.toLowerCase(),
              ),
          )
          .map((ingredient: string) => ({
            item: ingredient,
            checked: false,
          }));

        updatedGroceryList[existingRecipeIndex] = {
          ...existingEntry,
          ingredients: [...existingEntry.ingredients, ...newIngredients],
        };
      }
    } else {
      // Add to miscellaneous items
      const miscId = "miscellaneous-items";
      const miscIndex = updatedGroceryList.findIndex(
        (item) => item.id === miscId,
      );

      if (miscIndex === -1) {
        // Create miscellaneous entry
        const miscEntry: GroceryListRecipe = {
          id: miscId,
          name: "Miscellaneous Items",
          ingredients: recipeIngredients.map((ingredient: string) => ({
            item: ingredient,
            checked: false,
          })),
        };
        updatedGroceryList.push(miscEntry);
      } else {
        // Add to existing miscellaneous entry, avoiding duplicates
        const existingEntry = updatedGroceryList[miscIndex];
        const newIngredients = recipeIngredients
          .filter(
            (ingredient: string) =>
              !existingEntry.ingredients.some(
                (existing) =>
                  existing.item.toLowerCase() === ingredient.toLowerCase(),
              ),
          )
          .map((ingredient: string) => ({
            item: ingredient,
            checked: false,
          }));

        updatedGroceryList[miscIndex] = {
          ...existingEntry,
          ingredients: [...existingEntry.ingredients, ...newIngredients],
        };
      }
    }

    // Update or insert the grocery list
    await groceryCollection.updateOne(
      { email },
      { $set: { groceryList: updatedGroceryList } },
      { upsert: true },
    );

    return NextResponse.json({
      message: "Ingredients added to grocery list",
      groceryList: updatedGroceryList,
    });
  } catch (error) {
    console.error("Database operation failed:", error);
    return NextResponse.json(
      { error: "Failed to update grocery list" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 401 });
  }

  const decoded = verifyToken(token);
  if (!decoded || typeof decoded !== "object" || !("email" in decoded)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const { email } = decoded;

  const client = await clientPromise;
  const db = client.db("recipegen");
  const groceryCollection = db.collection<UserGroceryDocument>("groceryLists");

  try {
    const userGroceryList = await groceryCollection.findOne({ email });

    return NextResponse.json({
      groceryList: userGroceryList?.groceryList || [],
    });
  } catch (error) {
    console.error("Database operation failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch grocery list" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 401 });
  }

  const decoded = verifyToken(token);
  if (!decoded || typeof decoded !== "object" || !("email" in decoded)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const { email } = decoded;
  const { groceryList } = await req.json();

  if (!groceryList || !Array.isArray(groceryList)) {
    return NextResponse.json(
      { error: "Invalid grocery list data" },
      { status: 400 },
    );
  }

  const client = await clientPromise;
  const db = client.db("recipegen");
  const groceryCollection = db.collection<UserGroceryDocument>("groceryLists");

  try {
    await groceryCollection.updateOne(
      { email },
      { $set: { groceryList } },
      { upsert: true },
    );

    return NextResponse.json({
      message: "Grocery list updated successfully",
      groceryList,
    });
  } catch (error) {
    console.error("Database operation failed:", error);
    return NextResponse.json(
      { error: "Failed to update grocery list" },
      { status: 500 },
    );
  }
}
