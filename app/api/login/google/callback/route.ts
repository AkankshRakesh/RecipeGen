import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { signJwt } from "@/lib/jwt";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  if (!code) return NextResponse.json({ error: "No code" }, { status: 400 });

  const redirectUri = `${process.env.SITE}/api/login/google/callback`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;

  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const userData = await userRes.json();

  const client = await clientPromise;
  const db = client.db("recipegen");

  const user = await db.collection("users").findOne({ email: userData.email });
  if (!user) {
    await db.collection("users").insertOne({
      email: userData.email,
      name: userData.name,
      picture: userData.picture,
      provider: "google",
    });
  }

  const token = signJwt({ email: userData.email });
  const name = encodeURIComponent(userData.name);
  const picture = encodeURIComponent(userData.picture);

  // Redirect to frontend with token, name, and picture
  return NextResponse.redirect(
    `${process.env.SITE}/?token=${token}&name=${name}&picture=${picture}`,
  );
}
