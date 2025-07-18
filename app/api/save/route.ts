// app/api/save/route.ts
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/jwt";

interface UserDocument {
  email: string;
  savedRecipes: Array<{
    id: string;
    [key: string]: unknown;
  }>;
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
  const { recipe, addNewSaved } = await req.json();

  if (!recipe || !email) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db("recipegen");
  const usersCollection = db.collection<UserDocument>("users");

  try {
    if (!addNewSaved) {
      // Remove recipe from savedRecipes array
      await usersCollection.updateOne(
        { email },
        { 
          $pull: { 
            savedRecipes: { id: recipe.id } 
          } 
        }
      );
      return NextResponse.json({ message: "Recipe unsaved" });
    } else {
      // Add recipe if isSaved is false (meaning we want to save)
      await usersCollection.updateOne(
        { email },
        { $addToSet: { savedRecipes: recipe } } 
      );
      return NextResponse.json({ message: "Recipe saved" });
    }
  } catch (error) {
    console.error("Database operation failed:", error);
    return NextResponse.json(
      { error: "Failed to update saved recipes" },
      { status: 500 }
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
  const usersCollection = db.collection<UserDocument>("users");

  const user = await usersCollection
    .findOne({ email }, { projection: { savedRecipes: 1, _id: 0 } });

  return NextResponse.json({ savedRecipes: user?.savedRecipes || [] });
}
