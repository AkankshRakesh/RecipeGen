import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcrypt";
import clientPromise from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const client = await clientPromise;
  const db = client.db("recipegen");

  const existing = await db.collection("users").findOne({ email });
  if (existing) {
    return NextResponse.json({ message: "User already exists" }, { status: 400 });
  }

  const hashed = await hash(password, 10);
  const result = await db.collection("users").insertOne({ email, password: hashed });

  return NextResponse.json({ message: "User registered", userId: result.insertedId }, { status: 201 });
}
