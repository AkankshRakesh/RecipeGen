import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { compare } from "bcrypt";
import { signJwt } from "@/lib/jwt";
export async function GET() {
  const redirectUri = `${process.env.SITE}/api/login/google/callback`;
  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const scope = [
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email",
  ].join(" ");

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&access_type=offline&prompt=consent`;

  return NextResponse.redirect(authUrl);
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const client = await clientPromise;
    const db = client.db("recipegen");

    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    const token = signJwt({
      userId: user._id,
      email: user.email,
    });

    return NextResponse.json({ token });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
