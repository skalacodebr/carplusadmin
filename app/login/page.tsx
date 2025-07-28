"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { hashPassword } from "@/lib/auth"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Verificar se os campos estão preenchidos
      if (!email || !password) {
        setError("Preencha todos os campos")
        setIsLoading(false)
        return
      }

      // Gerar hash da senha
      const hashedPassword = await hashPassword(password)

      // Consultar a tabela de usuários para verificar as credenciais
      const { data: user, error: queryError } = await supabase
        .from("usuarios")
        .select("id, nome, email, tipo, foto, senha, sobrenome")
        .eq("email", email)
        .single()

      if (queryError || !user) {
        console.error("Erro ao buscar usuário:", queryError)
        setError("Usuário não encontrado")
        setIsLoading(false)
        return
      }

      // Verificar se o usuário é do tipo admin
      if (user.tipo !== "admin") {
        setError("Acesso restrito a administradores")
        setIsLoading(false)
        return
      }

      // Limpar o hash armazenado (remover espaços em branco, quebras de linha, etc.)
      const cleanStoredHash = user.senha.trim()

      // Verificar se o hash da senha corresponde ao hash armazenado
      if (cleanStoredHash === hashedPassword) {
        // Login bem-sucedido
        const { senha, ...userWithoutPassword } = user
        localStorage.setItem("user", JSON.stringify(userWithoutPassword))
        router.push("/dashboard")
        return
      }

      // Se chegou aqui, a senha está incorreta
      setError("Email ou senha incorretos")
    } catch (err) {
      console.error("Erro ao fazer login:", err)
      setError("Ocorreu um erro ao fazer login. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm bg-card border-border">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Image src="/images/logo-carplus.png" alt="Car+ Logo" width={150} height={50} className="object-contain" />
          </div>
          <CardTitle className="text-xl">Car+ Admin</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-carplus hover:bg-carplus-dark" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
