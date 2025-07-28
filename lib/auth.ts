// Função para criar hash da senha usando SHA-256 com Web Crypto API
export async function hashPassword(password: string): Promise<string> {
  // Converter a string para um array de bytes
  const encoder = new TextEncoder()
  const data = encoder.encode(password)

  // Criar o hash usando Web Crypto API
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)

  // Converter o buffer para string hexadecimal
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")

  return hashHex
}

// Verificar se a senha corresponde ao hash armazenado
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const hash = await hashPassword(password)
  // Limpar o hash armazenado (remover espaços em branco, quebras de linha, etc.)
  const cleanStoredHash = hashedPassword.trim()
  return hash === cleanStoredHash
}

// Mapeamento de senhas conhecidas para seus hashes SHA-256
export const KNOWN_PASSWORDS: Record<string, string> = {
  admin123: "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9",
}
