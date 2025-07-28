import { NextResponse } from "next/server"
import { hashPassword } from "@/lib/auth"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const password = searchParams.get("password")

  if (!password) {
    return NextResponse.json({ error: "Password parameter is required" }, { status: 400 })
  }

  const hash = hashPassword(password)

  return NextResponse.json({
    password,
    hash,
    knownHash: password === "admin123" ? "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9" : null,
    matches:
      password === "admin123" ? hash === "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9" : null,
  })
}
