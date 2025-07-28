"use client"

import { useState, useEffect, useRef } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Check, ChevronDown } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface ColorPickerProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

// Cores adicionais predefinidas
const additionalColors = [
  "#FF0000", // Vermelho
  "#00FF00", // Verde
  "#0000FF", // Azul
  "#FFFF00", // Amarelo
  "#FF00FF", // Magenta
  "#00FFFF", // Ciano
  "#FFA500", // Laranja
]

export function ColorPicker({ value, onChange, disabled = false }: ColorPickerProps) {
  const [color, setColor] = useState(value || "#000000")
  const [presetColors, setPresetColors] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Buscar cores existentes na tabela de pacotes
  useEffect(() => {
    async function fetchExistingColors() {
      try {
        setIsLoading(true)

        // Buscar cores distintas da tabela de pacotes
        const { data, error } = await supabase.from("pacotes").select("cor").not("cor", "is", null).order("cor")

        if (error) {
          console.error("Erro ao buscar cores:", error)
          return
        }

        // Extrair cores únicas
        const uniqueColors = Array.from(new Set(data.map((item) => item.cor))).filter(
          (cor) => cor && cor.startsWith("#"),
        ) // Garantir que são cores hexadecimais válidas

        // Combinar com cores adicionais
        const allColors = [...uniqueColors, ...additionalColors]

        // Remover duplicatas e limitar a 14 cores (7 existentes + 7 adicionais)
        const finalColors = Array.from(new Set(allColors)).slice(0, 14)

        setPresetColors(finalColors)
      } catch (error) {
        console.error("Erro ao buscar cores:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchExistingColors()
  }, [])

  useEffect(() => {
    setColor(value || "#000000")
  }, [value])

  const handleColorChange = (newColor: string) => {
    setColor(newColor)
    onChange(newColor)
  }

  const handlePresetColorClick = (presetColor: string) => {
    // Atualizar a cor selecionada
    handleColorChange(presetColor)

    // Não fechar o popover automaticamente para permitir mais seleções
    // O usuário pode fechar manualmente quando terminar
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-full justify-between", disabled && "opacity-50 cursor-not-allowed")}
          disabled={disabled}
        >
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full border" style={{ backgroundColor: color }} aria-hidden="true" />
            <span>{color}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="start">
        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center">
              <label htmlFor="color-input" className="text-sm font-medium">
                Selecionar cor
              </label>
              <input
                type="color"
                id="color-input"
                value={color}
                onChange={(e) => handleColorChange(e.target.value)}
                className="h-8 w-8 cursor-pointer"
                ref={inputRef}
              />
            </div>
            <input
              type="text"
              value={color}
              onChange={(e) => handleColorChange(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
              placeholder="#000000"
            />
          </div>
          <div>
            <div className="text-sm font-medium mb-2">Cores predefinidas</div>
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Carregando cores...</div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {presetColors.map((presetColor) => (
                  <button
                    key={presetColor}
                    type="button"
                    className="h-6 w-6 rounded-md border flex items-center justify-center"
                    style={{ backgroundColor: presetColor }}
                    onClick={() => handlePresetColorClick(presetColor)}
                    aria-label={`Selecionar cor ${presetColor}`}
                    title={presetColor}
                  >
                    {color.toLowerCase() === presetColor.toLowerCase() && (
                      <Check className="h-3 w-3 text-white stroke-width-3" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setOpen(false)}>
              Aplicar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
