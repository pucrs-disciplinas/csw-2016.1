# API de Cadastro de Produtos - Loja de Pecas de Computador

Projeto de API REST para cadastro de produtos usando Node.js, TypeScript e DynamoDB.
Para ambiente de desenvolvimento, utiliza Docker Compose com LocalStack.

## Stack

- Node.js 20
- TypeScript
- Express
- AWS SDK v3 (DynamoDB)
- Docker + Docker Compose
- LocalStack (DynamoDB local)
- Bruno (.bru)

## Estrutura

```text
.
|-- bruno/
|   |-- environments/local.bru
|   |-- create-product.bru
|   |-- delete-product.bru
|   |-- get-product-by-id.bru
|   |-- health-check.bru
|   |-- list-products.bru
|   |-- update-product.bru
|   `-- bruno.json
|-- localstack/init/01-create-products-table.sh
|-- localstack/init/cloudformation/products-table.yml
|-- src/
|   |-- app.ts
|   |-- server.ts
|   |-- controllers/
|   |   `-- productsController.ts
|   |-- config/
|   |   |-- dynamo.ts
|   |   `-- env.ts
|   |-- models/
|   |   `-- product.ts
|   |-- services/
|   |   `-- productService.ts
|   `-- routes/products.ts
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

Durante o bootstrap do LocalStack, a tabela `products` e criada via CloudFormation.

A API ficara disponivel em `http://localhost:3000`.

## Endpoints

- `GET /health`
- `POST /products`
- `GET /products`
- `GET /products/:id`
- `PUT /products/:id`
- `DELETE /products/:id`

## Exemplo de payload para criar produto

```json
{
  "name": "Processador Ryzen 7 7800X3D",
  "sku": "CPU-AMD-7800X3D",
  "brand": "AMD",
  "category": "CPU",
  "price": 2599.9,
  "stock": 15,
  "description": "Processador gamer com excelente desempenho"
}
```

## Collection Bruno (.bru)

A collection esta na pasta `bruno/`.

Passos para usar:

1. Abra a pasta `bruno/` no Bruno.
2. Selecione o ambiente `local`.
3. Rode `Criar Produto` e copie o `id` retornado.
4. Atualize a variavel `productId` no ambiente `local.bru`.
5. Rode os requests de buscar, atualizar e deletar.

## Desenvolvimento sem Docker (opcional)

Se quiser executar apenas a API localmente:

```bash
npm install
npm run dev
```

> Nesse caso, mantenha o LocalStack ativo para o DynamoDB.

## Lint

Para validar padrao de codigo com ESLint:

```bash
npm run lint
```

Para corrigir automaticamente problemas suportados:

```bash
npm run lint:fix
```
# csw-2016.1
