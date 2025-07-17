// app/api/save/route.ts
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/jwt";

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
  const { recipe } = await req.json();

  if (!recipe || !email) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db("recipegen");

  await db.collection("users").updateOne(
    { email },
    { $addToSet: { savedRecipes: recipe } }, // prevents duplicates
  );

  return NextResponse.json({ message: "Recipe saved" });
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

  const user = await db
    .collection("users")
    .findOne({ email }, { projection: { savedRecipes: 1, _id: 0 } });

  return NextResponse.json({ savedRecipes: user?.savedRecipes || [] });
}
