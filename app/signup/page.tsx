"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Chrome } from "lucide-react"

// Simple Google OAuth sign-in handler
function oauthSignIn(provider: string) {
  // Redirect to your OAuth endpoint (adjust the URL as needed)
  window.location.href = `/api/auth/${provider}`;
}

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: { "Content-Type": "application/json" },
      })

      const data = await res.json()
      if (res.ok) {
        router.push("/login")
      } else {
        setError(data.message || "Signup failed")
      }
    } catch (err) {
      setError("An unexpected error occurred" + err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">Sign Up</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Create an account to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 text-center">
            {/* <Link href="/" className="text-sm text-orange-600 hover:underline dark:text-orange-400">
              ← Back to Home
            </Link> */}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="m@example.com" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            {error && (
              <p className="text-sm text-red-500 dark:text-red-400">
                {error}
              </p>
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-orange-500 hover:bg-orange-600" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing up...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>
          
          <div className="relative">
            <Separator className="my-8" />
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-2 text-sm text-gray-500 dark:bg-gray-900 dark:text-gray-400">
              OR
            </span>
          </div>
          
          <form action={oauthSignIn.bind(null, "google")}>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              <Chrome className="mr-2 h-4 w-4" />
              Sign up with Google
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-orange-600 hover:underline dark:text-orange-400">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}