# API de Pedidos - Loja de Pecas de Computador

Projeto de API REST de pedidos usando Node.js, TypeScript e SNS/SQS.
Ao criar um pedido, a API valida os produtos e estoque na `inventory-api` e publica um evento em um topico SNS com entrega para fila SQS via assinatura.

## Stack

- Node.js 20
- TypeScript
- Express
- AWS SDK v3 (SNS/SQS/DynamoDB)
- Docker + Docker Compose
- LocalStack (SNS/SQS/DynamoDB local)
- Bruno (.bru)

## Estrutura

```text
.
|-- bruno/
|   |-- environments/local.bru
|   |-- create-order.bru
|   |-- health-check.bru
|   `-- bruno.json
|-- localstack/init/01-create-orders-messaging.sh
|-- localstack/init/cloudformation/orders-messaging.yml
|-- src/
|   |-- app.ts
|   |-- server.ts
|   |-- controllers/
|   |   `-- ordersController.ts
|   |-- config/
|   |   |-- sns.ts
|   |   `-- env.ts
|   |-- models/
|   |   `-- order.ts
|   |-- services/
|   |   |-- inventoryService.ts
|   |   `-- orderService.ts
|   `-- routes/orders.ts
|-- Dockerfile
|-- docker-compose.yml
|-- package.json
`-- tsconfig.json
```

## Como subir o ambiente

1. Copie as variaveis de ambiente:

```bash
cp .env.example .env
```

2. Suba API + LocalStack:

```bash
docker compose up --build
```

Durante o bootstrap do LocalStack, o topico SNS e a fila SQS sao criados via CloudFormation.

A API ficara disponivel em `http://localhost:3001`.

Importante: a `inventory-api` deve estar rodando em `http://localhost:3000`, pois ela sera consultada para validar existencia e estoque dos produtos.

O LocalStack desta API fica publicado em `http://localhost:4567` para evitar conflito com a `inventory-api`.

## Endpoints

- `GET /health`
- `POST /orders`

## Exemplo de payload para criar pedido

```json
{
  "items": [
    {
      "productId": "11111111-1111-1111-1111-111111111111",
      "quantity": 2
    },
    {
      "productId": "22222222-2222-2222-2222-222222222222",
      "quantity": 1
    }
  ]
}
```

## Fluxo

1. Recebe `POST /orders` com lista de itens.
2. Consulta `GET /products/:id` na `inventory-api` para cada item.
3. Valida se produto existe e se `stock >= quantity`.
4. Publica evento `ORDER_CREATED` no topico SNS.
5. O topico entrega a mensagem para a fila SQS assinada.
6. O worker consome a fila e atualiza o estoque na `inventory-api`.

## Worker de pedidos

- Processo dedicado que le a fila `orders-created-queue`.
- Para cada item do pedido:
  - Busca o produto na `inventory-api`.
  - Calcula `stock - quantity`.
  - Atualiza via `PUT /products/:id`.

Com Docker Compose, o worker sobe junto com a API.

Sem Docker, rode em outro terminal:

```bash
npm run worker:dev
```

## Collection Bruno (.bru)

A collection esta na pasta `bruno/`.

Passos para usar:

1. Abra a pasta `bruno/` no Bruno.
2. Selecione o ambiente `local`.
3. Atualize a variavel `productId` com um id real da `inventory-api`.
4. Rode `Criar Pedido`.

## Desenvolvimento sem Docker (opcional)

Se quiser executar apenas a API localmente:

```bash
npm install
npm run dev
```

> Nesse caso, mantenha o LocalStack ativo para SNS/SQS e a `inventory-api` ativa.

## Lint

Para validar padrao de codigo com ESLint:

```bash
npm run lint
```

Para corrigir automaticamente problemas suportados:

```bash
npm run lint:fix
```
