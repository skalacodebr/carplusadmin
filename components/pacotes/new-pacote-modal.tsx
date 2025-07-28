"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ColorSelect } from "@/components/ui/color-select"
import { AlertCircle, Loader2, Package, Plus, Save, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

interface NewPacoteModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface Tamanho {
  id: number
  nome: string
}

interface Combinacao {
  tamanhoId: number
  tamanhoNome: string
  altura: number
  largura: number
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

export function NewPacoteModal({ isOpen, onClose, onSuccess }: NewPacoteModalProps) {
  // Estado para controlar a aba ativa
  const [activeTab, setActiveTab] = useState("detalhes")

  // Estados para os dados do pacote
  const [prefixo, setPrefixo] = useState("LTP")
  const [numero, setNumero] = useState("")
  const [precoFormatado, setPrecoFormatado] = useState("R$ 0,00")
  const [cor, setCor] = useState("#69245d")

  // Estados para as combinações
  const [tamanhos, setTamanhos] = useState<Tamanho[]>([])
  const [selectedTamanhoId, setSelectedTamanhoId] = useState<string>("")
  const [altura, setAltura] = useState<string>("")
  const [largura, setLargura] = useState<string>("")
  const [combinacoes, setCombinacoes] = useState<Combinacao[]>([])

  // Estado para erro de combinação existente
  const [combinacaoExistente, setCombinacaoExistente] = useState(false)

  // Estados para carregamento
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingTamanhos, setIsLoadingTamanhos] = useState(false)
  const [isVerificandoCombinacao, setIsVerificandoCombinacao] = useState(false)
  const [isAdicionandoCombinacao, setIsAdicionandoCombinacao] = useState(false)

  const { toast } = useToast()

  // Buscar tamanhos ao abrir o modal
  useEffect(() => {
    if (isOpen) {
      fetchTamanhos()
      resetForm()
    }
  }, [isOpen])

  // Verificar combinação existente quando os valores mudam
  useEffect(() => {
    if (selectedTamanhoId && altura && largura) {
      verificarCombinacaoExistente()
    } else {
      setCombinacaoExistente(false)
    }
  }, [selectedTamanhoId, altura, largura])

  // Resetar o formulário
  const resetForm = () => {
    setPrefixo("LTP")
    setNumero("")
    setPrecoFormatado("R$ 0,00")
    setCor("#69245d")
    setSelectedTamanhoId("")
    setAltura("")
    setLargura("")
    setCombinacoes([])
    setCombinacaoExistente(false)
    setActiveTab("detalhes")
  }

  // Buscar tamanhos
  const fetchTamanhos = async () => {
    try {
      setIsLoadingTamanhos(true)
      const { data, error } = await supabase.from("tamanhos").select("*").order("nome")

      if (error) throw error

      setTamanhos(data || [])
    } catch (error) {
      console.error("Erro ao buscar tamanhos:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os tamanhos.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingTamanhos(false)
    }
  }

  // Verificar se a combinação já existe no banco de dados
  const verificarCombinacaoExistente = async () => {
    if (!selectedTamanhoId || !altura || !largura) return

    try {
      setIsVerificandoCombinacao(true)

      // Primeiro, buscar alturas que correspondem ao tamanho selecionado
      const { data: alturasData, error: alturasError } = await supabase
        .from("alturas")
        .select("id")
        .eq("tamanho_id", Number(selectedTamanhoId))
        .eq("valor", Number(altura))

      if (alturasError) throw alturasError

      // Se não encontrou nenhuma altura, a combinação não existe
      if (!alturasData || alturasData.length === 0) {
        setCombinacaoExistente(false)
        return
      }

      // Para cada altura encontrada, verificar se existe uma largura correspondente
      for (const alturaItem of alturasData) {
        const { data: largurasData, error: largurasError } = await supabase
          .from("larguras")
          .select("id")
          .eq("altura_id", alturaItem.id)
          .eq("valor", Number(largura))

        if (largurasError) throw largurasError

        // Se encontrou alguma largura, a combinação já existe
        if (largurasData && largurasData.length > 0) {
          setCombinacaoExistente(true)
          return
        }
      }

      // Se chegou até aqui, a combinação não existe
      setCombinacaoExistente(false)
    } catch (error) {
      console.error("Erro ao verificar combinação:", error)
      // Em caso de erro, assumimos que a combinação não existe
      setCombinacaoExistente(false)
    } finally {
      setIsVerificandoCombinacao(false)
    }
  }

  // Verificar se a combinação já existe na lista de combinações
  const verificarCombinacaoExistenteNaLista = () => {
    return combinacoes.some(
      (c) => c.tamanhoId === Number(selectedTamanhoId) && c.altura === Number(altura) && c.largura === Number(largura),
    )
  }

  // Lidar com a mudança no preço
  const handlePrecoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value

    // Se o usuário apagar tudo, definir como vazio
    if (!valor) {
      setPrecoFormatado("R$ 0,00")
      return
    }

    // Formatar o valor como dinheiro
    const valorFormatado = formatarDinheiro(valor)
    setPrecoFormatado(valorFormatado)
  }

  // Lidar com a mudança na altura
  const handleAlturaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Permitir apenas números inteiros positivos
    const valor = e.target.value.replace(/\D/g, "")
    setAltura(valor)
  }

  // Lidar com a mudança na largura
  const handleLarguraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Permitir apenas números inteiros positivos
    const valor = e.target.value.replace(/\D/g, "")
    setLargura(valor)
  }

  // Avançar para a próxima aba
  const handleNextTab = () => {
    if (validateDetailsTab()) {
      setActiveTab("combinacoes")
    }
  }

  // Adicionar combinação à lista
  const handleAddCombinacao = () => {
    if (!validateCombinacao()) return

    setIsAdicionandoCombinacao(true)

    try {
      // Verificar se a combinação já existe na lista
      if (verificarCombinacaoExistenteNaLista()) {
        toast({
          title: "Erro",
          description: "Esta combinação já foi adicionada à lista.",
          variant: "destructive",
        })
        return
      }

      // Encontrar o nome do tamanho selecionado
      const tamanho = tamanhos.find((t) => t.id === Number(selectedTamanhoId))
      if (!tamanho) {
        toast({
          title: "Erro",
          description: "Tamanho não encontrado.",
          variant: "destructive",
        })
        return
      }

      // Adicionar a combinação à lista
      const novaCombinacao: Combinacao = {
        tamanhoId: Number(selectedTamanhoId),
        tamanhoNome: tamanho.nome,
        altura: Number(altura),
        largura: Number(largura),
      }

      setCombinacoes([...combinacoes, novaCombinacao])

      // Limpar os campos para adicionar uma nova combinação
      setSelectedTamanhoId("")
      setAltura("")
      setLargura("")

      toast({
        title: "Sucesso",
        description: "Combinação adicionada à lista.",
      })
    } catch (error) {
      console.error("Erro ao adicionar combinação:", error)
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a combinação.",
        variant: "destructive",
      })
    } finally {
      setIsAdicionandoCombinacao(false)
    }
  }

  // Remover combinação da lista
  const handleRemoveCombinacao = (index: number) => {
    const novasCombinacoes = [...combinacoes]
    novasCombinacoes.splice(index, 1)
    setCombinacoes(novasCombinacoes)
  }

  // Validar a aba de detalhes
  const validateDetailsTab = () => {
    if (!numero.trim()) {
      toast({
        title: "Erro",
        description: "O número do pacote é obrigatório.",
        variant: "destructive",
      })
      return false
    }

    const precoNumerico = converterParaNumero(precoFormatado)
    if (isNaN(precoNumerico) || precoNumerico <= 0) {
      toast({
        title: "Erro",
        description: "O preço deve ser um número válido maior que zero.",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  // Validar a combinação atual
  const validateCombinacao = () => {
    if (!selectedTamanhoId) {
      toast({
        title: "Erro",
        description: "Você deve selecionar um tamanho.",
        variant: "destructive",
      })
      return false
    }

    if (!altura || Number(altura) <= 0) {
      toast({
        title: "Erro",
        description: "A altura deve ser um número inteiro positivo.",
        variant: "destructive",
      })
      return false
    }

    if (!largura || Number(largura) <= 0) {
      toast({
        title: "Erro",
        description: "A largura deve ser um número inteiro positivo.",
        variant: "destructive",
      })
      return false
    }

    if (combinacaoExistente) {
      toast({
        title: "Erro",
        description: "Esta combinação de tamanho, altura e largura já existe no banco de dados.",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  // Validar antes de salvar
  const validateBeforeSave = () => {
    if (combinacoes.length === 0) {
      toast({
        title: "Erro",
        description: "Você deve adicionar pelo menos uma combinação.",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  // Função para gerar a URL da imagem baseada na cor
  const gerarUrlImagem = (cor: string): string => {
    // Remover o # da cor
    const corSemHash = cor.replace("#", "")

    // Obter a URL pública da imagem do bucket
    const {
      data: { publicUrl },
    } = supabase.storage.from("images").getPublicUrl(`pacote_images/${corSemHash}.jpg`)

    return publicUrl
  }

  // Salvar o pacote
  const handleSave = async () => {
    if (!validateBeforeSave()) return

    try {
      setIsLoading(true)

      // Preparar os dados do pacote
      const nomePacote = `${prefixo} ${numero}`
      const precoNumerico = converterParaNumero(precoFormatado)

      // Para cada combinação, criar altura, largura e pacote
      for (const combinacao of combinacoes) {
        // 1. Criar a altura
        const { data: alturaData, error: alturaError } = await supabase
          .from("alturas")
          .insert({
            tamanho_id: combinacao.tamanhoId,
            valor: combinacao.altura,
          })
          .select()

        if (alturaError) throw alturaError
        if (!alturaData || alturaData.length === 0) throw new Error("Falha ao criar altura")

        // 2. Criar a largura
        const { data: larguraData, error: larguraError } = await supabase
          .from("larguras")
          .insert({
            altura_id: alturaData[0].id,
            valor: combinacao.largura,
          })
          .select()

        if (larguraError) throw larguraError
        if (!larguraData || larguraData.length === 0) throw new Error("Falha ao criar largura")

        // 3. Criar o pacote
        const { error: pacoteError } = await supabase.from("pacotes").insert({
          descricao: nomePacote,
          preco: precoNumerico,
          cor: cor,
          largura_id: larguraData[0].id,
          imagem: gerarUrlImagem(cor), // Adicionar a URL da imagem
        })

        if (pacoteError) throw pacoteError
      }

      // Notificar sucesso
      toast({
        title: "Sucesso",
        description: `Pacote criado com sucesso com ${combinacoes.length} combinações.`,
      })

      // Fechar o modal e atualizar a lista
      resetForm()
      onClose()
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Erro ao salvar pacote:", error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar o pacote.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Novo Pacote
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
            <TabsTrigger value="combinacoes">Combinações</TabsTrigger>
          </TabsList>

          <TabsContent value="detalhes" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Nome do Pacote</Label>
              <div className="flex gap-2">
                <Select value={prefixo} onValueChange={setPrefixo} disabled={isLoading}>
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
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  placeholder="Número"
                  disabled={isLoading}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preco">Preço</Label>
              <Input
                id="preco"
                value={precoFormatado}
                onChange={handlePrecoChange}
                placeholder="R$ 0,00"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cor">Cor</Label>
              <ColorSelect value={cor} onChange={setCor} disabled={isLoading} />
            </div>

            <div className="flex justify-end mt-4">
              <Button onClick={handleNextTab} disabled={isLoading}>
                Próximo
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="combinacoes" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tamanho">Tamanho</Label>
                <Select
                  value={selectedTamanhoId}
                  onValueChange={setSelectedTamanhoId}
                  disabled={isLoading || isLoadingTamanhos}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tamanho" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingTamanhos ? (
                      <div className="flex items-center justify-center py-2">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span>Carregando...</span>
                      </div>
                    ) : tamanhos.length === 0 ? (
                      <div className="py-2 text-center text-sm text-muted-foreground">Nenhum tamanho encontrado</div>
                    ) : (
                      tamanhos.map((tamanho) => (
                        <SelectItem key={tamanho.id} value={tamanho.id.toString()}>
                          {tamanho.nome}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="altura">Altura</Label>
                <Input
                  id="altura"
                  type="text"
                  inputMode="numeric"
                  value={altura}
                  onChange={handleAlturaChange}
                  placeholder="Digite a altura (número inteiro)"
                  disabled={isLoading || !selectedTamanhoId}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="largura">Largura</Label>
                <Input
                  id="largura"
                  type="text"
                  inputMode="numeric"
                  value={largura}
                  onChange={handleLarguraChange}
                  placeholder="Digite a largura (número inteiro)"
                  disabled={isLoading || !selectedTamanhoId}
                />
              </div>

              {combinacaoExistente && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Esta combinação de tamanho, altura e largura já existe no banco de dados.
                  </AlertDescription>
                </Alert>
              )}

              {isVerificandoCombinacao && (
                <div className="flex items-center justify-center py-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>Verificando combinação...</span>
                </div>
              )}

              <Button
                onClick={handleAddCombinacao}
                disabled={
                  isLoading ||
                  isAdicionandoCombinacao ||
                  combinacaoExistente ||
                  isVerificandoCombinacao ||
                  !selectedTamanhoId ||
                  !altura ||
                  !largura
                }
                className="w-full"
              >
                {isAdicionandoCombinacao ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adicionando...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Combinação
                  </>
                )}
              </Button>

              {combinacoes.length > 0 && (
                <div className="space-y-2 border-t pt-4">
                  <Label className="text-base">Combinações Adicionadas ({combinacoes.length})</Label>
                  <ScrollArea className="h-[150px] rounded-md border p-2">
                    <div className="space-y-2">
                      {combinacoes.map((combinacao, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-md border p-2 bg-muted/30"
                        >
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-background">
                              {combinacao.tamanhoNome}
                            </Badge>
                            <span className="text-sm">
                              Altura: <strong>{combinacao.altura}</strong>
                            </span>
                            <span className="text-sm">
                              Largura: <strong>{combinacao.largura}</strong>
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveCombinacao(index)}
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>

            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => setActiveTab("detalhes")} disabled={isLoading}>
                Voltar
              </Button>
              <Button onClick={handleSave} disabled={isLoading || combinacoes.length === 0}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Pacote
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
