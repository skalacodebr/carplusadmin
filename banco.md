[
  {
    "database_schema": [
      {
        "table_name": "alturas",
        "columns": [
          {
            "column_name": "id",
            "data_type": "integer",
            "is_nullable": "NO",
            "column_default": "nextval('alturas_id_seq'::regclass)",
            "character_maximum_length": null
          },
          {
            "column_name": "tamanho_id",
            "data_type": "integer",
            "is_nullable": "NO",
            "column_default": null,
            "character_maximum_length": null
          },
          {
            "column_name": "valor",
            "data_type": "character varying",
            "is_nullable": "NO",
            "column_default": null,
            "character_maximum_length": 10
          },
          {
            "column_name": "created_at",
            "data_type": "timestamp without time zone",
            "is_nullable": "YES",
            "column_default": "now()",
            "character_maximum_length": null
          }
        ]
      },
      {
        "table_name": "calculo_usuarios",
        "columns": [
          {
            "column_name": "id",
            "data_type": "integer",
            "is_nullable": "NO",
            "column_default": "nextval('calculo_usuarios_id_seq'::regclass)",
            "character_maximum_length": null
          },
          {
            "column_name": "userid",
            "data_type": "integer",
            "is_nullable": "NO",
            "column_default": null,
            "character_maximum_length": null
          },
          {
            "column_name": "tamanho",
            "data_type": "character varying",
            "is_nullable": "YES",
            "column_default": null,
            "character_maximum_length": 20
          },
          {
            "column_name": "altura",
            "data_type": "character varying",
            "is_nullable": "YES",
            "column_default": null,
            "character_maximum_length": 20
          },
          {
            "column_name": "largura",
            "data_type": "character varying",
            "is_nullable": "YES",
            "column_default": null,
            "character_maximum_length": 20
          },
          {
            "column_name": "pacote",
            "data_type": "character varying",
            "is_nullable": "YES",
            "column_default": null,
            "character_maximum_length": 100
          },
          {
            "column_name": "resultado",
            "data_type": "text",
            "is_nullable": "YES",
            "column_default": null,
            "character_maximum_length": null
          },
          {
            "column_name": "cor",
            "data_type": "character varying",
            "is_nullable": "YES",
            "column_default": null,
            "character_maximum_length": 7
          },
          {
            "column_name": "created_at",
            "data_type": "timestamp without time zone",
            "is_nullable": "YES",
            "column_default": "now()",
            "character_maximum_length": null
          }
        ]
      },
      {
        "table_name": "carrinho_usuarios",
        "columns": [
          {
            "column_name": "id",
            "data_type": "integer",
            "is_nullable": "NO",
            "column_default": "nextval('carrinho_usuarios_id_seq'::regclass)",
            "character_maximum_length": null
          },
          {
            "column_name": "user_id",
            "data_type": "integer",
            "is_nullable": "NO",
            "column_default": null,
            "character_maximum_length": null
          },
          {
            "column_name": "produto_nome",
            "data_type": "character varying",
            "is_nullable": "NO",
            "column_default": null,
            "character_maximum_length": 100
          },
          {
            "column_name": "quantidade",
            "data_type": "integer",
            "is_nullable": "YES",
            "column_default": "5",
            "character_maximum_length": null
          },
          {
            "column_name": "imagem",
            "data_type": "text",
            "is_nullable": "YES",
            "column_default": null,
            "character_maximum_length": null
          },
          {
            "column_name": "created_at",
            "data_type": "timestamp without time zone",
            "is_nullable": "YES",
            "column_default": "now()",
            "character_maximum_length": null
          },
          {
            "column_name": "updated_at",
            "data_type": "timestamp without time zone",
            "is_nullable": "YES",
            "column_default": "now()",
            "character_maximum_length": null
          }
        ]
      },
      {
        "table_name": "clientes",
        "columns": [
          {
            "column_name": "id",
            "data_type": "integer",
            "is_nullable": "NO",
            "column_default": "nextval('clientes_id_seq'::regclass)",
            "character_maximum_length": null
          },
          {
            "column_name": "revendedor_id",
            "data_type": "integer",
            "is_nullable": "NO",
            "column_default": null,
            "character_maximum_length": null
          },
          {
            "column_name": "cliente_id",
            "data_type": "integer",
            "is_nullable": "NO",
            "column_default": null,
            "character_maximum_length": null
          },
          {
            "column_name": "created_at",
            "data_type": "timestamp without time zone",
            "is_nullable": "YES",
            "column_default": "now()",
            "character_maximum_length": null
          }
        ]
      },
      {
        "table_name": "larguras",
        "columns": [
          {
            "column_name": "id",
            "data_type": "integer",
            "is_nullable": "NO",
            "column_default": "nextval('larguras_id_seq'::regclass)",
            "character_maximum_length": null
          },
          {
            "column_name": "altura_id",
            "data_type": "integer",
            "is_nullable": "NO",
            "column_default": null,
            "character_maximum_length": null
          },
          {
            "column_name": "valor",
            "data_type": "character varying",
            "is_nullable": "NO",
            "column_default": null,
            "character_maximum_length": 10
          },
          {
            "column_name": "created_at",
            "data_type": "timestamp without time zone",
            "is_nullable": "YES",
            "column_default": "now()",
            "character_maximum_length": null
          }
        ]
      },
      {
        "table_name": "notificacoes",
        "columns": [
          {
            "column_name": "id",
            "data_type": "integer",
            "is_nullable": "NO",
            "column_default": "nextval('notificacoes_id_seq'::regclass)",
            "character_maximum_length": null
          },
          {
            "column_name": "usuario_id",
            "data_type": "integer",
            "is_nullable": "NO",
            "column_default": null,
            "character_maximum_length": null
          },
          {
            "column_name": "pedido_id",
            "data_type": "integer",
            "is_nullable": "YES",
            "column_default": null,
            "character_maximum_length": null
          },
          {
            "column_name": "titulo",
            "data_type": "character varying",
            "is_nullable": "NO",
            "column_default": null,
            "character_maximum_length": 255
          },
          {
            "column_name": "mensagem",
            "data_type": "text",
            "is_nullable": "NO",
            "column_default": null,
            "character_maximum_length": null
          },
          {
            "column_name": "tipo",
            "data_type": "character varying",
            "is_nullable": "YES",
            "column_default": "'info'::character varying",
            "character_maximum_length": 50
          },
          {
            "column_name": "lida",
            "data_type": "boolean",
            "is_nullable": "YES",
            "column_default": "false",
            "character_maximum_length": null
          },
          {
            "column_name": "created_at",
            "data_type": "timestamp with time zone",
            "is_nullable": "YES",
            "column_default": "CURRENT_TIMESTAMP",
            "character_maximum_length": null
          },
          {
            "column_name": "updated_at",
            "data_type": "timestamp with time zone",
            "is_nullable": "YES",
            "column_default": "CURRENT_TIMESTAMP",
            "character_maximum_length": null
          }
        ]
      },
      {
        "table_name": "pacotes",
        "columns": [
          {
            "column_name": "id",
            "data_type": "integer",
            "is_nullable": "NO",
            "column_default": "nextval('pacotes_id_seq'::regclass)",
            "character_maximum_length": null
          },
          {
            "column_name": "preco",
            "data_type": "numeric",
            "is_nullable": "NO",
            "column_default": "0",
            "character_maximum_length": null
          },
          {
            "column_name": "cor",
            "data_type": "character varying",
            "is_nullable": "YES",
            "column_default": null,
            "character_maximum_length": 7
          },
          {
            "column_name": "imagem",
            "data_type": "text",
            "is_nullable": "YES",
            "column_default": null,
            "character_maximum_length": null
          },
          {
            "column_name": "descricao",
            "data_type": "text",
            "is_nullable": "YES",
            "column_default": null,
            "character_maximum_length": null
          },
          {
            "column_name": "estoque",
            "data_type": "integer",
            "is_nullable": "YES",
            "column_default": "0",
            "character_maximum_length": null
          },
          {
            "column_name": "ativo",
            "data_type": "boolean",
            "is_nullable": "YES",
            "column_default": "true",
            "character_maximum_length": null
          },
          {
            "column_name": "created_at",
            "data_type": "timestamp without time zone",
            "is_nullable": "YES",
            "column_default": "now()",
            "character_maximum_length": null
          },
          {
            "column_name": "largura_id",
            "data_type": "integer",
            "is_nullable": "YES",
            "column_default": null,
            "character_maximum_length": null
          },
          {
            "column_name": "status",
            "data_type": "character varying",
            "is_nullable": "YES",
            "column_default": "'ativo'::character varying",
            "character_maximum_length": 20
          }
        ]
      },
      {
        "table_name": "pedido_historico_status",
        "columns": [
          {
            "column_name": "id",
            "data_type": "integer",
            "is_nullable": "NO",
            "column_default": "nextval('pedido_historico_status_id_seq'::regclass)",
            "character_maximum_length": null
          },
          {
            "column_name": "pedido_id",
            "data_type": "integer",
            "is_nullable": "NO",
            "column_default": null,
            "character_maximum_length": null
          },
          {
            "column_name": "status_anterior",
            "data_type": "character varying",
            "is_nullable": "YES",
            "column_default": null,
            "character_maximum_length": 50
          },
          {
            "column_name": "status_novo",
            "data_type": "character varying",
            "is_nullable": "NO",
            "column_default": null,
            "character_maximum_length": 50
          },
          {
            "column_name": "observacao",
            "data_type": "text",
            "is_nullable": "YES",
            "column_default": null,
            "character_maximum_length": null
          },
          {
            "column_name": "updated_by",
            "data_type": "integer",
            "is_nullable": "YES",
            "column_default": null,
            "character_maximum_length": null
          },
          {
            "column_name": "created_at",
            "data_type": "timestamp without time zone",
            "is_nullable": "YES",
            "column_default": "now()",
            "character_maximum_length": null
          },
          {
            "column_name": "pagamento_id",
            "data_type": "text",
            "is_nullable": "YES",
            "column_default": null,
            "character_maximum_length": null
          }
        ]
      },
      {
        "table_name": "pedido_itens",
        "columns": [
          {
            "column_name": "id",
            "data_type": "integer",
            "is_nullable": "NO",
            "column_default": "nextval('pedido_itens_id_seq'::regclass)",
            "character_maximum_length": null
          },
          {
            "column_name": "pedido_id",
            "data_type": "integer",
            "is_nullable": "NO",
            "column_default": null,
            "character_maximum_length": null
          },
          {
            "column_name": "pacote_id",
            "data_type": "integer",
            "is_nullable": "YES",
            "column_default": null,
            "character_maximum_length": null
          },
          {
            "column_name": "produto_nome",
            "data_type": "character varying",
            "is_nullable": "YES",
            "column_default": null,
            "character_maximum_length": 100
          },
          {
            "column_name": "qtd",
            "data_type": "integer",
            "is_nullable": "NO",
            "column_default": "1",
            "character_maximum_length": null
          },
          {
            "column_name": "quantidade",
            "data_type": "integer",
            "is_nullable": "YES",
            "column_default": null,
            "character_maximum_length": null
          },
          {
            "column_name": "valor_unitario",
            "data_type": "numeric",
            "is_nullable": "NO",
            "column_default": null,
            "character_maximum_length": null
          },
          {
            "column_name": "preco_unitario",
            "data_type": "numeric",
            "is_nullable": "YES",
            "column_default": null,
            "character_maximum_length": null
          },
          {
            "column_name": "revendedor_id",
            "data_type": "integer",
            "is_nullable": "YES",
            "column_default": null,
            "character_maximum_length": null
          },
          {
            "column_name": "created_at",
            "data_type": "timestamp without time zone",
            "is_nullable": "YES",
            "column_default": "now()",
            "character_maximum_length": null
          }
        ]
      },
      {
        "table_name": "pedidos",
        "columns": [
          {
            "column_name": "id",
            "data_type": "integer",
            "is_nullable": "NO",
            "column_default": "nextval('pedidos_id_seq'::regclass)",
            "character_maximum_length": null
          },
          {
            "column_name": "numero",
            "data_type": "character varying",
            "is_nullable": "YES",
            "column_default": null,
            "character_maximum_length": 50
          },
          {
            "column_name": "cliente_id",
            "data_type": "integer",
            "is_nullable": "NO",
            "column_default": null,
            "character_maximum_length": null
          },
          {
            "column_name": "revendedor_id",
            "data_type": "integer",
            "is_nullable": "NO",
            "column_default": null,
            "character_maximum_length": null
          },
          {
            "column_name": "total",
            "data_type": "numeric",
            "is_nullable": "YES",
            "column_default": "0",
            "character_maximum_length": null
          },
          {
            "column_name": "frete",
            "data_type": "numeric",
            "is_nullable": "YES",
            "column_default": "0",
            "character_maximum_length": null
          },
          {
            "column_name": "valor_total",
            "data_type": "numeric",
            "is_nullable": "NO",
            "column_default": null,
            "character_maximum_length": null
          },
          {
            "column_name": "tipo_entrega",
            "data_type": "character varying",
            "is_nullable": "YES",
            "column_default": "'retirada'::character varying",
            "character_maximum_length": 20
          },
          {
            "column_name": "pagamento_tipo",
            "data_type": "character varying",
            "is_nullable": "YES",
            "column_default": "'cartao'::character varying",
            "character_maximum_length": 30
          },
          {
            "column_name": "status",
            "data_type": "character varying",
            "is_nullable": "YES",
            "column_default": "'pendente'::character varying",
            "character_maximum_length": 20
          },
          {
            "column_name": "status_detalhado",
            "data_type": "character varying",
            "is_nullable": "YES",
            "column_default": "'aguardando_preparacao'::character varying",
            "character_maximum_length": 50
          },
          {
            "column_name": "repasse_status",
            "data_type": "character varying",
            "is_nullable": "YES",
            "column_default": "'pendente'::character varying",
            "character_maximum_length": 20
          },
          {
            "column_name": "data_estimada_entrega",
            "data_type": "timestamp without time zone",
            "is_nullable": "YES",
            "column_default": null,
            "character_maximum_length": null
          },
          {
            "column_name": "data_entrega_real",
            "data_type": "timestamp without time zone",
            "is_nullable": "YES",
            "column_default": null,
            "character_maximum_length": null
          },
          {
            "column_name": "observacoes_revendedor",
            "data_type": "text",
            "is_nullable": "YES",
            "column_default": null,
            "character_maximum_length": null
          },
          {
            "column_name": "dados_adicionais",
            "data_type": "jsonb",
            "is_nullable": "YES",
            "column_default": null,
            "character_maximum_length": null
          },
          {
            "column_name": "created_at",
            "data_type": "timestamp without time zone",
            "is_nullable": "YES",
            "column_default": "now()",
            "character_maximum_length": null
          },
          {
            "column_name": "updated_at",
            "data_type": "timestamp without time zone",
            "is_nullable": "YES",
            "column_default": "now()",
            "character_maximum_length": null
          },
          {
            "column_name": "pagamento_id",
            "data_type": "text",
            "is_nullable": "YES",
            "column_default": null,
            "character_maximum_length": null
          }
        ]
      },
      {
        "table_name": "repasse_itens",
        "columns": [
          {
            "column_name": "id",
            "data_type": "integer",
            "is_nullable": "NO",
            "column_default": "nextval('repasse_itens_id_seq'::regclass)",
            "character_maximum_length": null
          },
          {
            "column_name": "repasse_id",
            "data_type": "integer",
            "is_nullable": "NO",
            "column_default": null,
            "character_maximum_length": null
          },
          {
            "column_name": "pedido_id",
            "data_type": "integer",
            "is_nullable": "NO",
            "column_default": null,
            "character_maximum_length": null
          },
          {
            "column_name": "valor_repassado",
            "data_type": "numeric",
            "is_nullable": "NO",
            "column_default": null,
            "character_maximum_length": null
          },
          {
            "column_name": "created_at",
            "data_type": "timestamp without time zone",
            "is_nullable": "YES",
            "column_default": "now()",
            "character_maximum_length": null
          }
        ]
      },
      {
        "table_name": "repasses",
        "columns": [
          {
            "column_name": "id",
            "data_type": "integer",
            "is_nullable": "NO",
            "column_default": "nextval('repasses_id_seq'::regclass)",
            "character_maximum_length": null
          },
          {
            "column_name": "revendedor_id",
            "data_type": "integer",
            "is_nullable": "NO",
            "column_default": null,
            "character_maximum_length": null
          },
          {
            "column_name": "valor_total",
            "data_type": "numeric",
            "is_nullable": "NO",
            "column_default": null,
            "character_maximum_length": null
          },
          {
            "column_name": "pedidos",
            "data_type": "ARRAY",
            "is_nullable": "YES",
            "column_default": null,
            "character_maximum_length": null
          },
          {
            "column_name": "transferencia_id",
            "data_type": "character varying",
            "is_nullable": "YES",
            "column_default": null,
            "character_maximum_length": 255
          },
          {
            "column_name": "metodo_pagamento",
            "data_type": "character varying",
            "is_nullable": "YES",
            "column_default": null,
            "character_maximum_length": 50
          },
          {
            "column_name": "comprovante_url",
            "data_type": "text",
            "is_nullable": "YES",
            "column_default": null,
            "character_maximum_length": null
          },
          {
            "column_name": "observacoes",
            "data_type": "text",
            "is_nullable": "YES",
            "column_default": null,
            "character_maximum_length": null
          },
          {
            "column_name": "status",
            "data_type": "character varying",
            "is_nullable": "YES",
            "column_default": "'pendente'::character varying",
            "character_maximum_length": 20
          },
          {
            "column_name": "data_repasse",
            "data_type": "timestamp without time zone",
            "is_nullable": "YES",
            "column_default": null,
            "character_maximum_length": null
          },
          {
            "column_name": "created_at",
            "data_type": "timestamp without time zone",
            "is_nullable": "YES",
            "column_default": "now()",
            "character_maximum_length": null
          },
          {
            "column_name": "updated_at",
            "data_type": "timestamp without time zone",
            "is_nullable": "YES",
            "column_default": "now()",
            "character_maximum_length": null
          }
        ]
      },
      {
        "table_name": "revendedor_estoque",
        "columns": [
          {
            "column_name": "id",
            "data_type": "integer",
            "is_nullable": "NO",
            "column_default": "nextval('revendedor_estoque_id_seq'::regclass)",
            "character_maximum_length": null
          },
          {
            "column_name": "revendedor_id",
            "data_type": "integer",
            "is_nullable": "NO",
            "column_default": null,
            "character_maximum_length": null
          },
          {
            "column_name": "pacote_id",
            "data_type": "integer",
            "is_nullable": "NO",
            "column_default": null,
            "character_maximum_length": null
          },
          {
            "column_name": "produto",
            "data_type": "character varying",
            "is_nullable": "YES",
            "column_default": null,
            "character_maximum_length": 100
          },
          {
            "column_name": "quantidade",
            "data_type": "integer",
            "is_nullable": "YES",
            "column_default": "0",
            "character_maximum_length": null
          },
          {
            "column_name": "preco",
            "data_type": "numeric",
            "is_nullable": "YES",
            "column_default": null,
            "character_maximum_length": null
          },
          {
            "column_name": "status",
            "data_type": "character varying",
            "is_nullable": "YES",
            "column_default": "'ativo'::character varying",
            "character_maximum_length": 20
          },
          {
            "column_name": "updated_at",
            "data_type": "timestamp without time zone",
            "is_nullable": "YES",
            "column_default": "now()",
            "character_maximum_length": null
          }
        ]
      },
      {
        "table_name": "revendedores",
        "columns": [
          {
            "column_name": "id",
            "data_type": "integer",
            "is_nullable": "NO",
            "column_default": "nextval('revendedores_id_seq'::regclass)",
            "character_maximum_length": null
          },
          {
            "column_name": "usuario_id",
            "data_type": "integer",
            "is_nullable": "NO",
            "column_default": null,
            "character_maximum_length": null
          },
          {
            "column_name": "loja",
            "data_type": "character varying",
            "is_nullable": "YES",
            "column_default": null,
            "character_maximum_length": 150
          },
          {
            "column_name": "cidade",
            "data_type": "character varying",
            "is_nullable": "YES",
            "column_default": null,
            "character_maximum_length": 100
          },
          {
            "column_name": "uf",
            "data_type": "character varying",
            "is_nullable": "YES",
            "column_default": null,
            "character_maximum_length": 2
          },
          {
            "column_name": "rua",
            "data_type": "character varying",
            "is_nullable": "YES",
            "column_default": null,
            "character_maximum_length": 200
          },
          {
            "column_name": "complemento",
            "data_type": "character varying",
            "is_nullable": "YES",
            "column_default": null,
            "character_maximum_length": 100
          },
          {
            "column_name": "vendas",
            "data_type": "integer",
            "is_nullable": "YES",
            "column_default": "0",
            "character_maximum_length": null
          },
          {
            "column_name": "frete",
            "data_type": "numeric",
            "is_nullable": "YES",
            "column_default": "0",
            "character_maximum_length": null
          },
          {
            "column_name": "status",
            "data_type": "boolean",
            "is_nullable": "YES",
            "column_default": "true",
            "character_maximum_length": null
          },
          {
            "column_name": "created_at",
            "data_type": "timestamp without time zone",
            "is_nullable": "YES",
            "column_default": "now()",
            "character_maximum_length": null
          },
          {
            "column_name": "updated_at",
            "data_type": "timestamp without time zone",
            "is_nullable": "YES",
            "column_default": "now()",
            "character_maximum_length": null
          },
          {
            "column_name": "chave_pix",
            "data_type": "text",
            "is_nullable": "YES",
            "column_default": null,
            "character_maximum_length": null
          },
          {
            "column_name": "chave_tipo",
            "data_type": "text",
            "is_nullable": "YES",
            "column_default": null,
            "character_maximum_length": null
          }
        ]
      },
      {
        "table_name": "tamanhos",
        "columns": [
          {
            "column_name": "id",
            "data_type": "integer",
            "is_nullable": "NO",
            "column_default": "nextval('tamanhos_id_seq'::regclass)",
            "character_maximum_length": null
          },
          {
            "column_name": "nome",
            "data_type": "character varying",
            "is_nullable": "NO",
            "column_default": null,
            "character_maximum_length": 50
          },
          {
            "column_name": "created_at",
            "data_type": "timestamp without time zone",
            "is_nullable": "YES",
            "column_default": "now()",
            "character_maximum_length": null
          }
        ]
      },
      {
        "table_name": "usuarios",
        "columns": [
          {
            "column_name": "id",
            "data_type": "integer",
            "is_nullable": "NO",
            "column_default": "nextval('usuarios_id_seq'::regclass)",
            "character_maximum_length": null
          },
          {
            "column_name": "nome",
            "data_type": "character varying",
            "is_nullable": "NO",
            "column_default": null,
            "character_maximum_length": 100
          },
          {
            "column_name": "sobrenome",
            "data_type": "character varying",
            "is_nullable": "YES",
            "column_default": null,
            "character_maximum_length": 100
          },
          {
            "column_name": "email",
            "data_type": "character varying",
            "is_nullable": "NO",
            "column_default": null,
            "character_maximum_length": 150
          },
          {
            "column_name": "senha",
            "data_type": "character varying",
            "is_nullable": "NO",
            "column_default": null,
            "character_maximum_length": 255
          },
          {
            "column_name": "telefone",
            "data_type": "character varying",
            "is_nullable": "YES",
            "column_default": null,
            "character_maximum_length": 20
          },
          {
            "column_name": "cpf",
            "data_type": "character varying",
            "is_nullable": "YES",
            "column_default": null,
            "character_maximum_length": 14
          },
          {
            "column_name": "tipo",
            "data_type": "character varying",
            "is_nullable": "YES",
            "column_default": "'cliente'::character varying",
            "character_maximum_length": 20
          },
          {
            "column_name": "foto",
            "data_type": "text",
            "is_nullable": "YES",
            "column_default": null,
            "character_maximum_length": null
          },
          {
            "column_name": "cep",
            "data_type": "character varying",
            "is_nullable": "YES",
            "column_default": null,
            "character_maximum_length": 10
          },
          {
            "column_name": "rua",
            "data_type": "character varying",
            "is_nullable": "YES",
            "column_default": null,
            "character_maximum_length": 200
          },
          {
            "column_name": "numero",
            "data_type": "character varying",
            "is_nullable": "YES",
            "column_default": null,
            "character_maximum_length": 10
          },
          {
            "column_name": "complemento",
            "data_type": "character varying",
            "is_nullable": "YES",
            "column_default": null,
            "character_maximum_length": 100
          },
          {
            "column_name": "bairro",
            "data_type": "character varying",
            "is_nullable": "YES",
            "column_default": null,
            "character_maximum_length": 100
          },
          {
            "column_name": "cidade",
            "data_type": "character varying",
            "is_nullable": "YES",
            "column_default": null,
            "character_maximum_length": 100
          },
          {
            "column_name": "uf",
            "data_type": "character varying",
            "is_nullable": "YES",
            "column_default": null,
            "character_maximum_length": 2
          },
          {
            "column_name": "created_at",
            "data_type": "timestamp without time zone",
            "is_nullable": "YES",
            "column_default": "now()",
            "character_maximum_length": null
          },
          {
            "column_name": "updated_at",
            "data_type": "timestamp without time zone",
            "is_nullable": "YES",
            "column_default": "now()",
            "character_maximum_length": null
          }
        ]
      }
    ]
  }
]