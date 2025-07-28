import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { createHash } from "crypto"

// Função para criar hash da senha usando SHA-256
// Você deve substituir esta função pelo algoritmo de hash específico usado no seu sistema
const hashPassword = (password: string): string => {
  return createHash("sha256").update(password).digest("hex")
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 })
    }

    // Buscar o usuário pelo email
    const { data: user, error: queryError } = await supabase
      .from("usuarios")
      .select("id, nome, email, tipo, foto, senha, sobrenome")
      .eq("email", email)
      .single()

    if (queryError || !user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Verificar se o usuário é admin
    if (user.tipo !== "admin") {
      return NextResponse.json({ error: "Acesso restrito a administradores" }, { status: 403 })
    }

    // Criar hash da senha fornecida pelo usuário
    const hashedPassword = hashPassword(password)

    // Verificar se o hash da senha corresponde ao hash armazenado no banco
    const isPasswordValid = user.senha === hashedPassword

    // Tentativa alternativa: verificar se a senha em texto puro corresponde
    // Isso é apenas para compatibilidade durante a transição para senhas com hash
    const isPlainPasswordValid = user.senha === password

    if (!isPasswordValid && !isPlainPasswordValid) {
      return NextResponse.json({ error: "Email ou senha incorretos" }, { status: 401 })
    }

    // Remover a senha do objeto de usuário antes de retornar
    const { senha, ...userWithoutPassword } = user

    return NextResponse.json({
      user: userWithoutPassword,
      message: "Login bem-sucedido",
    })
  } catch (error) {
    console.error("Erro no login:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
