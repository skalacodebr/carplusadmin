import { Card, CardContent } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-1/3 bg-muted rounded animate-pulse"></div>
      <div className="h-6 w-1/2 bg-muted rounded animate-pulse"></div>

      <div className="h-10 w-64 bg-muted rounded animate-pulse"></div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-8 w-1/3 bg-muted rounded animate-pulse"></div>
            <div className="h-6 w-1/4 bg-muted rounded animate-pulse"></div>
            <div className="h-64 w-full bg-muted rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
