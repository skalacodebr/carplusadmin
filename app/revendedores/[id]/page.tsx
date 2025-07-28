"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash, DollarSign, ArrowLeft, Loader2, Store, User, Mail, Phone, MapPin } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface Params {
  id: string
}

interface PageProps {
  params: Params
}

interface RevendedorDetails {
  id: number
  nome: string
  email: string
  telefone: string
  cidade: string
  uf: string
  foto: string | null
  revendedores: {
    id: number
    loja: string
    vendas: number
    status: boolean
  }[]
}

export default function RevendedorDetailPage({ params }: PageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [revendedor, setRevendedor] = useState<RevendedorDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cidade: '',
    uf: '',
    loja: ''
  })

  useEffect(() => {
    fetchRevendedorDetails()
  }, [params.id])

  const fetchRevendedorDetails = async () => {
    try {
      setIsLoading(true)
      
      const { data, error } = await supabase
        .from('usuarios')
        .select(`
          id,
          nome,
          email,
          telefone,
          cidade,
          uf,
          foto,
          revendedores!inner(
            id,
            loja,
            vendas,
            status
          )
        `)
        .eq('id', params.id)
        .eq('tipo', 'revendedor')
        .single()

      if (error) {
        console.error('Erro ao buscar revendedor:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados do revendedor',
          variant: 'destructive'
        })
        return
      }

      if (!data) {
        toast({
          title: 'Revendedor não encontrado',
          description: 'O revendedor solicitado não foi encontrado',
          variant: 'destructive'
        })
        router.push('/revendedores')
        return
      }

      setRevendedor(data)
      setEditData({
        nome: data.nome || '',
        email: data.email || '',
        telefone: data.telefone || '',
        cidade: data.cidade || '',
        uf: data.uf || '',
        loja: data.revendedores[0]?.loja || ''
      })
    } catch (error) {
      console.error('Erro ao processar dados do revendedor:', error)
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao carregar os dados',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!revendedor) return

    try {
      // Atualizar dados do usuário
      const { error: userError } = await supabase
        .from('usuarios')
        .update({
          nome: editData.nome,
          email: editData.email,
          telefone: editData.telefone,
          cidade: editData.cidade,
          uf: editData.uf
        })
        .eq('id', revendedor.id)

      if (userError) throw userError

      // Atualizar dados do revendedor
      const { error: revendedorError } = await supabase
        .from('revendedores')
        .update({
          loja: editData.loja
        })
        .eq('usuario_id', revendedor.id)

      if (revendedorError) throw revendedorError

      toast({
        title: 'Sucesso',
        description: 'Dados do revendedor atualizados com sucesso'
      })

      setIsEditing(false)
      fetchRevendedorDetails() // Recarregar dados
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as alterações',
        variant: 'destructive'
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-carplus" />
          <p className="text-muted-foreground">Carregando dados do revendedor...</p>
        </div>
      </div>
    )
  }

  if (!revendedor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">Revendedor não encontrado</p>
          <Button asChild>
            <Link href="/revendedores">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para lista
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const revendedorInfo = revendedor.revendedores[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/revendedores">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Detalhes do Revendedor</h1>
            <p className="text-muted-foreground">Informações completas do revendedor</p>
          </div>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                Salvar Alterações
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
        </div>
      </div>

      {/* Perfil do Revendedor */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              {revendedor.foto ? (
                <AvatarImage src={revendedor.foto} alt={revendedorInfo.loja} />
              ) : (
                <AvatarFallback className="bg-carplus/10 text-carplus text-lg">
                  {revendedorInfo.loja
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .substring(0, 2)}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-2xl">{revendedorInfo.loja}</CardTitle>
                <Badge className={revendedorInfo.status ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'}>
                  {revendedorInfo.status ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {revendedor.nome}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-carplus">{revendedorInfo.vendas}</div>
              <div className="text-sm text-muted-foreground">Vendas realizadas</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Informações Detalhadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dados Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Dados Pessoais
            </CardTitle>
            <CardDescription>Informações pessoais do revendedor</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome Completo</Label>
              {isEditing ? (
                <Input
                  id="nome"
                  value={editData.nome}
                  onChange={(e) => setEditData(prev => ({ ...prev, nome: e.target.value }))}
                  className="mt-1"
                />
              ) : (
                <div className="mt-1 p-3 bg-muted rounded-md">{revendedor.nome || 'Não informado'}</div>
              )}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-1"
                />
              ) : (
                <div className="mt-1 p-3 bg-muted rounded-md flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {revendedor.email || 'Não informado'}
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="telefone">Telefone</Label>
              {isEditing ? (
                <Input
                  id="telefone"
                  value={editData.telefone}
                  onChange={(e) => setEditData(prev => ({ ...prev, telefone: e.target.value }))}
                  className="mt-1"
                />
              ) : (
                <div className="mt-1 p-3 bg-muted rounded-md flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {revendedor.telefone || 'Não informado'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dados da Loja */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Dados da Loja
            </CardTitle>
            <CardDescription>Informações sobre a loja do revendedor</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="loja">Nome da Loja</Label>
              {isEditing ? (
                <Input
                  id="loja"
                  value={editData.loja}
                  onChange={(e) => setEditData(prev => ({ ...prev, loja: e.target.value }))}
                  className="mt-1"
                />
              ) : (
                <div className="mt-1 p-3 bg-muted rounded-md">{revendedorInfo.loja || 'Não informado'}</div>
              )}
            </div>
            <div>
              <Label htmlFor="cidade">Cidade</Label>
              {isEditing ? (
                <Input
                  id="cidade"
                  value={editData.cidade}
                  onChange={(e) => setEditData(prev => ({ ...prev, cidade: e.target.value }))}
                  className="mt-1"
                />
              ) : (
                <div className="mt-1 p-3 bg-muted rounded-md flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {revendedor.cidade || 'Não informado'}
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="uf">Estado (UF)</Label>
              {isEditing ? (
                <Input
                  id="uf"
                  value={editData.uf}
                  onChange={(e) => setEditData(prev => ({ ...prev, uf: e.target.value.toUpperCase() }))}
                  maxLength={2}
                  className="mt-1"
                />
              ) : (
                <div className="mt-1 p-3 bg-muted rounded-md">{revendedor.uf || 'Não informado'}</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações */}
      <Card>
        <CardHeader>
          <CardTitle>Ações</CardTitle>
          <CardDescription>Ações disponíveis para este revendedor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link href={`/revendedores/${params.id}/financeiro`}>
                <DollarSign className="h-4 w-4 mr-2" />
                Ver Financeiro
              </Link>
            </Button>
            <Button variant="outline" className="text-destructive hover:text-destructive/90">
              <Trash className="h-4 w-4 mr-2" />
              Excluir Revendedor
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}