"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Package, Plus, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import { DeletePacoteDialog } from "@/components/pacotes/delete-pacote-dialog"
import { AddCombinacaoModal } from "@/components/pacotes/add-combinacao-modal"
import { NewPacoteModal } from "@/components/pacotes/new-pacote-modal"

interface Pacote {
  id: number
  descricao: string
  preco: number | null
  cor: string | null
  tamanho_nome: string
  altura_valor: string
  largura_valor: string
}

interface PacoteAgrupado {
  descricao: string
  preco: number | null
  cor: string | null
  combinacoes: {
    id: number
    tamanho_nome: string
    altura_valor: string
    largura_valor: string
  }[]
}

export default function GerenciarPacotes() {
  const router = useRouter()
  const [pacotesAgrupados, setPacotesAgrupados] = useState<PacoteAgrupado[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [paginationState, setPaginationState] = useState<Record<string, number>>({})
  const [selectedPacote, setSelectedPacote] = useState<{ id: number; descricao: string } | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isAddCombinacaoOpen, setIsAddCombinacaoOpen] = useState(false)
  const [selectedPacoteForCombinacao, setSelectedPacoteForCombinacao] = useState<{
    descricao: string
    preco: number | null
    cor: string | null
  } | null>(null)
  const [isNewPacoteOpen, setIsNewPacoteOpen] = useState(false)

  const ITEMS_PER_PAGE = 10

  useEffect(() => {
    fetchPacotes()
  }, [])

  const fetchPacotes = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("pacotes")
        .select(
          `
          id,
          descricao,
          preco,
          cor,
          larguras!inner(
            valor,
            alturas!inner(
              valor,
              tamanhos!inner(
                nome
              )
            )
          )
        `,
        )
        .order("descricao")

      if (error) throw error

      // Transformar os dados para o formato desejado
      const pacotes: Pacote[] = data.map((item) => ({
        id: item.id,
        descricao: item.descricao,
        preco: item.preco,
        cor: item.cor,
        tamanho_nome: item.larguras.alturas.tamanhos.nome,
        altura_valor: item.larguras.alturas.valor,
        largura_valor: item.larguras.valor,
      }))

      // Agrupar por nome
      const pacotesMap = new Map<string, PacoteAgrupado>()

      pacotes.forEach((pacote) => {
        if (!pacotesMap.has(pacote.descricao)) {
          pacotesMap.set(pacote.descricao, {
            descricao: pacote.descricao,
            preco: pacote.preco,
            cor: pacote.cor,
            combinacoes: [],
          })
        }

        pacotesMap.get(pacote.descricao)!.combinacoes.push({
          id: pacote.id,
          tamanho_nome: pacote.tamanho_nome,
          altura_valor: pacote.altura_valor,
          largura_valor: pacote.largura_valor,
        })
      })

      const pacotesAgrupadosArray = Array.from(pacotesMap.values())

      // Inicializar o estado de paginação
      const initialPaginationState: Record<string, number> = {}
      pacotesAgrupadosArray.forEach((pacote) => {
        initialPaginationState[pacote.descricao] = 1
      })

      setPaginationState(initialPaginationState)
      setPacotesAgrupados(pacotesAgrupadosArray)
    } catch (error: any) {
      console.error("Erro ao buscar pacotes:", error)
      toast({
        title: "Erro ao buscar pacotes",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleNextPage = (pacoteNome: string) => {
    setPaginationState((prev) => ({
      ...prev,
      [pacoteNome]: (prev[pacoteNome] || 1) + 1,
    }))
  }

  const handlePrevPage = (pacoteNome: string) => {
    setPaginationState((prev) => ({
      ...prev,
      [pacoteNome]: Math.max((prev[pacoteNome] || 1) - 1, 1),
    }))
  }

  const getTotalPages = (combinacoes: any[]) => {
    return Math.ceil(combinacoes.length / ITEMS_PER_PAGE)
  }

  const getPaginatedCombinations = (combinacoes: any[], pacoteNome: string) => {
    const currentPage = paginationState[pacoteNome] || 1
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return combinacoes.slice(startIndex, endIndex)
  }

  const handleDeleteClick = (id: number, descricao: string) => {
    setSelectedPacote({ id, descricao })
    setIsDeleteDialogOpen(true)
  }

  const handleAddCombinacaoClick = (pacote: PacoteAgrupado) => {
    setSelectedPacoteForCombinacao({
      descricao: pacote.descricao,
      preco: pacote.preco,
      cor: pacote.cor,
    })
    setIsAddCombinacaoOpen(true)
  }

  const handleOpenNewPacote = () => {
    setIsNewPacoteOpen(true)
  }

  const filteredPacotes = pacotesAgrupados

  const formatarPreco = (preco: number | null): string => {
    if (preco === null || preco === undefined) {
      return "R$ 0,00"
    }

    return preco.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciar Pacotes</h1>
          <p className="text-muted-foreground">Gerencie as combinações de tamanho, altura e largura para cada pacote</p>
        </div>
        <Button className="w-full md:w-auto" onClick={handleOpenNewPacote}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Pacote
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-carplus"></div>
          <span className="ml-2">Carregando pacotes...</span>
        </div>
      ) : filteredPacotes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Nenhum pacote encontrado</p>
            <p className="text-muted-foreground">{"Crie um novo pacote para começar"}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredPacotes.map((pacote) => (
            <Card key={pacote.descricao} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full"
                      style={{ backgroundColor: pacote.cor || "#f0f0f0" }}
                    >
                      <Package className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle>{pacote.descricao}</CardTitle>
                      <CardDescription>
                        Preço: {formatarPreco(pacote.preco)} • {pacote.combinacoes.length} combinações
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleAddCombinacaoClick(pacote)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Combinação
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tamanho</TableHead>
                        <TableHead>Altura</TableHead>
                        <TableHead>Largura</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getPaginatedCombinations(pacote.combinacoes, pacote.descricao).map((combinacao) => (
                        <TableRow key={combinacao.id}>
                          <TableCell>
                            <Badge variant="outline">{combinacao.tamanho_nome}</Badge>
                          </TableCell>
                          <TableCell>{combinacao.altura_valor}</TableCell>
                          <TableCell>{combinacao.largura_valor}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                              onClick={() => handleDeleteClick(combinacao.id, pacote.descricao)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              {getTotalPages(pacote.combinacoes) > 1 && (
                <CardFooter className="flex items-center justify-between py-4">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {((paginationState[pacote.descricao] || 1) - 1) * ITEMS_PER_PAGE + 1}-
                    {Math.min((paginationState[pacote.descricao] || 1) * ITEMS_PER_PAGE, pacote.combinacoes.length)} de{" "}
                    {pacote.combinacoes.length}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePrevPage(pacote.descricao)}
                      disabled={(paginationState[pacote.descricao] || 1) <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleNextPage(pacote.descricao)}
                      disabled={(paginationState[pacote.descricao] || 1) >= getTotalPages(pacote.combinacoes)}
                    >
                      Próximo
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}

      {selectedPacote && (
        <DeletePacoteDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          pacote={selectedPacote}
          onDeleted={fetchPacotes}
        />
      )}

      {selectedPacoteForCombinacao && (
        <AddCombinacaoModal
          open={isAddCombinacaoOpen}
          onOpenChange={setIsAddCombinacaoOpen}
          pacote={selectedPacoteForCombinacao}
          onCombinacaoAdded={fetchPacotes}
        />
      )}

      <NewPacoteModal isOpen={isNewPacoteOpen} onClose={() => setIsNewPacoteOpen(false)} onSuccess={fetchPacotes} />
    </div>
  )
}
