import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("recipegen")
    const recipes = await db.collection("savedRecipes").find({}).toArray()
    return NextResponse.json(recipes)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Failed to fetch" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const client = await clientPromise
    const db = client.db("recipegen")
    const result = await db.collection("savedRecipes").insertOne(body)

    return NextResponse.json(result)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Failed to save" }, { status: 500 })
  }
}
