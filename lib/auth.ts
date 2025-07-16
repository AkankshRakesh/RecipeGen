import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import clientPromise from "./mongodb";

export const authOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
  try {
    const client = await clientPromise
    const db = client.db("recipegen")
    const user = await db.collection("users").findOne({ email: credentials?.email })

    if (!user) return null

    const isValid = await compare(credentials!.password as string, user.password as string)
    if (!isValid) return null

    return { id: user._id.toString(), email: user.email }
  } catch (err) {
    console.error("Auth error:", err)
    return null
  }
}
,
    }),
  ],
  session: { strategy: "jwt" as const },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
