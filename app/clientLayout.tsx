"use client"

import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import Sidebar from "@/components/sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const inter = Inter({ subsets: ["latin"] })

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const router = useRouter()
  const isLoginPage = pathname === "/login"
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    // Verificar se o usuário está autenticado
    const checkAuth = () => {
      // Verificar se existe usuário no localStorage
      const storedUser = localStorage.getItem("user")

      if (storedUser) {
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
        if (!isLoginPage) {
          router.push("/login")
        }
      }
    }

    checkAuth()
  }, [router, isLoginPage])

  // Layout específico para a página de login
  if (isLoginPage) {
    return (
      <html lang="pt-BR">
        <body className={inter.className}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </body>
      </html>
    )
  }

  // Mostrar nada enquanto verifica autenticação
  if (isAuthenticated === null) {
    return (
      <html lang="pt-BR">
        <body className={inter.className}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <div className="flex h-screen items-center justify-center bg-background">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-carplus"></div>
            </div>
          </ThemeProvider>
        </body>
      </html>
    )
  }

  // Layout padrão para as demais páginas (quando autenticado)
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
              <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted/40">{children}</main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
