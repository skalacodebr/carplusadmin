"use client"

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
import { Loader2 } from "lucide-react"

interface StatusConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  actionType: "aceitar" | "rejeitar" | "ativar" | "desativar" | null
  onConfirm: () => void
  isLoading?: boolean
}

export function StatusConfirmDialog({
  open,
  onOpenChange,
  actionType,
  onConfirm,
  isLoading = false,
}: StatusConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {actionType === "aceitar"
              ? "Aceitar revendedor?"
              : actionType === "rejeitar"
                ? "Rejeitar revendedor?"
                : actionType === "ativar"
                  ? "Ativar revendedor?"
                  : "Desativar revendedor?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {actionType === "aceitar"
              ? "Você está prestes a aprovar este revendedor. Isso permitirá que ele acesse a plataforma e comece a vender produtos."
              : actionType === "rejeitar"
                ? "Você está prestes a rejeitar este revendedor. Ele não poderá acessar a plataforma nem vender produtos."
                : actionType === "ativar"
                  ? "Você está prestes a ativar este revendedor. Ele poderá voltar a vender produtos na plataforma."
                  : "Você está prestes a desativar este revendedor. Ele não poderá vender produtos até ser ativado novamente."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={
              actionType === "aceitar" || actionType === "ativar"
                ? "bg-green-500 hover:bg-green-600"
                : "bg-yellow-500 hover:bg-yellow-600"
            }
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : actionType === "aceitar" ? (
              "Sim, aprovar"
            ) : actionType === "rejeitar" ? (
              "Sim, rejeitar"
            ) : actionType === "ativar" ? (
              "Sim, ativar"
            ) : (
              "Sim, desativar"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
