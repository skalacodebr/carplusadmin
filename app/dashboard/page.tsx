"use client"

// Add imports for useState and useEffect
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, MapPin, Package, ShoppingCart, Store, Users } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

// Define the interface for revendedor data
interface Revendedor {
  id: number
  nome: string
  loja: string
  foto: string | null
  created_at: string
}

interface CityRevendedores {
  cidade: string
  uf: string
  revendedores: {
    id: number
    nome: string
    loja: string
  }[]
}

export default function Dashboard() {
  // Add state for revendedores and loading
  const [revendedoresPorCidade, setRevendedoresPorCidade] = useState<CityRevendedores[]>([])
  const [isLoadingCities, setIsLoadingCities] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [totalRevendedores, setTotalRevendedores] = useState(0)
  const [newRevendedoresThisMonth, setNewRevendedoresThisMonth] = useState(0)
  const [totalSales, setTotalSales] = useState(0)
  const [packagesSold, setPackagesSold] = useState(0)
  const [previousMonthSales, setPreviousMonthSales] = useState(0)
  const [salesPercentageChange, setSalesPercentageChange] = useState<number | null>(null)
  const [previousMonthPackages, setPreviousMonthPackages] = useState(0)
  const [packagesPercentageChange, setPackagesPercentageChange] = useState<number | null>(null)

  // Fetch revendedores on component mount
  useEffect(() => {
    async function fetchRevendedoresPorCidade() {
      try {
        setIsLoadingCities(true)

        // Query to get all revendedores with their city information
        const { data, error } = await supabase
          .from("usuarios")
          .select(`
            id,
            nome,
            cidade,
            uf,
            revendedores!inner(
              loja
            )
          `)
          .eq("tipo", "revendedor")
          .order("cidade")

        if (error) {
          console.error("Error fetching revendedores by city:", error)
          return
        }

        // Group revendedores by city
        const cityMap = new Map<string, CityRevendedores>()

        data.forEach((item) => {
          const cityKey = `${item.cidade}-${item.uf}`

          if (!cityMap.has(cityKey)) {
            cityMap.set(cityKey, {
              cidade: item.cidade || "Cidade não informada",
              uf: item.uf || "",
              revendedores: [],
            })
          }

          cityMap.get(cityKey)?.revendedores.push({
            id: item.id,
            nome: item.nome,
            loja: item.revendedores[0]?.loja || "Sem nome",
          })
        })

        // Convert map to array and sort by city name
        const citiesArray = Array.from(cityMap.values()).sort((a, b) => a.cidade.localeCompare(b.cidade))

        setRevendedoresPorCidade(citiesArray)

        // Get total count of revendedores
        const { count: totalCount, error: countError } = await supabase
          .from("usuarios")
          .select("id", { count: "exact" })
          .eq("tipo", "revendedor")

        if (!countError && totalCount !== null) {
          setTotalRevendedores(totalCount)
        }

        // Get count of new revendedores this month
        const currentDate = new Date()
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString()

        const { count: newCount, error: newCountError } = await supabase
          .from("usuarios")
          .select("id", { count: "exact" })
          .eq("tipo", "revendedor")
          .gte("created_at", firstDayOfMonth)

        if (!newCountError && newCount !== null) {
          setNewRevendedoresThisMonth(newCount)
        }

        // Fetch sales data
        await fetchSalesData()
      } catch (error) {
        console.error("Error in fetchRevendedoresPorCidade:", error)
      } finally {
        setIsLoadingCities(false)
        setIsLoading(false)
      }
    }

    async function fetchSalesData() {
      try {
        // Get current date
        const now = new Date()

        // Calculate first day of current month
        const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

        // Calculate first day of previous month
        const firstDayPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()

        // Calculate last day of previous month
        const lastDayPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString()

        // Get total sales from pedidos table (all time)
        const { data: salesData, error: salesError } = await supabase.from("pedidos").select("valor_total")

        if (salesError) {
          console.error("Error fetching sales data:", salesError)
          return
        }

        // Calculate total sales
        const total = salesData.reduce((sum, order) => sum + (order.valor_total || 0), 0)
        setTotalSales(total)

        // Get current month sales
        const { data: currentMonthData, error: currentMonthError } = await supabase
          .from("pedidos")
          .select("valor_total")
          .gte("created_at", firstDayCurrentMonth)

        if (currentMonthError) {
          console.error("Error fetching current month sales:", currentMonthError)
          return
        }

        // Get previous month sales
        const { data: previousMonthData, error: previousMonthError } = await supabase
          .from("pedidos")
          .select("valor_total")
          .gte("created_at", firstDayPreviousMonth)
          .lt("created_at", firstDayCurrentMonth)

        if (previousMonthError) {
          console.error("Error fetching previous month sales:", previousMonthError)
          return
        }

        // Calculate current month total
        const currentMonthTotal = currentMonthData.reduce((sum, order) => sum + (order.valor_total || 0), 0)

        // Calculate previous month total
        const previousMonthTotal = previousMonthData.reduce((sum, order) => sum + (order.valor_total || 0), 0)
        setPreviousMonthSales(previousMonthTotal)

        // Calculate percentage change
        if (previousMonthTotal > 0) {
          const percentageChange = ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100
          setSalesPercentageChange(percentageChange)
        } else {
          setSalesPercentageChange(currentMonthTotal > 0 ? 100 : 0)
        }

        // Get current month packages - using a join with pedidos table
        const { data: currentMonthPackages, error: currentMonthPackagesError } = await supabase
          .from("pedido_itens")
          .select("qtd, pedidos!inner(created_at)")
          .gte("pedidos.created_at", firstDayCurrentMonth)

        if (currentMonthPackagesError) {
          console.error("Error fetching current month packages:", currentMonthPackagesError)
          return
        }

        // Get previous month packages - using a join with pedidos table
        const { data: previousMonthPackages, error: previousMonthPackagesError } = await supabase
          .from("pedido_itens")
          .select("qtd, pedidos!inner(created_at)")
          .gte("pedidos.created_at", firstDayPreviousMonth)
          .lt("pedidos.created_at", firstDayCurrentMonth)

        if (previousMonthPackagesError) {
          console.error("Error fetching previous month packages:", previousMonthPackagesError)
          return
        }

        // Calculate current month packages
        const currentMonthPackagesTotal = currentMonthPackages.reduce((sum, item) => sum + (item.qtd || 0), 0)

        // Calculate previous month packages
        const previousMonthPackagesTotal = previousMonthPackages.reduce((sum, item) => sum + (item.qtd || 0), 0)
        setPreviousMonthPackages(previousMonthPackagesTotal)

        // Calculate percentage change for packages
        if (previousMonthPackagesTotal > 0) {
          const packagesChange =
            ((currentMonthPackagesTotal - previousMonthPackagesTotal) / previousMonthPackagesTotal) * 100
          setPackagesPercentageChange(packagesChange)
        } else {
          setPackagesPercentageChange(currentMonthPackagesTotal > 0 ? 100 : 0)
        }

        // Get total packages sold from pedido_itens table
        const { data: packagesData, error: packagesError } = await supabase.from("pedido_itens").select("qtd")

        if (packagesError) {
          console.error("Error fetching packages data:", packagesError)
          return
        }

        // Calculate total packages sold
        const totalPackages = packagesData.reduce((sum, item) => sum + (item.qtd || 0), 0)
        setPackagesSold(totalPackages)
      } catch (error) {
        console.error("Error in fetchSalesData:", error)
      }
    }

    fetchRevendedoresPorCidade()
  }, [])

  // Helper function to format the time since creation
  const getTimeSince = (dateString: string) => {
    const created = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 24) {
      return `${diffInHours} hora${diffInHours !== 1 ? "s" : ""}`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays} dia${diffInDays !== 1 ? "s" : ""}`
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Bem-vindo ao painel administrativo da Car+</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Totais</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                `R$ ${totalSales.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? (
                <span className="inline-block w-16 h-3 bg-muted animate-pulse rounded"></span>
              ) : salesPercentageChange === null ? (
                "Sem dados do mês anterior"
              ) : (
                `${salesPercentageChange > 0 ? "+" : ""}${salesPercentageChange.toFixed(1)}% em relação ao mês anterior`
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revendedores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : `+${totalRevendedores}`}
            </div>
            <p className="text-xs text-muted-foreground">+{newRevendedoresThisMonth} novos este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacotes Vendidos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : packagesSold}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? (
                <span className="inline-block w-16 h-3 bg-muted animate-pulse rounded"></span>
              ) : packagesPercentageChange === null ? (
                "Sem dados do mês anterior"
              ) : (
                `${packagesPercentageChange > 0 ? "+" : ""}${packagesPercentageChange.toFixed(1)}% em relação ao mês anterior`
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Revendedores por Cidade</CardTitle>
                  <CardDescription>Distribuição geográfica dos pontos de revenda</CardDescription>
                </div>
                <Button variant="link" size="sm" asChild>
                  <Link href="/revendedores">Ver todos</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingCities ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : revendedoresPorCidade.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">Nenhum revendedor encontrado</div>
              ) : (
                <div className="space-y-4">
                  {revendedoresPorCidade.map((cidade) => (
                    <div key={`${cidade.cidade}-${cidade.uf}`} className="border rounded-md p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-carplus" />
                          <h3 className="font-medium">
                            {cidade.cidade}
                            {cidade.uf ? `, ${cidade.uf}` : ""}
                          </h3>
                        </div>
                        <Badge variant="outline">
                          {cidade.revendedores.length} revendedor{cidade.revendedores.length !== 1 ? "es" : ""}
                        </Badge>
                      </div>
                      <div className="pl-6">
                        {cidade.revendedores.slice(0, 3).map((revendedor) => (
                          <div key={revendedor.id} className="text-sm py-0.5 flex items-center">
                            <Store className="h-3 w-3 mr-1.5 text-muted-foreground" />
                            <span>{revendedor.loja}</span>
                          </div>
                        ))}
                        {cidade.revendedores.length > 3 && (
                          <div className="text-xs text-muted-foreground mt-1">
                            + {cidade.revendedores.length - 3} outros revendedores
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
