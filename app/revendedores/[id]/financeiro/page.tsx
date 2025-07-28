"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Download, Loader2, UserCheck } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { RepasseModal } from "@/components/financeiro/repasse-modal"

interface Pedido {
  id: number
  numero: string
  valor_total: number
  status: string
  status_detalhado: string
  repasse_status: string
  created_at: string
}

interface Revendedor {
  id: number
  nome: string
  loja: string
}

interface RepasseHistorico {
  id: number
  valor_total: number
  data_repasse: string
  metodo_pagamento: string
  observacoes: string
}

export default function RevendedorFinanceiroPage({ params }: { params: { id: string } }) {
  const [revendedor, setRevendedor] = useState<Revendedor | null>(null)
  const [pedidosPendentes, setPedidosPendentes] = useState<Pedido[]>([])
  const [historicoRepasses, setHistoricoRepasses] = useState<RepasseHistorico[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showRepasseModal, setShowRepasseModal] = useState(false)
  const [totalPendente, setTotalPendente] = useState(0)

  useEffect(() => {
    fetchRevendedorData()
  }, [params.id])

  async function fetchRevendedorData() {
    try {
      setIsLoading(true)
      const revendedorId = Number.parseInt(params.id)

      // Buscar dados do revendedor
      const { data: revendedorData, error: revendedorError } = await supabase
        .from("usuarios")
        .select(`
          id,
          nome,
          revendedores!inner (
            loja
          )
        `)
        .eq("id", revendedorId)
        .single()

      if (revendedorError) {
        console.error("Erro ao buscar revendedor:", revendedorError)
        return
      }

      setRevendedor({
        id: revendedorData.id,
        nome: revendedorData.nome,
        loja: revendedorData.revendedores[0]?.loja || "Sem nome",
      })

      // Buscar pedidos pendentes de repasse
      const { data: pedidos, error: pedidosError } = await supabase
        .from("pedidos")
        .select("id, numero, valor_total, status, status_detalhado, repasse_status, created_at")
        .eq("revendedor_id", revendedorId)
        .eq("repasse_status", "pendente")
        .eq("status", "pago")
        .in("status_detalhado", ["entregue", "retirado"])
        .order("created_at", { ascending: false })

      if (pedidosError) {
        console.error("Erro ao buscar pedidos:", pedidosError)
        return
      }

      setPedidosPendentes(pedidos)

      // Calcular total pendente
      const total = pedidos.reduce((sum, pedido) => {
        // Revendedor recebe 100% do valor total
        const valorRepasse = pedido.valor_total
        return sum + valorRepasse
      }, 0)

      setTotalPendente(total)

      // Buscar histórico de repasses
      const { data: repasses, error: repassesError } = await supabase
        .from("repasses")
        .select("id, valor_total, data_repasse, metodo_pagamento, observacoes")
        .eq("revendedor_id", revendedorId)
        .order("data_repasse", { ascending: false })

      if (repassesError) {
        console.error("Erro ao buscar histórico de repasses:", repassesError)
        return
      }

      setHistoricoRepasses(repasses)
    } catch (error) {
      console.error("Erro ao processar dados do revendedor:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRepasseComplete = () => {
    setShowRepasseModal(false)
    fetchRevendedorData() // Atualizar os dados após um repasse
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!revendedor) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold">Revendedor não encontrado</h2>
        <p className="text-muted-foreground">O revendedor solicitado não existe ou foi removido.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{revendedor.loja}</h1>
          <p className="text-muted-foreground">{revendedor.nome} - Financeiro</p>
        </div>
        {pedidosPendentes.length > 0 && (
          <Button onClick={() => setShowRepasseModal(true)}>
            <UserCheck className="h-4 w-4 mr-2" />
            Realizar Repasse
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Pendente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {totalPendente.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {pedidosPendentes.length} pedido{pedidosPendentes.length !== 1 ? "s" : ""} pendente
              {pedidosPendentes.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Repassado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R${" "}
              {historicoRepasses
                .reduce((sum, repasse) => sum + repasse.valor_total, 0)
                .toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {historicoRepasses.length} repasse{historicoRepasses.length !== 1 ? "s" : ""} realizado
              {historicoRepasses.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Último Repasse</CardTitle>
          </CardHeader>
          <CardContent>
            {historicoRepasses.length > 0 ? (
              <>
                <div className="text-2xl font-bold">
                  R$ {historicoRepasses[0].valor_total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(historicoRepasses[0].data_repasse).toLocaleDateString("pt-BR")}
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">R$ 0,00</div>
                <p className="text-xs text-muted-foreground">Nenhum repasse realizado</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pendentes" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="pendentes">Pedidos Pendentes</TabsTrigger>
            <TabsTrigger value="historico">Histórico de Repasses</TabsTrigger>
          </TabsList>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>

        <TabsContent value="pendentes">
          <Card>
            <CardHeader>
              <CardTitle>Pedidos Pendentes de Repasse</CardTitle>
              <CardDescription>Pedidos entregues aguardando repasse financeiro</CardDescription>
            </CardHeader>
            <CardContent>
              {pedidosPendentes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Não há pedidos pendentes de repasse</div>
              ) : (
                <div className="space-y-4">
                  {pedidosPendentes.map((pedido) => (
                    <div key={pedido.id} className="border rounded-md p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-medium">Pedido #{pedido.numero}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(pedido.created_at).toLocaleDateString("pt-BR")} • {pedido.status_detalhado}
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          Repasse Pendente
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div>
                          <div className="flex items-center">
                            <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                            <span className="font-semibold">
                              R$ {pedido.valor_total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Valor total: R$ {pedido.valor_total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Ver Pedido
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historico">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Repasses</CardTitle>
              <CardDescription>Registro de todos os repasses realizados para este revendedor</CardDescription>
            </CardHeader>
            <CardContent>
              {historicoRepasses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Nenhum repasse realizado até o momento</div>
              ) : (
                <div className="space-y-4">
                  {historicoRepasses.map((repasse) => (
                    <div key={repasse.id} className="border rounded-md p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-medium">Repasse #{repasse.id}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(repasse.data_repasse).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Repasse Concluído
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div>
                          <div className="flex items-center">
                            <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                            <span className="font-semibold">
                              R$ {repasse.valor_total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Método: {repasse.metodo_pagamento}</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Ver Detalhes
                        </Button>
                      </div>
                      {repasse.observacoes && (
                        <div className="mt-3 text-sm text-muted-foreground">
                          <p className="font-medium text-xs">Observações:</p>
                          <p>{repasse.observacoes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {showRepasseModal && (
        <RepasseModal
          revendedor={{
            id: revendedor.id,
            nome: revendedor.nome,
            loja: revendedor.loja,
            total_pendente: totalPendente,
            qtd_pedidos_pendentes: pedidosPendentes.length,
          }}
          onClose={() => setShowRepasseModal(false)}
          onComplete={handleRepasseComplete}
        />
      )}
    </div>
  )
}
