-- Adicionar coluna de status de repasse na tabela pedidos
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS repasse_status VARCHAR DEFAULT 'pendente';

-- Criar tabela para registrar os repasses
CREATE TABLE IF NOT EXISTS repasses (
  id SERIAL PRIMARY KEY,
  revendedor_id INT NOT NULL REFERENCES usuarios(id),
  valor_total NUMERIC NOT NULL,
  data_repasse TIMESTAMP NOT NULL DEFAULT NOW(),
  metodo_pagamento VARCHAR,
  comprovante_url TEXT,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Criar tabela para registrar os itens de repasse (pedidos incluídos em cada repasse)
CREATE TABLE IF NOT EXISTS repasse_itens (
  id SERIAL PRIMARY KEY,
  repasse_id INT NOT NULL REFERENCES repasses(id),
  pedido_id INT NOT NULL REFERENCES pedidos(id),
  valor_repassado NUMERIC NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
