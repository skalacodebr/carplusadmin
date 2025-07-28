"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Plus, Search, Store, Loader2, Eye, Lock, Unlock } from "lucide-react"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { NewRevendedorModal } from "@/components/new-revendedor-modal"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Tipo para revendedor
interface Revendedor {
  id: number
  nome: string
  email: string
  telefone: string
  cidade: string
  estado: string
  status: string
  vendas: number
  loja: string
  foto?: string
  isActive: boolean
}

// Tipo para operação pendente
interface PendingOperation {
  id: number
  type: "toggle-status"
  newValue: boolean
}

export default function Revendedores() {
  const [revendedores, setRevendedores] = useState<Revendedor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newRevendedorModalOpen, setNewRevendedorModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [pendingOperations, setPendingOperations] = useState<PendingOperation[]>([])
  const [processingIds, setProcessingIds] = useState<number[]>([])

  // Estado para o diálogo de confirmação
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedRevendedor, setSelectedRevendedor] = useState<Revendedor | null>(null)

  // Função para carregar revendedores do Supabase
  const loadRevendedores = async () => {
    setIsLoading(true)
    try {
      // Consulta que une as tabelas usuarios e revendedores
      const { data, error } = await supabase
        .from("usuarios")
        .select(`
          id, 
          nome, 
          email, 
          telefone, 
          cidade, 
          uf, 
          tipo,
          foto,
          revendedores!inner(id, vendas, loja, status)
        `)
        .eq("tipo", "revendedor")
        .order("id", { ascending: false })

      if (error) {
        console.error("Erro ao carregar revendedores:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os revendedores",
          variant: "destructive",
        })
        return
      }

      // Transformar os dados para o formato esperado pelo componente
      const formattedData = data.map((item: any) => ({
        id: item.id,
        nome: item.nome,
        email: item.email,
        telefone: item.telefone || "",
        cidade: item.cidade || "",
        estado: item.uf || "",
        status: item.tipo === "revendedor" ? "ativo" : "pendente",
        vendas: item.revendedores[0]?.vendas || 0,
        loja: item.revendedores[0]?.loja || "Sem nome",
        foto: item.foto || null,
        isActive: item.revendedores[0]?.status !== false, // Convertendo para boolean (null ou undefined serão true)
      }))

      setRevendedores(formattedData)
    } catch (error) {
      console.error("Erro ao processar revendedores:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Carregar revendedores ao montar o componente
  useEffect(() => {
    loadRevendedores()
  }, [])

  // Processar operações pendentes
  useEffect(() => {
    const processOperations = async () => {
      // Se não há operações pendentes ou já está processando, não faz nada
      if (pendingOperations.length === 0) return

      // Pega a primeira operação da fila
      const operation = pendingOperations[0]

      // Marca o ID como em processamento
      setProcessingIds((prev) => [...prev, operation.id])

      try {
        if (operation.type === "toggle-status") {
          // Atualizar no banco de dados
          const { error } = await supabase
            .from("revendedores")
            .update({ status: operation.newValue })
            .eq("usuario_id", operation.id)

          if (error) {
            console.error("Erro ao atualizar status:", error)

            // Reverte a alteração local
            setRevendedores((prev) =>
              prev.map((r) => (r.id === operation.id ? { ...r, isActive: !operation.newValue } : r)),
            )

            toast({
              title: "Erro",
              description: "Não foi possível atualizar o status do revendedor",
              variant: "destructive",
            })
          } else {
            // Notificar sucesso
            toast({
              title: operation.newValue ? "Revendedor ativado" : "Revendedor desativado",
              description: operation.newValue
                ? "O revendedor foi ativado com sucesso"
                : "O revendedor foi desativado com sucesso",
            })
          }
        }
      } catch (error) {
        console.error("Erro ao processar operação:", error)

        // Reverte a alteração local em caso de erro
        if (operation.type === "toggle-status") {
          setRevendedores((prev) =>
            prev.map((r) => (r.id === operation.id ? { ...r, isActive: !operation.newValue } : r)),
          )
        }

        toast({
          title: "Erro",
          description: "Ocorreu um erro ao processar a operação",
          variant: "destructive",
        })
      } finally {
        // Remove a operação da fila e o ID da lista de processamento
        setPendingOperations((prev) => prev.slice(1))
        setProcessingIds((prev) => prev.filter((id) => id !== operation.id))
      }
    }

    processOperations()
  }, [pendingOperations])

  // Função para alternar o status de um revendedor
  const toggleRevendedorStatus = (revendedor: Revendedor) => {
    const newStatus = !revendedor.isActive

    // Atualizar o estado localmente primeiro (optimistic update)
    setRevendedores((prev) => prev.map((r) => (r.id === revendedor.id ? { ...r, isActive: newStatus } : r)))

    // Adicionar à fila de operações pendentes
    setPendingOperations((prev) => [
      ...prev,
      {
        id: revendedor.id,
        type: "toggle-status",
        newValue: newStatus,
      },
    ])

    // Fechar o diálogo
    setDialogOpen(false)
    setSelectedRevendedor(null)
  }

  // Função para abrir o diálogo de confirmação
  const openStatusConfirmDialog = (revendedor: Revendedor) => {
    setSelectedRevendedor(revendedor)
    setDialogOpen(true)
  }

  // Filtrar revendedores com base no termo de busca
  const filteredRevendedores = revendedores.filter(
    (revendedor) =>
      revendedor.loja.toLowerCase().includes(searchTerm.toLowerCase()) ||
      revendedor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      revendedor.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Revendedores</h1>
          <p className="text-muted-foreground">Gerencie todos os revendedores da plataforma Car+</p>
        </div>
        <Button className="w-full md:w-auto" onClick={() => setNewRevendedorModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Revendedor
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Lista de Revendedores</CardTitle>
          <CardDescription>Total de {revendedores.length} revendedores cadastrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar pelo nome da loja"
                className="w-full pl-8 bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Revendedor</TableHead>
                  <TableHead className="hidden md:table-cell">Contato</TableHead>
                  <TableHead className="hidden md:table-cell">Localização</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Vendas</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-carplus"></div>
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">Carregando revendedores...</div>
                    </TableCell>
                  </TableRow>
                ) : filteredRevendedores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <div className="text-muted-foreground">
                        {searchTerm ? "Nenhum revendedor encontrado para esta busca" : "Nenhum revendedor cadastrado"}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRevendedores.map((revendedor) => (
                    <TableRow key={revendedor.id} className={!revendedor.isActive ? "opacity-70" : ""}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            {revendedor.foto ? (
                              <AvatarImage src={revendedor.foto || "/placeholder.svg"} alt={revendedor.loja} />
                            ) : (
                              <AvatarFallback className="bg-carplus/10 text-carplus">
                                {revendedor.loja
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .substring(0, 2)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <div className="font-medium flex items-center">
                              <Store className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                              {revendedor.loja}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div>{revendedor.email}</div>
                        <div className="text-sm text-muted-foreground">{revendedor.telefone}</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {revendedor.cidade}, {revendedor.estado}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={
                              revendedor.isActive ? "bg-green-500 hover:bg-green-600" : "bg-yellow-500 hover:bg-yellow-600"
                            }
                          >
                            {revendedor.isActive ? "Ativo" : "Inativo"}
                          </Badge>

                          {processingIds.includes(revendedor.id) && (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{revendedor.vendas}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-3">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  asChild
                                  disabled={processingIds.includes(revendedor.id)}
                                >
                                  <Link href={`/revendedores/${revendedor.id}`}>
                                    <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                  </Link>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Ver detalhes</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => openStatusConfirmDialog(revendedor)}
                                  disabled={processingIds.includes(revendedor.id)}
                                >
                                  {revendedor.isActive ? (
                                    <Lock className="h-4 w-4 text-muted-foreground hover:text-yellow-600" />
                                  ) : (
                                    <Unlock className="h-4 w-4 text-yellow-600 hover:text-yellow-700" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{revendedor.isActive ? "Desativar revendedor" : "Ativar revendedor"}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-end space-x-2 py-4">
            <Button variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button variant="outline" size="sm">
              Próximo
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal para cadastro de novo revendedor */}
      <NewRevendedorModal
        open={newRevendedorModalOpen}
        onOpenChange={setNewRevendedorModalOpen}
        onSuccess={loadRevendedores}
      />

      {/* Diálogo de confirmação para alteração de status */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedRevendedor?.isActive ? "Desativar revendedor?" : "Ativar revendedor?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedRevendedor?.isActive
                ? "Você está prestes a desativar este revendedor. Ele não poderá vender produtos até ser ativado novamente."
                : "Você está prestes a ativar este revendedor. Ele poderá voltar a vender produtos na plataforma."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedRevendedor && toggleRevendedorStatus(selectedRevendedor)}
              className={
                selectedRevendedor?.isActive ? "bg-yellow-500 hover:bg-yellow-600" : "bg-green-500 hover:bg-green-600"
              }
            >
              {selectedRevendedor?.isActive ? "Sim, desativar" : "Sim, ativar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
