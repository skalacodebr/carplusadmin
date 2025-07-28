"use client"

import { useState, useEffect, type ChangeEvent } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"
import { Loader2, Package, Save, Edit, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ColorSelect } from "@/components/ui/color-select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PacoteDetailsDialogProps {
  pacoteId: number | null
  isOpen: boolean
  onClose: () => void
  onUpdate?: () => void
}

interface PacoteDetail {
  pacote: {
    id: number
    descricao: string
    preco: number | null
    qtd_esferas: number
    cor: string
  }
  largura: {
    id: number
    valor: number
  }
  altura: {
    id: number
    valor: number
  }
  tamanho: {
    id: number
    nome: string
  }
}

// Função para formatar o valor como dinheiro
const formatarDinheiro = (valor: string): string => {
  // Remover tudo que não for número
  const apenasNumeros = valor.replace(/\D/g, "")

  // Converter para número e dividir por 100 para obter o valor em reais
  const numero = Number.parseInt(apenasNumeros || "0", 10) / 100

  // Formatar como dinheiro brasileiro
  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// Função para converter o valor formatado para número
const converterParaNumero = (valorFormatado: string): number => {
  // Remover o símbolo da moeda e outros caracteres não numéricos, mantendo o ponto decimal
  const valorLimpo = valorFormatado.replace(/[^\d,]/g, "").replace(",", ".")

  // Converter para número
  return Number.parseFloat(valorLimpo || "0")
}

export function PacoteDetailsDialog({ pacoteId, isOpen, onClose, onUpdate }: PacoteDetailsDialogProps) {
  const [pacoteInfo, setPacoteInfo] = useState<PacoteDetail["pacote"] | null>(null)
  const [combinacoes, setCombinacoes] = useState<Array<Omit<PacoteDetail, "pacote">>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCombinacoes, setIsLoadingCombinacoes] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const pageSize = 10
  const { toast } = useToast()

  // Estados para edição
  const [editPrefixo, setEditPrefixo] = useState("LTP")
  const [editNumero, setEditNumero] = useState("")
  const [editPrecoFormatado, setEditPrecoFormatado] = useState("R$ 0,00")
  const [editCor, setEditCor] = useState("")

  useEffect(() => {
    if (isOpen && pacoteId) {
      fetchPacoteDetails(pacoteId)
      setIsEditing(false)
    } else {
      setPacoteInfo(null)
      setCombinacoes([])
      setPage(1)
      setHasMore(false)
      setIsEditing(false)
    }
  }, [isOpen, pacoteId])

  // Inicializar campos de edição quando os dados do pacote são carregados
  useEffect(() => {
    if (pacoteInfo) {
      // Separar o prefixo (LTP ou MTP) do número no nome do pacote
      const nomeParts = pacoteInfo.descricao.split(" ")
      if (nomeParts.length === 2) {
        setEditPrefixo(nomeParts[0])
        setEditNumero(nomeParts[1])
      } else {
        setEditPrefixo("LTP")
        setEditNumero(pacoteInfo.descricao)
      }

      // Formatar o preço como dinheiro (com verificação para evitar erro com valor nulo)
      const preco = pacoteInfo.preco ?? 0
      setEditPrecoFormatado(
        preco.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      )

      setEditCor(pacoteInfo.cor || "#000000")
    }
  }, [pacoteInfo])

  const handlePrecoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value

    // Se o usuário apagar tudo, definir como vazio
    if (!valor) {
      setEditPrecoFormatado("R$ 0,00")
      return
    }

    // Formatar o valor como dinheiro
    const valorFormatado = formatarDinheiro(valor)
    setEditPrecoFormatado(valorFormatado)
  }

  const fetchPacoteDetails = async (id: number) => {
    try {
      setIsLoading(true)

      // Buscar dados do pacote
      const { data: pacoteData, error: pacoteError } = await supabase.from("pacotes").select("*").eq("id", id).single()

      if (pacoteError) throw pacoteError

      if (!pacoteData) {
        toast({
          title: "Erro",
          description: "Pacote não encontrado",
          variant: "destructive",
        })
        onClose()
        return
      }

      // Garantir que o preço seja um número (ou 0 se for nulo)
      const pacoteComPrecoValido = {
        ...pacoteData,
        preco: pacoteData.preco ?? 0,
      }

      setPacoteInfo(pacoteComPrecoValido)

      // Buscar combinações iniciais
      fetchCombinacoes(pacoteData.descricao, 1)
    } catch (error) {
      console.error("Erro ao buscar detalhes do pacote:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes do pacote",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCombinacoes = async (nomePacote: string, pageNumber: number) => {
    try {
      setIsLoadingCombinacoes(true)

      // Consulta otimizada usando JOIN para buscar todas as informações de uma vez
      const { data, error, count } = await supabase
        .from("pacotes")
        .select(
          `
          id, 
          larguras!inner(
            id, 
            valor,
            alturas!inner(
              id, 
              valor,
              tamanhos!inner(
                id, 
                nome
              )
            )
          )
        `,
          { count: "exact" },
        )
        .eq("descricao", nomePacote)
        .range((pageNumber - 1) * pageSize, pageNumber * pageSize - 1)

      if (error) throw error

      // Transformar os dados para o formato esperado
      const novasCombinacoes =
        data?.map((item) => {
          const largura = item.larguras
          const altura = largura.alturas
          const tamanho = altura.tamanhos

          return {
            largura: {
              id: largura.id,
              valor: largura.valor,
            },
            altura: {
              id: altura.id,
              valor: altura.valor,
            },
            tamanho: {
              id: tamanho.id,
              nome: tamanho.nome,
            },
          }
        }) || []

      if (pageNumber === 1) {
        setCombinacoes(novasCombinacoes)
      } else {
        setCombinacoes((prev) => [...prev, ...novasCombinacoes])
      }

      // Verificar se há mais combinações para carregar
      setHasMore(count ? count > pageNumber * pageSize : false)
      setPage(pageNumber)
    } catch (error) {
      console.error("Erro ao buscar combinações:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar todas as combinações",
        variant: "destructive",
      })
    } finally {
      setIsLoadingCombinacoes(false)
    }
  }

  const handleLoadMore = () => {
    if (pacoteInfo && !isLoadingCombinacoes && hasMore) {
      fetchCombinacoes(pacoteInfo.descricao, page + 1)
    }
  }

  const handleToggleEdit = () => {
    setIsEditing(!isEditing)
  }

  const handleSave = async () => {
    if (!pacoteInfo) return

    try {
      setIsSaving(true)

      // Validar número
      if (!editNumero.trim()) {
        toast({
          title: "Erro",
          description: "O número do pacote é obrigatório",
          variant: "destructive",
        })
        return
      }

      // Converter o preço formatado para número
      const precoNumerico = converterParaNumero(editPrecoFormatado)

      // Validar preço
      if (isNaN(precoNumerico) || precoNumerico <= 0) {
        toast({
          title: "Erro",
          description: "O preço deve ser um número válido maior que zero",
          variant: "destructive",
        })
        return
      }

      // Validar cor
      const corRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
      if (!corRegex.test(editCor)) {
        toast({
          title: "Erro",
          description: "A cor deve estar no formato hexadecimal válido (ex: #FF0000)",
          variant: "destructive",
        })
        return
      }

      // Compor o nome completo do pacote
      const novoNome = `${editPrefixo} ${editNumero}`

      // Verificar se o nome foi alterado
      const nomeAlterado = novoNome !== pacoteInfo.descricao

      // Primeiro, atualizar o pacote atual para garantir que pelo menos ele seja atualizado
      const { error: updateCurrentError } = await supabase
        .from("pacotes")
        .update({
          descricao: novoNome,
          preco: precoNumerico,
          cor: editCor,
        })
        .eq("id", pacoteInfo.id)

      if (updateCurrentError) throw updateCurrentError

      // Se o nome foi alterado, atualizar todos os pacotes com o nome anterior
      if (nomeAlterado) {
        const { error: updateNameError } = await supabase
          .from("pacotes")
          .update({
            descricao: novoNome,
          })
          .eq("descricao", pacoteInfo.descricao)

        if (updateNameError) throw updateNameError
      }

      // Atualizar preço e cor para todos os pacotes com o mesmo nome (novo nome)
      const { error: updateAllError } = await supabase
        .from("pacotes")
        .update({
          preco: precoNumerico,
          cor: editCor,
        })
        .eq("descricao", novoNome)
        .neq("id", pacoteInfo.id) // Excluir o pacote atual que já foi atualizado

      if (updateAllError) throw updateAllError

      // Atualizar o estado local
      setPacoteInfo({
        ...pacoteInfo,
        descricao: novoNome,
        preco: precoNumerico,
        cor: editCor,
      })

      // Desativar modo de edição
      setIsEditing(false)

      // Notificar sucesso
      toast({
        title: "Sucesso",
        description: "Pacote atualizado com sucesso",
      })

      // Chamar callback de atualização se fornecido
      if (onUpdate) {
        onUpdate()
      }
    } catch (error) {
      console.error("Erro ao salvar pacote:", error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar as alterações",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        {isEditing ? (
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Editar Pacote
            </DialogTitle>
          </DialogHeader>
        ) : (
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Detalhes do Pacote
              </div>
              {pacoteInfo && !isLoading && (
                <div className="flex-1 flex justify-end mr-8">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleToggleEdit}
                          disabled={isSaving}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Editar pacote</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </DialogTitle>
          </DialogHeader>
        )}

        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-8 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Carregando detalhes do pacote...</p>
          </div>
        ) : pacoteInfo ? (
          <div className="space-y-4">
            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome do Pacote</Label>
                  <div className="flex gap-2">
                    <Select value={editPrefixo} onValueChange={setEditPrefixo} disabled={isSaving}>
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Prefixo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LTP">LTP</SelectItem>
                        <SelectItem value="MTP">MTP</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="text"
                      value={editNumero}
                      onChange={(e) => setEditNumero(e.target.value)}
                      placeholder="Número"
                      disabled={isSaving}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preco">Preço</Label>
                  <Input
                    id="preco"
                    value={editPrecoFormatado}
                    onChange={handlePrecoChange}
                    placeholder="R$ 0,00"
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cor">Cor</Label>
                  <ColorSelect value={editCor} onChange={setEditCor} disabled={isSaving} />
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full"
                    style={{ backgroundColor: pacoteInfo.cor || "#f0f0f0" }}
                  >
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{pacoteInfo.descricao}</h3>
                    <p className="text-sm text-muted-foreground">{pacoteInfo.qtd_esferas} esferas</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Preço</p>
                    <p className="font-medium">
                      {(pacoteInfo.preco ?? 0).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Cor</p>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: pacoteInfo.cor || "#f0f0f0" }}
                      ></div>
                      <p>{pacoteInfo.cor || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {!isEditing && (
              <div className="pt-2">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Combinações disponíveis ({combinacoes.length}
                    {hasMore ? "+" : ""})
                  </h4>
                  {isLoadingCombinacoes && (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Buscando combinações...</span>
                    </div>
                  )}
                </div>

                {combinacoes.length > 0 ? (
                  <div className="space-y-3">
                    <ScrollArea className="h-[200px] rounded-md border">
                      <div className="p-4 space-y-3">
                        {combinacoes.map((combinacao, index) => (
                          <div key={index} className="bg-muted p-3 rounded-md">
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <div>
                                <p className="font-medium">Tamanho</p>
                                <p>{combinacao.tamanho?.nome || "N/A"}</p>
                              </div>
                              <div>
                                <p className="font-medium">Altura</p>
                                <p>{combinacao.altura?.valor ? `${combinacao.altura.valor}` : "N/A"}</p>
                              </div>
                              <div>
                                <p className="font-medium">Largura</p>
                                <p>{combinacao.largura?.valor ? `${combinacao.largura.valor}` : "N/A"}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    {hasMore && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={handleLoadMore}
                        disabled={isLoadingCombinacoes}
                      >
                        {isLoadingCombinacoes ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Carregando mais...
                          </>
                        ) : (
                          "Carregar mais combinações"
                        )}
                      </Button>
                    )}
                  </div>
                ) : isLoadingCombinacoes ? (
                  <div className="bg-muted p-4 rounded-md text-center">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Buscando todas as combinações do pacote...</p>
                  </div>
                ) : (
                  <div className="bg-muted p-4 rounded-md text-center text-sm text-muted-foreground">
                    Nenhuma combinação encontrada para este pacote.
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="py-6 text-center text-muted-foreground">Nenhum detalhe disponível para este pacote.</div>
        )}

        {isEditing && (
          <DialogFooter>
            <Button variant="outline" onClick={handleToggleEdit} disabled={isSaving}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
