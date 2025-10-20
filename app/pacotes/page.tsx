"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, ChevronLeft, ChevronRight, Package, Search } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { PacoteDetailsDialog } from "@/components/pacotes/pacote-details-dialog"

// Tipo para os pacotes
interface Pacote {
  id: number
  nome: string
  preco_cpf: number | null
  preco_cnpj: number | null
  vendas: number
  cor?: string
  imagem?: string
}

export default function Pacotes() {
  const [pacotes, setPacotes] = useState<Pacote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPacoteId, setSelectedPacoteId] = useState<number | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const { toast } = useToast()

  // Função para buscar pacotes do Supabase
  const fetchPacotes = async () => {
    try {
      setIsLoading(true)

      // Buscar todos os pacotes
      const { data: pacotesData, error: pacotesError } = await supabase
        .from("pacotes")
        .select("id, descricao, preco_cpf, preco_cnpj, cor, imagem")
        .order("descricao")

      if (pacotesError) {
        throw pacotesError
      }

      if (!pacotesData) {
        setPacotes([])
        return
      }

      // Buscar vendas de cada pacote
      const { data: vendasData, error: vendasError } = await supabase.from("pedido_itens").select("pacote_id, qtd")

      if (vendasError) {
        throw vendasError
      }

      // Calcular total de vendas por pacote
      const vendasPorPacote = new Map<number, number>()

      if (vendasData) {
        vendasData.forEach((item) => {
          const pacoteId = item.pacote_id
          const quantidade = item.qtd || 0

          if (vendasPorPacote.has(pacoteId)) {
            vendasPorPacote.set(pacoteId, vendasPorPacote.get(pacoteId)! + quantidade)
          } else {
            vendasPorPacote.set(pacoteId, quantidade)
          }
        })
      }

      // Filtrar para obter apenas nomes distintos e adicionar vendas
      const uniqueNames = new Map<string, Pacote>()

      pacotesData.forEach((pacote) => {
        if (!uniqueNames.has(pacote.descricao)) {
          uniqueNames.set(pacote.descricao, {
            ...pacote,
            nome: pacote.descricao, // Mapeando descricao para nome para manter compatibilidade
            vendas: vendasPorPacote.get(pacote.id) || 0,
          })
        }
      })

      // Converter o Map para array
      const uniquePacotes = Array.from(uniqueNames.values())
      setPacotes(uniquePacotes)
    } catch (error) {
      console.error("Erro ao buscar pacotes:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os pacotes.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Buscar pacotes ao carregar a página
  useEffect(() => {
    fetchPacotes()
  }, [])

  // Filtrar pacotes com base no termo de busca
  const filteredPacotes = pacotes.filter((pacote) => 
    (pacote.nome || pacote.descricao || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Função para abrir o modal de detalhes
  const handleOpenDetails = (pacoteId: number) => {
    setSelectedPacoteId(pacoteId)
    setIsDetailsOpen(true)
  }

  // Função para fechar o modal de detalhes
  const handleCloseDetails = () => {
    setIsDetailsOpen(false)
    setSelectedPacoteId(null)
  }

  // Função para atualizar a lista após edição
  const handlePacoteUpdated = () => {
    fetchPacotes()
  }

  // Função para formatar o preço
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
          <h1 className="text-3xl font-bold tracking-tight">Pacotes</h1>
          <p className="text-muted-foreground">Visualize detalhes e modifique preços dos pacotes disponíveis</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Lista de Pacotes</CardTitle>
          <CardDescription>
            {isLoading ? "Carregando pacotes..." : `Total de ${filteredPacotes.length} pacotes cadastrados`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar pelo nome do pacote..."
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
                  <TableHead className="w-[60px]">Cor</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Vendas</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Carregando pacotes...
                    </TableCell>
                  </TableRow>
                ) : filteredPacotes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Nenhum pacote encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPacotes.map((pacote) => (
                    <TableRow key={pacote.id}>
                      <TableCell className="w-[60px]">
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-full mx-auto"
                          style={{ backgroundColor: pacote.cor ? pacote.cor : "#f0f0f0" }}
                        >
                          <Package className="h-5 w-5 text-white" />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{pacote.nome}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-muted-foreground">CPF: {formatarPreco(pacote.preco_cpf)}</span>
                          <span className="text-xs text-muted-foreground">CNPJ: {formatarPreco(pacote.preco_cnpj)}</span>
                        </div>
                      </TableCell>
                      <TableCell>{pacote.vendas || 0}</TableCell>
                      <TableCell className="text-right">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => handleOpenDetails(pacote.id)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Ver detalhes e especificações</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-end space-x-2 py-4">
            <Button variant="outline" size="sm" disabled={isLoading}>
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button variant="outline" size="sm" disabled={isLoading}>
              Próximo
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal de detalhes do pacote */}
      <PacoteDetailsDialog
        pacoteId={selectedPacoteId}
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
        onUpdate={handlePacoteUpdated}
      />
    </div>
  )
}
