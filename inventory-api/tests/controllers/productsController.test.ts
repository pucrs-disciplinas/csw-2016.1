import { Request, Response } from "express";

import {
  createProductController,
  listProductsController,
  getProductByIdController,
  updateProductByIdController,
  deleteProductByIdController
} from "../../src/controllers/productsController";

jest.mock("../../src/services/productService");

import {
  createProduct,
  listProducts,
  getProductById,
  updateProductById,
  deleteProductById
} from "../../src/services/productService";

const mockCreateProduct = createProduct as jest.MockedFunction<typeof createProduct>;
const mockListProducts = listProducts as jest.MockedFunction<typeof listProducts>;
const mockGetProductById = getProductById as jest.MockedFunction<typeof getProductById>;
const mockUpdateProductById = updateProductById as jest.MockedFunction<typeof updateProductById>;
const mockDeleteProductById = deleteProductById as jest.MockedFunction<typeof deleteProductById>;

function makeResMock() {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis()
  } as unknown as Response;
  return res;
}

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

const validBody = {
  name: "RTX 4090",
  sku: "GPU-RTX4090",
  brand: "NVIDIA",
  category: "GPU",
  price: 9999.99,
  stock: 5
};

beforeEach(() => {
  jest.resetAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// createProductController
// ---------------------------------------------------------------------------
describe("createProductController", () => {
  it("retorna 201 com o produto criado quando o input é válido", async () => {
    mockCreateProduct.mockResolvedValueOnce(sampleProduct);
    const req = { body: validBody } as Request;
    const res = makeResMock();

    await createProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(sampleProduct);
  });

  it("retorna 400 quando o input é inválido", async () => {
    const req = { body: { name: "A" } } as Request;
    const res = makeResMock();

    await createProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.any(String), errors: expect.any(Object) })
    );
  });

  it("retorna 500 quando o serviço lança um erro", async () => {
    mockCreateProduct.mockRejectedValueOnce(new Error("DB error"));
    const req = { body: validBody } as Request;
    const res = makeResMock();

    await createProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
  });
});

// ---------------------------------------------------------------------------
// listProductsController
// ---------------------------------------------------------------------------
describe("listProductsController", () => {
  it("retorna lista de produtos com status 200", async () => {
    mockListProducts.mockResolvedValueOnce([sampleProduct]);
    const req = {} as Request;
    const res = makeResMock();

    await listProductsController(req, res);

    expect(res.json).toHaveBeenCalledWith([sampleProduct]);
  });

  it("retorna array vazio quando não há produtos", async () => {
    mockListProducts.mockResolvedValueOnce([]);
    const req = {} as Request;
    const res = makeResMock();

    await listProductsController(req, res);

    expect(res.json).toHaveBeenCalledWith([]);
  });

  it("retorna 500 quando o serviço lança um erro", async () => {
    mockListProducts.mockRejectedValueOnce(new Error("Scan error"));
    const req = {} as Request;
    const res = makeResMock();

    await listProductsController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
  });
});

// ---------------------------------------------------------------------------
// getProductByIdController
// ---------------------------------------------------------------------------
describe("getProductByIdController", () => {
  it("retorna o produto quando encontrado", async () => {
    mockGetProductById.mockResolvedValueOnce(sampleProduct);
    const req = { params: { id: "abc-123" } } as unknown as Request;
    const res = makeResMock();

    await getProductByIdController(req, res);

    expect(res.json).toHaveBeenCalledWith(sampleProduct);
  });

  it("retorna 404 quando o produto não existe", async () => {
    mockGetProductById.mockResolvedValueOnce(null);
    const req = { params: { id: "inexistente" } } as unknown as Request;
    const res = makeResMock();

    await getProductByIdController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
  });

  it("retorna 500 quando o serviço lança um erro", async () => {
    mockGetProductById.mockRejectedValueOnce(new Error("Get error"));
    const req = { params: { id: "abc-123" } } as unknown as Request;
    const res = makeResMock();

    await getProductByIdController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
  });
});

// ---------------------------------------------------------------------------
// updateProductByIdController
// ---------------------------------------------------------------------------
describe("updateProductByIdController", () => {
  it("retorna o produto atualizado com status 200", async () => {
    const updated = { ...sampleProduct, price: 7999.99 };
    mockUpdateProductById.mockResolvedValueOnce(updated);
    const req = { params: { id: "abc-123" }, body: { price: 7999.99 } } as unknown as Request;
    const res = makeResMock();

    await updateProductByIdController(req, res);

    expect(res.json).toHaveBeenCalledWith(updated);
  });

  it("retorna 400 quando o input de atualização é inválido", async () => {
    const req = { params: { id: "abc-123" }, body: { price: -1 } } as unknown as Request;
    const res = makeResMock();

    await updateProductByIdController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.any(String), errors: expect.any(Object) })
    );
  });

  it("retorna 404 quando o serviço retorna null", async () => {
    mockUpdateProductById.mockResolvedValueOnce(null);
    const req = { params: { id: "abc-123" }, body: { price: 100 } } as unknown as Request;
    const res = makeResMock();

    await updateProductByIdController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("retorna 404 quando lança ConditionalCheckFailedException", async () => {
    const error = Object.assign(new Error("Not found"), {
      name: "ConditionalCheckFailedException"
    });
    mockUpdateProductById.mockRejectedValueOnce(error);
    const req = { params: { id: "inexistente" }, body: { price: 100 } } as unknown as Request;
    const res = makeResMock();

    await updateProductByIdController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("retorna 500 para erros genéricos do serviço", async () => {
    mockUpdateProductById.mockRejectedValueOnce(new Error("Update error"));
    const req = { params: { id: "abc-123" }, body: { price: 100 } } as unknown as Request;
    const res = makeResMock();

    await updateProductByIdController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ---------------------------------------------------------------------------
// deleteProductByIdController
// ---------------------------------------------------------------------------
describe("deleteProductByIdController", () => {
  it("retorna 204 quando o produto é deletado com sucesso", async () => {
    mockDeleteProductById.mockResolvedValueOnce(true);
    const req = { params: { id: "abc-123" } } as unknown as Request;
    const res = makeResMock();

    await deleteProductByIdController(req, res);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it("retorna 404 quando lança ConditionalCheckFailedException", async () => {
    const error = Object.assign(new Error("Not found"), {
      name: "ConditionalCheckFailedException"
    });
    mockDeleteProductById.mockRejectedValueOnce(error);
    const req = { params: { id: "inexistente" } } as unknown as Request;
    const res = makeResMock();

    await deleteProductByIdController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
  });

  it("retorna 500 para erros genéricos do serviço", async () => {
    mockDeleteProductById.mockRejectedValueOnce(new Error("Delete error"));
    const req = { params: { id: "abc-123" } } as unknown as Request;
    const res = makeResMock();

    await deleteProductByIdController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
  });
});
