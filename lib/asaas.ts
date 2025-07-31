export interface AsaasTransfer {
  value: number;
  operationType: "PIX" | "TED";
  pixAddressKey: string;
  pixAddressKeyType: string;
  description: string;
  scheduleDate: string;
  bankAccount?: {
    bankCode: number; // Codigo do banco
    accountName: string; // Nome do banco
    ownerBirthDate: string; // Nascimento do proprietario da conta
    ownerName: string; // Nome do proprietario
    cpfCnpj: string; // Documento do proprietario
    agency: number; // Numero da agencia
    account: number; // Numero da conta
    accountDigit: number; // Digito da conta
    bankAccountType: string; // Tip de conta
  };
}

// Função para fazer requisições à API do Asaas
async function asaasRequest(endpoint: string, method = "POST", data?: any) {
  try {
    const response = await fetch("/api/asaas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint, method, data }),
    });
    console.log("Response:", response);
    const responseData = await response.json();
    return responseData;
  } catch (error: any) {
    console.error("Erro na requisição Asaas:", error);
    return { error: true, message: error.message };
  }
}

// Criar transferencia
export async function createTransfer(paymentData: AsaasTransfer): Promise<any> {
  try {
    console.log("Transferencia Data:", paymentData);
    return await asaasRequest("/transfers", "POST", paymentData);
  } catch (error: any) {
    console.error("Erro ao criar transferencia no Asaas:", error);
    throw error;
  }
}

// Função para formatar CPF/CNPJ (remover caracteres especiais)
export function formatCpfCnpj(cpfCnpj: string): string {
  return cpfCnpj.replace(/[^\d]/g, "");
}

// Função para formatar telefone (remover caracteres especiais)
export function formatPhone(phone: string): string {
  return phone.replace(/[^\d]/g, "");
}

// Função para formatar CEP (remover caracteres especiais)
export function formatCep(cep: string): string {
  return cep.replace(/[^\d]/g, "");
}
