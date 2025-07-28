import type React from "react"
import ClientLayout from "./clientLayout"
import './globals.css'

export const metadata = {
  generator: 'v0.dev'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <ClientLayout>{children}</ClientLayout>
}
