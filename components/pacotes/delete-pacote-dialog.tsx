"use client"

import { useState } from "react"
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
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

interface Pacote {
  id: number
  descricao: string
}

interface DeletePacoteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pacote: Pacote
  onDeleted: () => void
}

export function DeletePacoteDialog({ open, onOpenChange, pacote, onDeleted }: DeletePacoteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const { error } = await supabase.from("pacotes").delete().eq("id", pacote.id)

      if (error) throw error

      toast({
        title: "Pacote excluído",
        description: "O pacote foi excluído com sucesso.",
      })

      onDeleted()
      onOpenChange(false)
    } catch (error: any) {
      console.error("Erro ao excluir pacote:", error)
      toast({
        title: "Erro ao excluir pacote",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Pacote</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir esta combinação do pacote {pacote.descricao}?
            <br />
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
