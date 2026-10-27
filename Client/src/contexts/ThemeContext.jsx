import { createContext, useContext, useEffect, useState } from "react"

const ThemeContext = createContext(null)

const STORAGE_KEY = "algoarena-theme"

const getInitialTheme = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === "light" || stored === "dark") return stored
    if (
      window.matchMedia &&
      typeof window.matchMedia("(prefers-color-scheme: dark)").matches === true
    ) {
      return "dark"
    }
  } catch {
    // localStorage can throw in private mode; fall back to light
  }
  return "light"
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle("dark", theme === "dark")
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // ignore persistence failures (Safari private mode)
    }
  }, [theme])

  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"))

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
