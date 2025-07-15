"use client"

import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check initial theme
    const theme = localStorage.getItem("theme")
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    setIsDark(theme === "dark" || (!theme && systemDark))
  }, [])

  useEffect(() => {
    if (mounted) {
      if (isDark) {
        document.documentElement.classList.add("dark")
        localStorage.setItem("theme", "dark")
      } else {
        document.documentElement.classList.remove("dark")
        localStorage.setItem("theme", "light")
      }
    }
  }, [isDark, mounted])

  const toggleTheme = () => {
    setIsDark(!isDark)
  }

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="border-orange-200 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-950 bg-transparent"
      >
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="border-orange-200 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-950 bg-transparent"
    >
      <Sun
        className={`h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all ${isDark ? "-rotate-90 scale-0" : ""}`}
      />
      <Moon
        className={`absolute h-[1.2rem] w-[1.2rem] transition-all ${isDark ? "rotate-0 scale-100" : "rotate-90 scale-0"}`}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
