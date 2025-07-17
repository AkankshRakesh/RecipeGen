import { NextResponse } from "next/server";

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
