"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Plus, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

interface Tamanho {
  id: number
  nome: string
}

interface Combinacao {
  tamanhoId: number
  tamanhoNome: string
  altura: string
  largura: string
}

interface AddCombinacaoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pacote: {
    descricao: string
    preco_cpf: number | null
    preco_cnpj: number | null
    cor: string | null
  }
  onCombinacaoAdded: () => void
}

export function AddCombinacaoModal({ open, onOpenChange, pacote, onCombinacaoAdded }: AddCombinacaoModalProps) {
  const [tamanhos, setTamanhos] = useState<Tamanho[]>([])
  const [tamanhoId, setTamanhoId] = useState<string>("")
  const [altura, setAltura] = useState<string>("")
  const [largura, setLargura] = useState<string>("")
  const [combinacoes, setCombinacoes] = useState<Combinacao[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isVerificando, setIsVerificando] = useState(false)
  const [combinacaoExistente, setCombinacaoExistente] = useState(false)

  useEffect(() => {
    if (open) {
      fetchTamanhos()
      setCombinacoes([])
      limparCampos()
    }
  }, [open])

  useEffect(() => {
    if (tamanhoId && altura && largura) {
      verificarCombinacaoExistente()
    } else {
      setCombinacaoExistente(false)
    }
  }, [tamanhoId, altura, largura])

  const fetchTamanhos = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.from("tamanhos").select("*").order("nome")
      if (error) throw error
      setTamanhos(data || [])
    } catch (error: any) {
      console.error("Erro ao buscar tamanhos:", error)
      toast({
        title: "Erro ao buscar tamanhos",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const verificarCombinacaoExistente = async () => {
    if (!tamanhoId || !altura || !largura) return

    setIsVerificando(true)
    try {
      // Verificar se já existe uma altura com esse valor para esse tamanho
      const { data: alturaData, error: alturaError } = await supabase
        .from("alturas")
        .select("id")
        .eq("tamanho_id", tamanhoId)
        .eq("valor", altura)
        .single()

      if (alturaError && alturaError.code !== "PGRST116") throw alturaError

      if (alturaData) {
        // Se existe altura, verificar se já existe uma largura com esse valor para essa altura
        const { data: larguraData, error: larguraError } = await supabase
          .from("larguras")
          .select("id")
          .eq("altura_id", alturaData.id)
          .eq("valor", largura)
          .single()

        if (larguraError && larguraError.code !== "PGRST116") throw larguraError

        if (larguraData) {
          // Se existe largura, verificar se já existe um pacote com esse nome para essa largura
          const { data: pacoteData, error: pacoteError } = await supabase
            .from("pacotes")
            .select("id")
            .eq("largura_id", larguraData.id)
            .eq("descricao", pacote.descricao)
            .single()

          if (pacoteError && pacoteError.code !== "PGRST116") throw pacoteError

          setCombinacaoExistente(!!pacoteData)
        } else {
          setCombinacaoExistente(false)
        }
      } else {
        setCombinacaoExistente(false)
      }
    } catch (error: any) {
      console.error("Erro ao verificar combinação:", error)
      setCombinacaoExistente(false)
    } finally {
      setIsVerificando(false)
    }
  }

  const limparCampos = () => {
    setTamanhoId("")
    setAltura("")
    setLargura("")
    setCombinacaoExistente(false)
  }

  const handleAddCombinacao = () => {
    if (!tamanhoId || !altura || !largura) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para adicionar uma combinação.",
        variant: "destructive",
      })
      return
    }

    if (combinacaoExistente) {
      toast({
        title: "Combinação existente",
        description: "Esta combinação já existe para este pacote.",
        variant: "destructive",
      })
      return
    }

    const tamanhoSelecionado = tamanhos.find((t) => t.id.toString() === tamanhoId)
    if (!tamanhoSelecionado) return

    // Verificar se a combinação já foi adicionada à lista
    const combinacaoJaAdicionada = combinacoes.some(
      (c) => c.tamanhoId.toString() === tamanhoId && c.altura === altura && c.largura === largura,
    )

    if (combinacaoJaAdicionada) {
      toast({
        title: "Combinação já adicionada",
        description: "Esta combinação já foi adicionada à lista.",
        variant: "destructive",
      })
      return
    }

    const novaCombinacao: Combinacao = {
      tamanhoId: Number.parseInt(tamanhoId),
      tamanhoNome: tamanhoSelecionado.nome,
      altura,
      largura,
    }

    setCombinacoes([...combinacoes, novaCombinacao])
    limparCampos()
  }

  const handleRemoveCombinacao = (index: number) => {
    const novasCombinacoes = [...combinacoes]
    novasCombinacoes.splice(index, 1)
    setCombinacoes(novasCombinacoes)
  }

  const handleSave = async () => {
    if (combinacoes.length === 0) {
      toast({
        title: "Nenhuma combinação",
        description: "Adicione pelo menos uma combinação para salvar.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    let combinacoesSalvas = 0

    try {
      for (const combinacao of combinacoes) {
        // 1. Verificar se já existe uma altura com esse valor para esse tamanho
        const { data: alturaData, error: alturaError } = await supabase
          .from("alturas")
          .select("id")
          .eq("tamanho_id", combinacao.tamanhoId)
          .eq("valor", combinacao.altura)
          .single()

        let alturaId: number

        if (alturaError && alturaError.code === "PGRST116") {
          // Altura não existe, criar
          const { data: novaAltura, error: novaAlturaError } = await supabase
            .from("alturas")
            .insert({ tamanho_id: combinacao.tamanhoId, valor: combinacao.altura })
            .select("id")
            .single()

          if (novaAlturaError) throw novaAlturaError
          alturaId = novaAltura.id
        } else if (alturaError) {
          throw alturaError
        } else {
          alturaId = alturaData.id
        }

        // 2. Verificar se já existe uma largura com esse valor para essa altura
        const { data: larguraData, error: larguraError } = await supabase
          .from("larguras")
          .select("id")
          .eq("altura_id", alturaId)
          .eq("valor", combinacao.largura)
          .single()

        let larguraId: number

        if (larguraError && larguraError.code === "PGRST116") {
          // Largura não existe, criar
          const { data: novaLargura, error: novaLarguraError } = await supabase
            .from("larguras")
            .insert({ altura_id: alturaId, valor: combinacao.largura })
            .select("id")
            .single()

          if (novaLarguraError) throw novaLarguraError
          larguraId = novaLargura.id
        } else if (larguraError) {
          throw larguraError
        } else {
          larguraId = larguraData.id
        }

        // 3. Verificar se já existe um pacote com esse nome para essa largura
        const { data: pacoteData, error: pacoteError } = await supabase
          .from("pacotes")
          .select("id")
          .eq("largura_id", larguraId)
          .eq("descricao", pacote.descricao)
          .single()

        if (pacoteError && pacoteError.code === "PGRST116") {
          // Pacote não existe, criar
          const { error: novoPacoteError } = await supabase.from("pacotes").insert({
            descricao: pacote.descricao,
            preco_cpf: pacote.preco_cpf,
            preco_cnpj: pacote.preco_cnpj,
            cor: pacote.cor,
            largura_id: larguraId,
            status: "ativo",
          })

          if (novoPacoteError) throw novoPacoteError
          combinacoesSalvas++
        } else if (pacoteError) {
          throw pacoteError
        } else {
          // Pacote já existe, pular
          console.log("Pacote já existe, pulando...")
        }
      }

      toast({
        title: "Combinações adicionadas",
        description: `${combinacoesSalvas} combinações foram adicionadas com sucesso.`,
      })

      onCombinacaoAdded()
      onOpenChange(false)
    } catch (error: any) {
      console.error("Erro ao salvar combinações:", error)
      toast({
        title: "Erro ao salvar combinações",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Combinações ao Pacote {pacote.descricao}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tamanho">Tamanho</Label>
              <Select value={tamanhoId} onValueChange={setTamanhoId}>
                <SelectTrigger id="tamanho" disabled={isLoading}>
                  <SelectValue placeholder="Selecione o tamanho" />
                </SelectTrigger>
                <SelectContent>
                  {tamanhos.map((tamanho) => (
                    <SelectItem key={tamanho.id} value={tamanho.id.toString()}>
                      {tamanho.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="altura">Altura</Label>
              <Input
                id="altura"
                placeholder="Digite a altura"
                value={altura}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "")
                  setAltura(value)
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="largura">Largura</Label>
              <Input
                id="largura"
                placeholder="Digite a largura"
                value={largura}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "")
                  setLargura(value)
                }}
              />
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleAddCombinacao}
                disabled={!tamanhoId || !altura || !largura || isVerificando || combinacaoExistente}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </div>

          {isVerificando && (
            <div className="flex items-center justify-center py-2">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-carplus mr-2"></div>
              <span className="text-sm text-muted-foreground">Verificando combinação...</span>
            </div>
          )}

          {combinacaoExistente && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Combinação existente</AlertTitle>
              <AlertDescription>Esta combinação já existe para este pacote.</AlertDescription>
            </Alert>
          )}

          {combinacoes.length > 0 && (
            <div className="space-y-2 mt-2">
              <Label>Combinações adicionadas ({combinacoes.length})</Label>
              <ScrollArea className="h-[150px] border rounded-md p-2">
                <div className="space-y-2">
                  {combinacoes.map((comb, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted/30 p-2 rounded-md">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{comb.tamanhoNome}</Badge>
                        <span className="text-sm">
                          Altura: {comb.altura} | Largura: {comb.largura}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleRemoveCombinacao(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={combinacoes.length === 0 || isSaving}>
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Salvando...
              </>
            ) : (
              "Salvar Combinações"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
