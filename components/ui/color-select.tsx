"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface ColorSelectProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

// Cores originais
const originalColors = [
  "#949698", // cinza
  "#69245d", // roxo
  "#459d6b", // verde
  "#f27127", // laranja
  "#e94e41", // vermelho
  "#e5b722", // amarelo
  "#004d8c", // azul
]

// Apenas 4 cores adicionais predefinidas
const additionalColors = [
  "#00FFFF", // Ciano
  "#FF00FF", // Magenta
  "#000000", // Preto
  "#8B4513", // Marrom
]

export function ColorSelect({ value, onChange, disabled = false }: ColorSelectProps) {
  const [allColors, setAllColors] = useState<string[]>([...originalColors, ...additionalColors])
  const [isLoading, setIsLoading] = useState(false)

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Selecione uma cor">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full border" style={{ backgroundColor: value }} />
            <span>{value}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm">Carregando cores...</span>
          </div>
        ) : (
          allColors.map((color) => (
            <SelectItem key={color} value={color}>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full border" style={{ backgroundColor: color }} />
                <span>{color}</span>
              </div>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  )
}
