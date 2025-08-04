"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { hashPassword } from "@/lib/auth"
import { fetchAddressByCep } from "@/lib/via-cep"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Loader2, Store, Package, CreditCard } from "lucide-react"
import { useCallback, useState } from "react"

interface NewRevendedorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function NewRevendedorModal({ open, onOpenChange, onSuccess }: NewRevendedorModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingCep, setIsFetchingCep] = useState(false)
  const [formData, setFormData] = useState({
    nome: "",
    sobrenome: "",
    email: "",
    telefone: "",
    senha: "",
    cep: "",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
    loja: "",
    frete: "10", // Valor padrão de 10 reais
    chave_pix: "",
    chave_tipo: "CPF",
    foto: null as File | null,
    fotoUrl: "",
  })

  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const [isCidadeBlocked, setIsCidadeBlocked] = useState(false)
  const [isUfBlocked, setIsUfBlocked] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Se o campo for CEP e tiver 8 dígitos, buscar endereço
    if (name === "cep" && value.replace(/\D/g, "").length === 8) {
      handleCepBlur(value)
    }
  }

  const handleCepBlur = async (cep: string) => {
    // Verificar se o CEP tem pelo menos 8 dígitos
    const cleanCep = cep.replace(/\D/g, "")
    if (cleanCep.length !== 8) return

    setIsFetchingCep(true)
    try {
      const addressData = await fetchAddressByCep(cleanCep)

      if (addressData) {
        setFormData((prev) => ({
          ...prev,
          rua: addressData.logradouro || prev.rua,
          bairro: addressData.bairro || prev.bairro,
          cidade: addressData.localidade || prev.cidade,
          uf: addressData.uf || prev.uf,
          complemento: addressData.complemento || prev.complemento,
        }))

        // Bloquear cidade e UF se foram preenchidos pelo ViaCEP
        if (addressData.localidade) {
          setIsCidadeBlocked(true)
        }
        if (addressData.uf) {
          setIsUfBlocked(true)
        }
      } else {
        // Se não encontrou dados, permitir edição
        setIsCidadeBlocked(false)
        setIsUfBlocked(false)
        toast({
          title: "CEP não encontrado",
          description: "Não foi possível encontrar o endereço para este CEP",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao buscar o endereço pelo CEP",
        variant: "destructive",
      })
    } finally {
      setIsFetchingCep(false)
    }
  }

  // Formatar o CEP enquanto digita (99999-999)
  const formatCep = (value: string) => {
    const cleanValue = value.replace(/\D/g, "")
    if (cleanValue.length <= 5) {
      return cleanValue
    }
    return `${cleanValue.slice(0, 5)}-${cleanValue.slice(5, 8)}`
  }

  // Handler específico para o campo CEP
  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    const formattedCep = formatCep(value)
    setFormData((prev) => ({ ...prev, cep: formattedCep }))
  }

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      // Check if file is an image
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Erro",
          description: "Por favor, selecione uma imagem válida",
          variant: "destructive",
        })
        return
      }

      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Erro",
          description: "A imagem deve ter no máximo 2MB",
          variant: "destructive",
        })
        return
      }

      // Create a preview URL
      const previewUrl = URL.createObjectURL(file)

      setFormData((prev) => ({
        ...prev,
        foto: file,
        fotoUrl: previewUrl,
      }))
    },
    [toast],
  )

  // Formatar frete enquanto digita (R$ 99,99)
  const formatFrete = (value: string) => {
    const cleanValue = value.replace(/\D/g, "")
    const numericValue = Number.parseInt(cleanValue || "0", 10) / 100
    return numericValue.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  // Handler específico para o campo frete
  const handleFreteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    const formattedFrete = formatFrete(value)
    setFormData((prev) => ({ ...prev, frete: formattedFrete }))
  }

  // Função para converter frete formatado para número
  const converterFreteParaNumero = (freteFormatado: string): number => {
    const valorLimpo = freteFormatado.replace(/[^\d,]/g, "").replace(",", ".")
    return Number.parseFloat(valorLimpo || "0")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validar campos obrigatórios
      if (!formData.nome || !formData.email || !formData.senha || !formData.telefone || !formData.loja || !formData.chave_pix || !formData.chave_tipo) {
        toast({
          title: "Erro",
          description: "Preencha todos os campos obrigatórios incluindo os dados PIX",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Verificar se o email já existe
      const { data: existingUser, error: checkError } = await supabase
        .from("usuarios")
        .select("id")
        .eq("email", formData.email)
        .single()

      if (existingUser) {
        toast({
          title: "Erro",
          description: "Este email já está cadastrado",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Criar hash da senha
      const hashedPassword = await hashPassword(formData.senha)

      // Upload da foto, se existir
      let fotoPath = null
      if (formData.foto) {
        setIsUploading(true)

        // Gerar um nome único para o arquivo
        const fileExt = formData.foto.name.split(".").pop()
        const fileName = `${Date.now()}.${fileExt}`
        const filePath = `revendedor_images/${fileName}`

        // Upload para o bucket do Supabase
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("images")
          .upload(filePath, formData.foto, {
            cacheControl: "3600",
            upsert: false,
          })

        if (uploadError) {
          console.error("Erro ao fazer upload da imagem:", uploadError)
          toast({
            title: "Erro",
            description: "Não foi possível fazer o upload da imagem",
            variant: "destructive",
          })
          setIsLoading(false)
          setIsUploading(false)
          return
        }

        // Obter a URL pública da imagem
        const {
          data: { publicUrl },
        } = supabase.storage.from("images").getPublicUrl(filePath)

        fotoPath = publicUrl
        setIsUploading(false)
      }

      // Inserir na tabela usuarios
      const { data: newUser, error: userError } = await supabase
        .from("usuarios")
        .insert([
          {
            nome: formData.nome,
            sobrenome: formData.sobrenome,
            email: formData.email,
            telefone: formData.telefone,
            senha: hashedPassword,
            cep: formData.cep,
            rua: formData.rua,
            numero: formData.numero,
            complemento: formData.complemento,
            bairro: formData.bairro,
            cidade: formData.cidade,
            uf: formData.uf,
            tipo: "revendedor", // Definir tipo como revendedor
            foto: fotoPath, // Adicionar a URL da foto
          },
        ])
        .select("id")
        .single()

      if (userError) {
        console.error("Erro ao criar usuário:", userError)
        toast({
          title: "Erro",
          description: "Não foi possível criar o usuário",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Converter frete para número
      const freteNumerico = converterFreteParaNumero(formData.frete)

      // Inserir na tabela revendedores
      const { error: revendedorError } = await supabase.from("revendedores").insert([
        {
          usuario_id: newUser.id,
          cidade: formData.cidade,
          uf: formData.uf,
          rua: formData.rua,
          complemento: formData.complemento,
          vendas: 0,
          loja: formData.loja,
          frete: freteNumerico, // Adicionar o valor do frete
          chave_pix: formData.chave_pix,
          chave_tipo: formData.chave_tipo,
        },
      ])

      if (revendedorError) {
        console.error("Erro ao criar revendedor:", revendedorError)
        toast({
          title: "Erro",
          description: "Usuário criado, mas não foi possível registrar como revendedor",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Sucesso
      toast({
        title: "Revendedor cadastrado",
        description: "O revendedor foi cadastrado com sucesso",
      })

      // Resetar formulário
      setFormData({
        nome: "",
        sobrenome: "",
        email: "",
        telefone: "",
        senha: "",
        cep: "",
        rua: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        uf: "",
        loja: "",
        frete: "10", // Valor padrão
        chave_pix: "",
        chave_tipo: "CPF",
        foto: null,
        fotoUrl: "",
      })

      setIsCidadeBlocked(false)
      setIsUfBlocked(false)

      // Fechar modal
      onOpenChange(false)

      // Callback de sucesso (para atualizar a lista)
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Erro ao cadastrar revendedor:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao cadastrar o revendedor",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsUploading(false)
    }
  }

  // Formatar telefone enquanto digita ((99) 99999-9999)
  const formatPhone = (value: string) => {
    const cleanValue = value.replace(/\D/g, "")
    if (cleanValue.length <= 2) {
      return cleanValue
    }
    if (cleanValue.length <= 6) {
      return `(${cleanValue.slice(0, 2)}) ${cleanValue.slice(2)}`
    }
    if (cleanValue.length <= 10) {
      return `(${cleanValue.slice(0, 2)}) ${cleanValue.slice(2, 6)}-${cleanValue.slice(6)}`
    }
    return `(${cleanValue.slice(0, 2)}) ${cleanValue.slice(2, 7)}-${cleanValue.slice(7, 11)}`
  }

  // Handler específico para o campo telefone
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    const formattedPhone = formatPhone(value)
    setFormData((prev) => ({ ...prev, telefone: formattedPhone }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="relative group">
              <Avatar className="h-20 w-20 border-2 border-muted">
                {formData.fotoUrl ? (
                  <AvatarImage src={formData.fotoUrl || "/placeholder.svg"} alt="Foto do revendedor" />
                ) : (
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    <Store className="h-8 w-8" />
                  </AvatarFallback>
                )}
              </Avatar>
              <label
                htmlFor="photo-upload"
                className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
              >
                <Camera className="h-6 w-6 text-white" />
                <input type="file" id="photo-upload" accept="image/*" className="sr-only" onChange={handleFileChange} />
              </label>
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full">
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                </div>
              )}
            </div>
            <div>
              <DialogTitle>Novo Revendedor</DialogTitle>
              <DialogDescription>Preencha os dados para cadastrar um novo revendedor.</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Campo Nome da Loja */}
            <div className="space-y-2">
              <Label htmlFor="loja" className="text-right flex items-center">
                <Store className="h-4 w-4 mr-2" />
                Nome da Loja *
              </Label>
              <Input
                id="loja"
                name="loja"
                value={formData.loja}
                onChange={handleChange}
                placeholder="Nome da loja do revendedor"
                required
              />
            </div>

            {/* Campo Valor do Frete */}
            <div className="space-y-2">
              <Label htmlFor="frete" className="text-right flex items-center">
                <Package className="h-4 w-4 mr-2" />
                Valor do Frete *
              </Label>
              <Input
                id="frete"
                name="frete"
                value={formData.frete}
                onChange={handleFreteChange}
                placeholder="R$ 10,00"
                required
              />
              <p className="text-xs text-muted-foreground">Valor padrão do frete para este revendedor</p>
            </div>

            {/* Campos PIX */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="chave_tipo" className="text-right flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Tipo de Chave PIX *
                </Label>
                <Select
                  value={formData.chave_tipo}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, chave_tipo: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CPF">CPF</SelectItem>
                    <SelectItem value="CNPJ">CNPJ</SelectItem>
                    <SelectItem value="EMAIL">Email</SelectItem>
                    <SelectItem value="PHONE">Telefone</SelectItem>
                    <SelectItem value="EVP">Chave Aleatória</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="chave_pix" className="text-right flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Chave PIX *
                </Label>
                <Input
                  id="chave_pix"
                  name="chave_pix"
                  value={formData.chave_pix}
                  onChange={handleChange}
                  placeholder={
                    formData.chave_tipo === "CPF" ? "000.000.000-00" :
                    formData.chave_tipo === "CNPJ" ? "00.000.000/0000-00" :
                    formData.chave_tipo === "EMAIL" ? "email@exemplo.com" :
                    formData.chave_tipo === "PHONE" ? "(00) 00000-0000" :
                    "Chave aleatória"
                  }
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Chave PIX para recebimento dos repasses
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-right">
                  Nome do Responsável *
                </Label>
                <Input id="nome" name="nome" value={formData.nome} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sobrenome" className="text-right">
                  Sobrenome
                </Label>
                <Input id="sobrenome" name="sobrenome" value={formData.sobrenome} onChange={handleChange} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-right">
                  Email *
                </Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone" className="text-right">
                  Telefone *
                </Label>
                <Input
                  id="telefone"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handlePhoneChange}
                  placeholder="(99) 99999-9999"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha" className="text-right">
                Senha *
              </Label>
              <Input id="senha" name="senha" type="password" value={formData.senha} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cep" className="text-right">
                  CEP
                </Label>
                <div className="relative">
                  <Input
                    id="cep"
                    name="cep"
                    value={formData.cep}
                    onChange={handleCepChange}
                    onBlur={(e) => handleCepBlur(e.target.value)}
                    placeholder="99999-999"
                    maxLength={9}
                  />
                  {isFetchingCep && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="uf" className="text-right">
                  UF
                </Label>
                <Input
                  id="uf"
                  name="uf"
                  maxLength={2}
                  value={formData.uf}
                  onChange={handleChange}
                  className="uppercase"
                  disabled={isUfBlocked}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cidade" className="text-right">
                  Cidade
                </Label>
                <Input
                  id="cidade"
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                  disabled={isCidadeBlocked}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bairro" className="text-right">
                  Bairro
                </Label>
                <Input id="bairro" name="bairro" value={formData.bairro} onChange={handleChange} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="rua" className="text-right">
                  Rua
                </Label>
                <Input id="rua" name="rua" value={formData.rua} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numero" className="text-right">
                  Número
                </Label>
                <Input id="numero" name="numero" value={formData.numero} onChange={handleChange} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="complemento" className="text-right">
                Complemento
              </Label>
              <Input id="complemento" name="complemento" value={formData.complemento} onChange={handleChange} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || isUploading}>
              {isLoading || isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
