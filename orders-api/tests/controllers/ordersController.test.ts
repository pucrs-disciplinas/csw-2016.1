import { Request, Response } from "express";

import { createOrderController, getOrderByIdController } from "../../src/controllers/ordersController";
import { createOrder, getOrderById, OrderValidationError } from "../../src/services/orderService";

jest.mock("../../src/services/orderService", () => {
  const actual = jest.requireActual("../../src/services/orderService");

  return {
    ...actual,
    createOrder: jest.fn(),
    getOrderById: jest.fn()
  };
});

const mockCreateOrder = createOrder as jest.MockedFunction<typeof createOrder>;
const mockGetOrderById = getOrderById as jest.MockedFunction<typeof getOrderById>;

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
  status: "PENDING",
  createdAt: "2026-01-01T00:00:00.000Z",
  items: [{ productId: "11111111-1111-1111-1111-111111111111", quantity: 2 }]
};

const validBody = {
  items: [{ productId: "11111111-1111-1111-1111-111111111111", quantity: 2 }]
};

beforeEach(() => {
  jest.resetAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("createOrderController", () => {
  it("retorna 201 com o pedido criado quando o input e valido", async () => {
    mockCreateOrder.mockResolvedValueOnce(sampleProduct as never);
    const req = { body: validBody } as Request;
    const res = makeResMock();

    await createOrderController(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(sampleProduct);
  });

  it("retorna 400 quando o input e invalido", async () => {
    const req = { body: { name: "A" } } as Request;
    const res = makeResMock();

    await createOrderController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.any(String), errors: expect.any(Object) })
    );
  });

  it("retorna erro de negocio com status especifico", async () => {
    mockCreateOrder.mockRejectedValueOnce(new OrderValidationError("Sem estoque", 409));
    const req = { body: validBody } as Request;
    const res = makeResMock();

    await createOrderController(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Sem estoque" }));
  });

  it("retorna 500 quando o servico lanca um erro inesperado", async () => {
    mockCreateOrder.mockRejectedValueOnce(new Error("Internal error"));
    const req = { body: validBody } as Request;
    const res = makeResMock();

    await createOrderController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
  });
});

describe("getOrderByIdController", () => {
  it("retorna 200 quando encontra pedido", async () => {
    mockGetOrderById.mockResolvedValueOnce(sampleProduct as never);
    const req = { params: { id: "abc-123" } } as unknown as Request;
    const res = makeResMock();

    await getOrderByIdController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(sampleProduct);
  });

  it("retorna 404 quando nao encontra pedido", async () => {
    mockGetOrderById.mockResolvedValueOnce(null);
    const req = { params: { id: "nao-existe" } } as unknown as Request;
    const res = makeResMock();

    await getOrderByIdController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
  });

  it("retorna 500 quando ocorre erro inesperado", async () => {
    mockGetOrderById.mockRejectedValueOnce(new Error("Internal error"));
    const req = { params: { id: "abc-123" } } as unknown as Request;
    const res = makeResMock();

    await getOrderByIdController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
  });
});
