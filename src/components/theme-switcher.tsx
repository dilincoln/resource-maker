"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeSwitcher() {
  const { setTheme, theme } = useTheme()

  return (
    <Button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      size="icon"
      variant="ghost"
    >
      {theme === "light" ? (
        <Sun className="size-4 dark:hidden dark:size-0" />
      ) : (
        <Moon className="hidden size-0 dark:flex dark:size-4" />
      )}
      <span className="sr-only">Alternar</span>
    </Button>
  )
}
