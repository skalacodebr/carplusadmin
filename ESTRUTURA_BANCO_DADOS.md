# Estrutura do Banco de Dados - CarPlus (Completa)

## Visão Geral
O sistema CarPlus utiliza Supabase como banco de dados PostgreSQL compartilhado entre os projetos **Admin** e **Revendedor**. A estrutura está organizada em tabelas principais que gerenciam usuários, revendedores, pedidos, pacotes, estoque e repasses financeiros.

## Projetos que Compartilham o Banco
- **CarPlus Admin**: Interface administrativa para gestão de revendedores e repasses
- **CarPlus Revendedor**: Sistema para revendedores gerenciarem pedidos e clientes

## Tabelas Principais

### 1. **usuarios**
Tabela central que armazena todos os usuários do sistema (administradores, revendedores e clientes).

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INT | Chave primária |
| nome | VARCHAR | Nome do usuário |
| sobrenome | VARCHAR | Sobrenome do usuário |
| email | VARCHAR | Email único |
| telefone | VARCHAR | Telefone de contato |
| senha | VARCHAR | Senha criptografada (SHA-256) |
| tipo | VARCHAR | Tipo: 'admin', 'revendedor' ou 'cliente' |
| foto | TEXT | URL da foto do perfil |
| cep | VARCHAR | CEP do endereço |
| rua | VARCHAR | Rua do endereço |
| numero | VARCHAR | Número do endereço |
| complemento | VARCHAR | Complemento do endereço |
| bairro | VARCHAR | Bairro |
| cidade | VARCHAR | Cidade |
| uf | VARCHAR | Estado (UF) |
| created_at | TIMESTAMP | Data de criação |

### 2. **revendedores**
Informações específicas dos revendedores, relacionada com usuarios.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INT | Chave primária |
| usuario_id | INT | FK para usuarios.id |
| loja | VARCHAR | Nome da loja do revendedor |
| cidade | VARCHAR | Cidade de atuação |
| uf | VARCHAR | Estado de atuação |
| rua | VARCHAR | Endereço da loja |
| complemento | VARCHAR | Complemento do endereço |
| vendas | INT | Contador de vendas realizadas |
| frete | NUMERIC | Valor padrão do frete |
| status | BOOLEAN | Status ativo/inativo |

### 3. **pacotes**
Catálogo de pacotes/produtos disponíveis para venda.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INT | Chave primária |
| nome | VARCHAR | Nome do pacote |
| preco | NUMERIC | Preço do pacote |
| cor | VARCHAR | Cor do pacote (hexadecimal) |
| imagem | TEXT | URL da imagem do pacote |

### 4. **pedidos**
Registros de todos os pedidos realizados.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INT | Chave primária |
| numero | VARCHAR | Número único do pedido |
| revendedor_id | INT | FK para usuarios.id (revendedor) |
| cliente_id | INT | FK para usuarios.id (cliente) |
| valor_total | NUMERIC | Valor total do pedido |
| frete | NUMERIC | Valor do frete |
| status | VARCHAR | Status: 'pendente', 'pago', etc |
| status_detalhado | VARCHAR | Status detalhado: 'entregue', 'retirado', etc |
| repasse_status | VARCHAR | Status do repasse: 'pendente', 'pago' |
| data_estimada_entrega | DATE | Data estimada de entrega |
| data_entrega_real | DATE | Data real de entrega |
| created_at | TIMESTAMP | Data de criação |

### 5. **pedido_itens**
Itens individuais de cada pedido.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INT | Chave primária |
| pedido_id | INT | FK para pedidos.id |
| pacote_id | INT | FK para pacotes.id |
| qtd | INT | Quantidade do item |

### 6. **repasses**
Registro de repasses financeiros aos revendedores.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | SERIAL | Chave primária |
| revendedor_id | INT | FK para usuarios.id |
| valor_total | NUMERIC | Valor total do repasse |
| data_repasse | TIMESTAMP | Data do repasse |
| metodo_pagamento | VARCHAR | Método de pagamento utilizado |
| comprovante_url | TEXT | URL do comprovante |
| observacoes | TEXT | Observações adicionais |
| created_at | TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | Data de atualização |

### 7. **repasse_itens**
Detalhamento dos pedidos incluídos em cada repasse.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | SERIAL | Chave primária |
| repasse_id | INT | FK para repasses.id |
| pedido_id | INT | FK para pedidos.id |
| valor_repassado | NUMERIC | Valor repassado do pedido |
| created_at | TIMESTAMP | Data de criação |

### 8. **revendedor_estoque**
Controle de estoque por revendedor (específico do projeto Revendedor).

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INT | Chave primária |
| revendedor_id | INT | FK para usuarios.id |
| pacote_id | INT | FK para pacotes.id |
| quantidade | INT | Quantidade em estoque |
| updated_at | TIMESTAMP | Data de atualização |

### 9. **clientes**
Relacionamento entre revendedores e clientes (específico do projeto Revendedor).

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INT | Chave primária |
| revendedor_id | INT | FK para usuarios.id |
| cliente_id | INT | FK para usuarios.id |
| created_at | TIMESTAMP | Data de criação |

## Relacionamentos

### Principais Relações:
1. **usuarios** → **revendedores**: 1:1 (quando tipo = 'revendedor')
2. **usuarios** → **pedidos**: 1:N (através de revendedor_id e cliente_id)
3. **pedidos** → **pedido_itens**: 1:N
4. **pacotes** → **pedido_itens**: 1:N
5. **usuarios** → **repasses**: 1:N (através de revendedor_id)
6. **repasses** → **repasse_itens**: 1:N
7. **pedidos** → **repasse_itens**: 1:N
8. **revendedores** → **revendedor_estoque**: 1:N
9. **pacotes** → **revendedor_estoque**: 1:N
10. **usuarios** → **clientes**: 1:N (revendedor-cliente)

## Fluxo de Dados

### 1. Cadastro de Revendedor:
- Cria registro em `usuarios` com tipo='revendedor'
- Cria registro correspondente em `revendedores`

### 2. Realização de Pedido:
- Cria registro em `pedidos` com revendedor_id e cliente_id
- Cria registros em `pedido_itens` para cada pacote
- Atualiza `revendedor_estoque` se aplicável

### 3. Repasse Financeiro:
- Pedidos com status='pago' e status_detalhado IN ('entregue', 'retirado')
- Pedidos com repasse_status='pendente' são elegíveis
- Ao realizar repasse:
  - Cria registro em `repasses`
  - Cria registros em `repasse_itens` para cada pedido incluído
  - Atualiza repasse_status='pago' nos pedidos

### 4. Gestão de Estoque (Projeto Revendedor):
- Controle individual por revendedor em `revendedor_estoque`
- Redução automática de estoque ao realizar pedidos

### 5. Relacionamento Cliente-Revendedor:
- Registro em `clientes` para vincular cliente ao revendedor
- Facilita gestão e histórico de vendas

## Observações Técnicas

### Autenticação:
- Senhas armazenadas com hash SHA-256
- Login no Admin restrito a usuários com tipo='admin'
- Login no Revendedor restrito a usuários com tipo='revendedor'

### Storage:
- Bucket 'images' no Supabase Storage
- Pasta 'revendedor_images/' para fotos de perfil

### Campos Calculados:
- Total de vendas por revendedor
- Total pendente de repasse
- Vendas por pacote
- Estoque por revendedor por pacote

### Campos Importantes por Projeto:
**Admin:**
- Controle de status de repasse
- Valores monetários para repasses
- Status detalhado de pedidos

**Revendedor:**
- Controle de estoque individual
- Relacionamento cliente-revendedor
- Datas de entrega estimada e real

## Índices Recomendados
- usuarios.email (único)
- usuarios.tipo
- revendedores.usuario_id
- pedidos.revendedor_id
- pedidos.cliente_id
- pedidos.repasse_status
- pedidos.status
- pedidos.status_detalhado
- pedido_itens.pedido_id
- pedido_itens.pacote_id
- repasse_itens.repasse_id
- revendedor_estoque.revendedor_id
- revendedor_estoque.pacote_id
- clientes.revendedor_id
- clientes.cliente_id

## Resumo das Funcionalidades

### Projeto Admin:
- Gestão de revendedores (CRUD completo)
- Controle financeiro e repasses
- Dashboard com métricas de vendas
- Visualização de pacotes e preços

### Projeto Revendedor:
- Gestão de pedidos e clientes
- Controle de estoque individual
- Histórico de vendas
- Relacionamento cliente-revendedor