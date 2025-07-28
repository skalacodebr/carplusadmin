import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
        <p className="text-muted-foreground">Gerencie os repasses financeiros para revendedores</p>
      </div>

      <Tabs defaultValue="pendentes" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="pendentes">Repasses Pendentes</TabsTrigger>
            <TabsTrigger value="historico">Histórico de Repasses</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>

        <TabsContent value="pendentes" className="space-y-4">
          <Skeleton className="h-9 w-full" />

          <Card>
            <CardHeader>
              <CardTitle>Repasses Pendentes</CardTitle>
              <CardDescription>Revendedores com valores pendentes de repasse de pedidos entregues</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="border rounded-md p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <Skeleton className="h-5 w-40 mb-2" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-6 w-24" />
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <Skeleton className="h-7 w-32" />
                        <div className="flex gap-2">
                          <Skeleton className="h-9 w-20" />
                          <Skeleton className="h-9 w-36" />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
