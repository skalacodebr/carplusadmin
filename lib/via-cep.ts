// Interface para os dados retornados pela API ViaCEP
export interface ViaCepResponse {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  ibge: string
  gia: string
  ddd: string
  siafi: string
  erro?: boolean
}

// Função para buscar endereço pelo CEP
export async function fetchAddressByCep(cep: string): Promise<ViaCepResponse | null> {
  // Remover caracteres não numéricos do CEP
  const cleanCep = cep.replace(/\D/g, "")

  // Verificar se o CEP tem 8 dígitos
  if (cleanCep.length !== 8) {
    return null
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
    const data = await response.json()

    // Verificar se a API retornou erro
    if (data.erro) {
      return null
    }

    return data
  } catch (error) {
    console.error("Erro ao buscar CEP:", error)
    return null
  }
}
