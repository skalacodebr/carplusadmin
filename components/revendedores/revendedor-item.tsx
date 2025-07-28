"use client"

import { useState } from "react"
import { TableRow, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CheckCircle2, MoreHorizontal, Store, XCircle } from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { StatusConfirmDialog } from "./status-confirm-dialog"

export interface Revendedor {
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

interface RevendedorItemProps {
  revendedor: Revendedor
  onStatusChange: (id: number, isActive: boolean) => void
}

export function RevendedorItem({ revendedor, onStatusChange }: RevendedorItemProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<"aceitar" | "rejeitar" | "ativar" | "desativar" | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const openDialog = (type: "aceitar" | "rejeitar" | "ativar" | "desativar") => {
    setActionType(type)
    setDialogOpen(true)
  }

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      setIsUpdating(true)
      // Atualizar o status do revendedor no Supabase
      const { error } = await supabase
        .from("usuarios")
        .update({ tipo: newStatus === "ativo" ? "revendedor" : "inativo" })
        .eq("id", id)

      if (error) {
        console.error("Erro ao atualizar status:", error)
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o status do revendedor",
          variant: "destructive",
        })
        return
      }

      // Mostrar notificação de sucesso
      toast({
        title: newStatus === "ativo" ? "Revendedor aprovado!" : "Revendedor rejeitado",
        description:
          newStatus === "ativo" ? "O revendedor foi aprovado com sucesso." : "O pedido do revendedor foi rejeitado.",
        variant: newStatus === "ativo" ? "default" : "destructive",
      })
    } catch (error) {
      console.error("Erro ao processar mudança de status:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleActiveStatusChange = async (setActive: boolean) => {
    try {
      setIsUpdating(true)
      // Atualizar o status na tabela revendedores
      const { error } = await supabase
        .from("revendedores")
        .update({ status: setActive })
        .eq("usuario_id", revendedor.id)

      if (error) {
        console.error("Erro ao atualizar status do revendedor:", error)
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o status do revendedor",
          variant: "destructive",
        })
        return
      }

      // Notificar o componente pai sobre a mudança
      onStatusChange(revendedor.id, setActive)

      // Mostrar notificação de sucesso
      toast({
        title: setActive ? "Revendedor ativado!" : "Revendedor desativado",
        description: setActive ? "O revendedor foi ativado com sucesso." : "O revendedor foi desativado com sucesso.",
        variant: "default",
      })
    } catch (error) {
      console.error("Erro ao processar mudança de status:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const confirmAction = () => {
    if (actionType) {
      if (actionType === "aceitar" || actionType === "rejeitar") {
        handleStatusChange(revendedor.id, actionType === "aceitar" ? "ativo" : "inativo")
      } else if (actionType === "ativar" || actionType === "desativar") {
        handleActiveStatusChange(actionType === "ativar")
      }
    }
    setDialogOpen(false)
  }

  return (
    <>
      <TableRow className={!revendedor.isActive ? "opacity-70" : ""}>
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
          <Badge className={revendedor.isActive ? "bg-green-500 hover:bg-green-600" : "bg-yellow-500 hover:bg-yellow-600"}>
            {revendedor.isActive ? "Ativo" : "Inativo"}
          </Badge>

          {revendedor.status === "pendente" && (
            <div className="flex gap-1 mt-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                onClick={() => openDialog("aceitar")}
                disabled={isUpdating}
              >
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Aceitar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs text-yellow-600 border-yellow-200 hover:bg-yellow-50 hover:text-yellow-700"
                onClick={() => openDialog("rejeitar")}
                disabled={isUpdating}
              >
                <XCircle className="h-3 w-3 mr-1" />
                Rejeitar
              </Button>
            </div>
          )}
        </TableCell>
        <TableCell className="hidden md:table-cell">{revendedor.vendas}</TableCell>
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href={`/revendedores/${revendedor.id}`} className="w-full">
                  Ver detalhes
                </Link>
              </DropdownMenuItem>

              {revendedor.status === "pendente" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-green-600" onClick={() => openDialog("aceitar")}>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Aceitar pedido
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-yellow-600" onClick={() => openDialog("rejeitar")}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejeitar pedido
                  </DropdownMenuItem>
                </>
              )}

              {revendedor.status !== "pendente" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className={revendedor.isActive ? "text-yellow-600" : "text-green-600"}
                    onClick={() => openDialog(revendedor.isActive ? "desativar" : "ativar")}
                    disabled={isUpdating}
                  >
                    {revendedor.isActive ? (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Desativar
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Ativar
                      </>
                    )}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      <StatusConfirmDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        actionType={actionType}
        onConfirm={confirmAction}
        isLoading={isUpdating}
      />
    </>
  )
}
