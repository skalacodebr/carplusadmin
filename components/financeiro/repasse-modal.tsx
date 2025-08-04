"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { Loader2, CheckCircle2, Calendar, DollarSign, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Pedido {
  id: number;
  numero: string;
  valor_total: number;
  valor_repasse: number;
  created_at: string;
  status_detalhado: string;
  selected: boolean;
}

interface RevendedorFinanceiro {
  id: number;
  nome: string;
  loja: string;
  total_pendente: number;
  qtd_pedidos_pendentes: number;
  chave_pix: string;
  chave_tipo: string;
}

interface RepasseModalProps {
  revendedor: RevendedorFinanceiro;
  onClose: () => void;
  onComplete: () => void;
}

export function RepasseModal({
  revendedor,
  onClose,
  onComplete,
}: RepasseModalProps) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [metodoPagamento, setMetodoPagamento] = useState("PIX");
  const [observacoes, setObservacoes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectAll, setSelectAll] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [repasseRealizado, setRepasseRealizado] = useState<{
    valor: number;
    pedidos: number;
    transferId: string;
    data: string;
  } | null>(null);
  const { toast } = useToast();

  const totalSelecionado = pedidos
    .filter((pedido) => pedido.selected)
    .reduce((total, pedido) => total + pedido.valor_repasse, 0);

  useEffect(() => {
    fetchPedidosPendentes();
  }, []);

  async function fetchPedidosPendentes() {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("pedidos")
        .select("id, numero, valor_total, status_detalhado, created_at")
        .eq("revendedor_id", revendedor.id)
        .eq("repasse_status", "pendente")
        .eq("status", "pago")
        .in("status_detalhado", ["entregue", "retirado"])
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar pedidos pendentes:", error);
        return;
      }

      // Adicionar valor de repasse (100% do valor total) e marcar todos como selecionados
      const pedidosFormatados = data.map((pedido) => ({
        ...pedido,
        valor_repasse: pedido.valor_total, // 100% do valor total
        selected: true,
      }));

      setPedidos(pedidosFormatados);
    } catch (error) {
      console.error("Erro ao processar pedidos pendentes:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setPedidos(pedidos.map((pedido) => ({ ...pedido, selected: checked })));
  };

  const handleSelectPedido = (id: number, checked: boolean) => {
    const updatedPedidos = pedidos.map((pedido) =>
      pedido.id === id ? { ...pedido, selected: checked } : pedido
    );
    setPedidos(updatedPedidos);

    // Atualizar o estado do selectAll
    const allSelected = updatedPedidos.every((pedido) => pedido.selected);
    setSelectAll(allSelected);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const pedidosSelecionados = pedidos.filter((pedido) => pedido.selected);

      if (pedidosSelecionados.length === 0) {
        toast({
          title: "Nenhum pedido selecionado",
          description:
            "Selecione pelo menos um pedido para realizar o repasse.",
          variant: "destructive",
        });
        return;
      }

      if (!metodoPagamento) {
        toast({
          title: "Método de pagamento obrigatório",
          description:
            "Selecione o método de pagamento utilizado para o repasse.",
          variant: "destructive",
        });
        return;
      }

      // MODO SIMULAÇÃO: Transferência simulada para testes (sem integração com Asaas)
      // Para ativar integração real, descomente as linhas abaixo e remova a simulação:
      // import { createTransfer } from "@/lib/asaas";
      // const transferResponse = await createTransfer(transferData);
      
      const transferData = {
        value: totalSelecionado,
        operationType: "PIX" as const,
        pixAddressKey: revendedor.chave_pix,
        pixAddressKeyType: revendedor.chave_tipo,
        description: "Repasse de pedidos para " + revendedor.loja,
        scheduleDate: new Date().toISOString(),
      };
      
      console.log("🧪 SIMULAÇÃO: Transferência simulada:", transferData);
      
      // Simular resposta de sucesso do Asaas para teste
      const transferResponse = {
        id: `sim_transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: "PENDING",
        value: totalSelecionado,
        dateCreated: new Date().toISOString(),
        object: "transfer",
        simulacao: true // Flag para identificar que é simulação
      };

      // 1. Criar o registro de repasse
      const { data: repasseData, error: repasseError } = await supabase
        .from("repasses")
        .insert({
          revendedor_id: revendedor.id,
          valor_total: totalSelecionado,
          metodo_pagamento: metodoPagamento,
          observacoes: observacoes,
          pedidos: pedidosSelecionados.map((pedido) => pedido.id),
          transferencia_id: transferResponse.id,
        })
        .select("id")
        .single();

      if (repasseError) {
        console.error("Erro ao criar repasse:", repasseError);
        toast({
          title: "Erro ao criar repasse",
          description:
            "Ocorreu um erro ao registrar o repasse. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      const repasseId = repasseData.id;

      // 2. Criar os itens de repasse
      const repasseItens = pedidosSelecionados.map((pedido) => ({
        repasse_id: repasseId,
        pedido_id: pedido.id,
        valor_repassado: pedido.valor_repasse,
      }));

      const { error: itensError } = await supabase
        .from("repasse_itens")
        .insert(repasseItens);

      if (itensError) {
        console.error("Erro ao criar itens de repasse:", itensError);
        toast({
          title: "Erro ao registrar itens",
          description: "Ocorreu um erro ao registrar os itens do repasse.",
          variant: "destructive",
        });
        return;
      }

      // 3. Atualizar o status de repasse dos pedidos
      const pedidosIds = pedidosSelecionados.map((pedido) => pedido.id);
      console.log("Pedidos IDs para atualizar:", pedidosIds);

      const { error: updateError } = await supabase
        .from("pedidos")
        .update({ repasse_status: "pago" })
        .in("id", pedidosIds);

      if (updateError) {
        console.error("Erro ao atualizar status dos pedidos:", updateError);
        toast({
          title: "Erro ao atualizar pedidos",
          description: "Ocorreu um erro ao atualizar o status dos pedidos.",
          variant: "destructive",
        });
        return;
      }

      // Preparar dados do repasse realizado
      setRepasseRealizado({
        valor: totalSelecionado,
        pedidos: pedidosSelecionados.length,
        transferId: transferResponse.id,
        data: new Date().toISOString(),
      });

      // Mostrar modal de sucesso
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Erro ao processar repasse:", error);
      toast({
        title: "Erro ao processar repasse",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setRepasseRealizado(null);
    onComplete();
  };

  // Modal de sucesso do repasse
  if (showSuccessModal && repasseRealizado) {
    return (
      <Dialog open onOpenChange={handleSuccessModalClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <DialogTitle className="text-center text-xl">
              Repasse Realizado com Sucesso! 
            </DialogTitle>
            <DialogDescription className="text-center">
              🧪 <strong>Modo Simulação</strong> - O repasse foi registrado no sistema para testes
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-600">Revendedor:</span>
                </div>
                <span className="font-semibold">{revendedor.loja}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-600">Valor:</span>
                </div>
                <span className="font-semibold text-green-600 text-lg">
                  R$ {repasseRealizado.valor.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-600">Pedidos:</span>
                </div>
                <span className="font-semibold">{repasseRealizado.pedidos} pedidos</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-600">Data:</span>
                </div>
                <span className="font-semibold">
                  {new Date(repasseRealizado.data).toLocaleString("pt-BR")}
                </span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>ID da Transferência:</strong> {repasseRealizado.transferId}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Método: PIX • Chave: {revendedor.chave_pix}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              onClick={handleSuccessModalClose}
              className="w-full"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Realizar Repasse</DialogTitle>
          <DialogDescription>
            Registre o repasse financeiro para {revendedor.loja}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">{revendedor.loja}</h3>
              <p className="text-sm text-muted-foreground">{revendedor.nome}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total pendente</p>
              <p className="font-semibold text-lg">
                R${" "}
                {revendedor.total_pendente.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>

          <div className="border rounded-md p-3">
            <div className="flex items-center space-x-2 mb-3">
              <Checkbox
                id="select-all"
                checked={selectAll}
                onCheckedChange={handleSelectAll}
              />
              <Label htmlFor="select-all" className="font-medium">
                Selecionar todos os pedidos
              </Label>
            </div>

            <div className="max-h-[200px] overflow-y-auto space-y-2">
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : pedidos.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">
                  Nenhum pedido pendente encontrado
                </p>
              ) : (
                pedidos.map((pedido) => (
                  <div
                    key={pedido.id}
                    className="flex items-center justify-between border-b pb-2"
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`pedido-${pedido.id}`}
                        checked={pedido.selected}
                        onCheckedChange={(checked) =>
                          handleSelectPedido(pedido.id, !!checked)
                        }
                      />
                      <div>
                        <Label
                          htmlFor={`pedido-${pedido.id}`}
                          className="font-medium"
                        >
                          Pedido #{pedido.numero}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {new Date(pedido.created_at).toLocaleDateString(
                            "pt-BR"
                          )}{" "}
                          • {pedido.status_detalhado}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">
                        R${" "}
                        {pedido.valor_repasse.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Total: R${" "}
                        {pedido.valor_total.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="metodo-pagamento">Método de Pagamento</Label>
              <Input
                id="metodo-pagamento"
                type="text"
                value="PIX"
                onChange={() => setMetodoPagamento("PIX")}
                readOnly
              />
              <div className="text-sm text-muted-foreground">
                <p>
                  <strong>Tipo de Chave:</strong> {revendedor.chave_tipo}
                </p>
                <p>
                  <strong>Chave PIX:</strong> {revendedor.chave_pix}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Total a Repassar</Label>
              <div className="h-10 px-3 py-2 rounded-md border border-input bg-background text-lg font-semibold">
                R${" "}
                {totalSelecionado.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              placeholder="Informações adicionais sobre o repasse..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || totalSelecionado === 0}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando
              </>
            ) : (
              "Confirmar Repasse"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
