"use client"

import { DollarSign, Home, Package, Settings, Users } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Revendedores",
    href: "/revendedores",
    icon: Users,
  },
  {
    title: "Pacotes",
    href: "/pacotes",
    icon: Package,
  },
  {
    title: "Financeiro",
    href: "/financeiro",
    icon: DollarSign,
  },
  {
    title: "Gerenciar",
    href: "/gerenciar",
    icon: Settings,
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col w-64 bg-card border-r border-border h-screen">
      <div className="px-4 py-6 flex justify-center items-center border-b border-border">
        <img src="/images/logo-carplus.png" alt="Car Plus Logo" className="h-8 w-auto" />
      </div>
      <nav className="flex-1 px-4 py-6">
        <ul>
          {navItems.map((item) => (
            <li key={item.title} className="mb-2">
              <Link 
                href={item.href} 
                className={`flex items-center px-4 py-2 text-foreground rounded-md hover:bg-accent transition-colors ${
                  pathname === item.href ? 'bg-accent text-accent-foreground' : ''
                }`}
              >
                <item.icon className="w-5 h-5 mr-2" />
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
