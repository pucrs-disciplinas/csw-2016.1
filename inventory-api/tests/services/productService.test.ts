import { dynamoDocClient } from "../../src/config/dynamo";
import {
  createProduct,
  listProducts,
  getProductById,
  updateProductById,
  deleteProductById
} from "../../src/services/productService";

const mockSend = dynamoDocClient.send as jest.MockedFunction<typeof dynamoDocClient.send>;

const sampleProduct = {
  id: "abc-123",
  name: "RTX 4090",
  sku: "GPU-RTX4090",
  brand: "NVIDIA",
  category: "GPU",
  price: 9999.99,
  stock: 5,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z"
};

const sampleInput = {
  name: "RTX 4090",
  sku: "GPU-RTX4090",
  brand: "NVIDIA",
  category: "GPU",
  price: 9999.99,
  stock: 5
};

beforeEach(() => {
  mockSend.mockReset();
});

describe("createProduct", () => {
  it("cria e retorna um produto com id e timestamps", async () => {
    mockSend.mockResolvedValueOnce({} as never);

    const result = await createProduct(sampleInput);

    expect(result.id).toBeDefined();
    expect(result.name).toBe(sampleInput.name);
    expect(result.sku).toBe(sampleInput.sku);
    expect(result.createdAt).toBeDefined();
    expect(result.updatedAt).toBeDefined();
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it("propaga erro do DynamoDB em caso de falha", async () => {
    mockSend.mockRejectedValueOnce(new Error("DynamoDB error") as never);

    await expect(createProduct(sampleInput)).rejects.toThrow("DynamoDB error");
  });

  it("lança ConditionalCheckFailedException quando o id já existe", async () => {
    const error = Object.assign(new Error("Conflict"), {
      name: "ConditionalCheckFailedException"
    });
    mockSend.mockRejectedValueOnce(error as never);

    await expect(createProduct(sampleInput)).rejects.toMatchObject({
      name: "ConditionalCheckFailedException"
    });
  });
});

describe("listProducts", () => {
  it("retorna lista de produtos", async () => {
    mockSend.mockResolvedValueOnce({ Items: [sampleProduct] } as never);

    const result = await listProducts();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(sampleProduct);
  });

  it("retorna array vazio quando não há produtos", async () => {
    mockSend.mockResolvedValueOnce({ Items: undefined } as never);

    const result = await listProducts();

    expect(result).toEqual([]);
  });

  it("propaga erro do DynamoDB em caso de falha", async () => {
    mockSend.mockRejectedValueOnce(new Error("Scan error") as never);

    await expect(listProducts()).rejects.toThrow("Scan error");
  });
});

describe("getProductById", () => {
  it("retorna o produto quando encontrado", async () => {
    mockSend.mockResolvedValueOnce({ Item: sampleProduct } as never);

    const result = await getProductById("abc-123");

    expect(result).toEqual(sampleProduct);
  });

  it("retorna null quando o produto não existe", async () => {
    mockSend.mockResolvedValueOnce({ Item: undefined } as never);

    const result = await getProductById("inexistente");

    expect(result).toBeNull();
  });

  it("propaga erro do DynamoDB em caso de falha", async () => {
    mockSend.mockRejectedValueOnce(new Error("Get error") as never);

    await expect(getProductById("abc-123")).rejects.toThrow("Get error");
  });
});

describe("updateProductById", () => {
  it("atualiza e retorna o produto atualizado", async () => {
    const updatedProduct = { ...sampleProduct, price: 7999.99 };
    mockSend.mockResolvedValueOnce({ Attributes: updatedProduct } as never);

    const result = await updateProductById("abc-123", { price: 7999.99 });

    expect(result).toEqual(updatedProduct);
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it("retorna null quando DynamoDB não retorna Attributes", async () => {
    mockSend.mockResolvedValueOnce({ Attributes: undefined } as never);

    const result = await updateProductById("abc-123", { price: 7999.99 });

    expect(result).toBeNull();
  });

  it("chama getProductById quando updateData está vazio", async () => {
    mockSend.mockResolvedValueOnce({ Item: sampleProduct } as never);

    const result = await updateProductById("abc-123", {});

    expect(result).toEqual(sampleProduct);
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it("lança ConditionalCheckFailedException quando o produto não existe", async () => {
    const error = Object.assign(new Error("Not found"), {
      name: "ConditionalCheckFailedException"
    });
    mockSend.mockRejectedValueOnce(error as never);

    await expect(updateProductById("inexistente", { price: 100 })).rejects.toMatchObject({
      name: "ConditionalCheckFailedException"
    });
  });
});

describe("deleteProductById", () => {
  it("deleta o produto e retorna true", async () => {
    mockSend.mockResolvedValueOnce({} as never);

    const result = await deleteProductById("abc-123");

    expect(result).toBe(true);
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it("lança ConditionalCheckFailedException quando o produto não existe", async () => {
    const error = Object.assign(new Error("Not found"), {
      name: "ConditionalCheckFailedException"
    });
    mockSend.mockRejectedValueOnce(error as never);

    await expect(deleteProductById("inexistente")).rejects.toMatchObject({
      name: "ConditionalCheckFailedException"
    });
  });

  it("propaga erro genérico do DynamoDB", async () => {
    mockSend.mockRejectedValueOnce(new Error("Delete error") as never);

    await expect(deleteProductById("abc-123")).rejects.toThrow("Delete error");
  });
});
