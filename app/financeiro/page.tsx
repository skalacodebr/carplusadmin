"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  Download,
  Filter,
  Loader2,
  Search,
  UserCheck,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { RepasseModal } from "@/components/financeiro/repasse-modal";

interface RevendedorFinanceiro {
  id: number;
  nome: string;
  loja: string;
  total_pendente: number;
  qtd_pedidos_pendentes: number;
  chave_pix: string;
  chave_tipo: string;
}

export default function FinanceiroPage() {
  const [revendedores, setRevendedores] = useState<RevendedorFinanceiro[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showRepasseModal, setShowRepasseModal] = useState(false);
  const [selectedRevendedor, setSelectedRevendedor] =
    useState<RevendedorFinanceiro | null>(null);

  useEffect(() => {
    fetchRevendedoresFinanceiro();
  }, []);

  async function fetchRevendedoresFinanceiro() {
    try {
      setIsLoading(true);

      // Buscar revendedores com valores pendentes de repasse
      const { data: revendedoresData, error } = await supabase
        .from("usuarios")
        .select(
          `
        id,
        nome,
        revendedores!inner (
          loja,
          chave_pix,
          chave_tipo
        )
      `
        )
        .eq("tipo", "revendedor");

      if (error) {
        console.error("Erro ao buscar revendedores:", error);
        return;
      }

      console.log("Revendedores encontrados:", revendedoresData);

      // Para cada revendedor, buscar os pedidos pendentes de repasse
      const revendedoresComFinanceiro = await Promise.all(
        revendedoresData.map(async (revendedor) => {
          console.log(
            `\n=== Verificando revendedor ${revendedor.id} (${revendedor.nome}) ===`
          );

          // Primeiro, vamos ver TODOS os pedidos deste revendedor
          const { data: todosPedidos, error: todosPedidosError } =
            await supabase
              .from("pedidos")
              .select(
                "id, numero, valor_total, status, status_detalhado, repasse_status, created_at"
              )
              .eq("revendedor_id", revendedor.id)
              .order("created_at", { ascending: false });

          if (todosPedidosError) {
            console.error(
              `Erro ao buscar todos os pedidos do revendedor ${revendedor.id}:`,
              todosPedidosError
            );
          } else {
            console.log(
              `Total de pedidos do revendedor ${revendedor.id}:`,
              todosPedidos.length
            );
            todosPedidos.forEach((pedido) => {
              console.log(
                `  Pedido ${pedido.numero}: status="${pedido.status}", status_detalhado="${pedido.status_detalhado}", repasse_status="${pedido.repasse_status}", valor=${pedido.valor_total}`
              );
            });
          }

          // Agora buscar apenas os que atendem aos critérios
          const { data: pedidos, error: pedidosError } = await supabase
            .from("pedidos")
            .select("id, valor_total, status, status_detalhado, repasse_status")
            .eq("revendedor_id", revendedor.id)
            .eq("repasse_status", "pendente")
            .eq("status", "pago")
            .in("status_detalhado", ["entregue", "retirado"]);

          if (pedidosError) {
            console.error(
              `Erro ao buscar pedidos filtrados do revendedor ${revendedor.id}:`,
              pedidosError
            );
            return null;
          }

          console.log(
            `Pedidos que atendem aos critérios para revendedor ${revendedor.id}:`,
            pedidos.length
          );
          pedidos.forEach((pedido) => {
            console.log(`  Pedido elegível: valor=${pedido.valor_total}`);
          });

          // Calcular o total pendente
          const totalPendente = pedidos.reduce((sum, pedido) => {
            // Revendedor recebe 100% do valor total
            const valorRepasse = pedido.valor_total;
            return sum + valorRepasse;
          }, 0);

          console.log(
            `Total pendente para ${revendedor.nome}: R$ ${totalPendente}`
          );

          return {
            id: revendedor.id,
            nome: revendedor.nome,
            loja: revendedor.revendedores[0]?.loja || "Sem nome",
            total_pendente: totalPendente,
            qtd_pedidos_pendentes: pedidos.length,
            chave_pix: revendedor.revendedores[0]?.chave_pix || "",
            chave_tipo: revendedor.revendedores[0]?.chave_tipo || "",
          };
        })
      );

      // Filtrar revendedores nulos (caso tenha ocorrido algum erro)
      const revendedoresFiltrados = revendedoresComFinanceiro.filter(
        (r) => r !== null
      ) as RevendedorFinanceiro[];

      // Ordenar por valor pendente (maior para menor)
      revendedoresFiltrados.sort((a, b) => b.total_pendente - a.total_pendente);

      console.log("Resultado final:", revendedoresFiltrados);
      setRevendedores(revendedoresFiltrados);
    } catch (error) {
      console.error("Erro ao processar dados financeiros:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredRevendedores = revendedores.filter(
    (revendedor) =>
      revendedor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      revendedor.loja.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRepasseClick = (revendedor: RevendedorFinanceiro) => {
    setSelectedRevendedor(revendedor);
    setShowRepasseModal(true);
  };

  const handleRepasseComplete = () => {
    setShowRepasseModal(false);
    fetchRevendedoresFinanceiro(); // Atualizar a lista após um repasse
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
        <p className="text-muted-foreground">
          Gerencie os repasses financeiros para revendedores
        </p>
      </div>

      <Tabs defaultValue="pendentes" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="pendentes">Repasses Pendentes</TabsTrigger>
            <TabsTrigger value="historico">Histórico de Repasses</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtrar
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        <TabsContent value="pendentes" className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar revendedor..."
              className="h-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Repasses Pendentes</CardTitle>
              <CardDescription>
                Revendedores com valores pendentes de repasse de pedidos
                entregues
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredRevendedores.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm
                    ? "Nenhum revendedor encontrado"
                    : "Não há repasses pendentes"}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRevendedores.map((revendedor) => (
                    <div key={revendedor.id} className="border rounded-md p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-medium">{revendedor.loja}</h3>
                          <p className="text-sm text-muted-foreground">
                            {revendedor.nome}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-amber-50 text-amber-700 border-amber-200"
                        >
                          {revendedor.qtd_pedidos_pendentes} pedido
                          {revendedor.qtd_pedidos_pendentes !== 1
                            ? "s"
                            : ""}{" "}
                          pendente
                          {revendedor.qtd_pedidos_pendentes !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center">
                          <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                          <span className="font-semibold text-lg">
                            R${" "}
                            {revendedor.total_pendente.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/revendedores/${revendedor.id}`}>
                              Detalhes
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleRepasseClick(revendedor)}
                          >
                            <UserCheck className="h-4 w-4 mr-2" />
                            Realizar Repasse
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historico">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Repasses</CardTitle>
              <CardDescription>
                Registro de todos os repasses realizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HistoricoRepasses />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {showRepasseModal && selectedRevendedor && (
        <RepasseModal
          revendedor={selectedRevendedor}
          onClose={() => setShowRepasseModal(false)}
          onComplete={handleRepasseComplete}
        />
      )}
    </div>
  );
}

function HistoricoRepasses() {
  const [repasses, setRepasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchHistoricoRepasses() {
      try {
        setIsLoading(true);

        const { data, error } = await supabase
          .from("repasses")
          .select(
            `
            id,
            valor_total,
            data_repasse,
            metodo_pagamento,
            usuarios (nome, revendedores (loja))
          `
          )
          .order("data_repasse", { ascending: false });

        if (error) {
          console.error("Erro ao buscar histórico de repasses:", error);
          return;
        }

        setRepasses(data || []);
      } catch (error) {
        console.error("Erro ao processar histórico de repasses:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchHistoricoRepasses();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (repasses.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum repasse realizado até o momento
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {repasses.map((repasse: any) => (
        <div key={repasse.id} className="border rounded-md p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-medium">
                {repasse.usuarios.revendedores[0]?.loja || "Sem loja"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {repasse.usuarios.nome}
              </p>
            </div>
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200"
            >
              Repasse concluído
            </Badge>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div>
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                <span className="font-semibold text-lg">
                  R${" "}
                  {repasse.valor_total.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {new Date(repasse.data_repasse).toLocaleDateString("pt-BR")} •{" "}
                {repasse.metodo_pagamento}
              </p>
            </div>
            <Button variant="outline" size="sm">
              Ver Detalhes
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
