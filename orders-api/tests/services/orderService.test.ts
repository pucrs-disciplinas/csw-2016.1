import { dynamoDocClient } from "../../src/config/dynamo";
import { snsClient } from "../../src/config/sns";
import { createOrder, getOrderById, updateOrderStatus } from "../../src/services/orderService";

const mockSnsSend = snsClient.send as jest.MockedFunction<typeof snsClient.send>;
const mockDynamoSend = dynamoDocClient.send as jest.MockedFunction<typeof dynamoDocClient.send>;

describe("createOrder", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    global.fetch = jest.fn();
  });

  it("valida estoque no inventory-api e publica no SNS", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ id: "11111111-1111-1111-1111-111111111111", name: "GPU", stock: 5 })
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ id: "22222222-2222-2222-2222-222222222222", name: "CPU", stock: 8 })
      });

    mockSnsSend.mockResolvedValue({ MessageId: "message-id" } as never);
    mockDynamoSend.mockResolvedValue({} as never);

    const result = await createOrder({
      items: [
        { productId: "11111111-1111-1111-1111-111111111111", quantity: 2 },
        { productId: "22222222-2222-2222-2222-222222222222", quantity: 1 }
      ]
    });

    expect(result.id).toBeDefined();
    expect(result.status).toBe("PENDING");
    expect(result.items).toHaveLength(2);
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(mockSnsSend).toHaveBeenCalledTimes(1);
    expect(mockDynamoSend).toHaveBeenCalledTimes(1);
  });

  it("retorna 404 quando produto nao existe", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 404 });

    await expect(
      createOrder({
        items: [{ productId: "11111111-1111-1111-1111-111111111111", quantity: 1 }]
      })
    ).rejects.toMatchObject({
      statusCode: 404
    });
  });

  it("retorna 409 quando nao ha estoque suficiente", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ id: "11111111-1111-1111-1111-111111111111", name: "GPU", stock: 1 })
    });

    await expect(
      createOrder({
        items: [{ productId: "11111111-1111-1111-1111-111111111111", quantity: 2 }]
      })
    ).rejects.toMatchObject({
      statusCode: 409
    });
  });

  it("agrega itens repetidos antes de validar estoque", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ id: "11111111-1111-1111-1111-111111111111", name: "GPU", stock: 3 })
    });

    mockSnsSend.mockResolvedValue({ MessageId: "message-id" } as never);
    mockDynamoSend.mockResolvedValue({} as never);

    const result = await createOrder({
      items: [
        { productId: "11111111-1111-1111-1111-111111111111", quantity: 1 },
        { productId: "11111111-1111-1111-1111-111111111111", quantity: 2 }
      ]
    });

    expect(result.items).toEqual([{ productId: "11111111-1111-1111-1111-111111111111", quantity: 3 }]);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(mockSnsSend).toHaveBeenCalledTimes(1);
    expect(mockDynamoSend).toHaveBeenCalledTimes(1);
  });

  it("retorna 502 quando inventory-api falha", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 500 });

    await expect(
      createOrder({
        items: [{ productId: "11111111-1111-1111-1111-111111111111", quantity: 1 }]
      })
    ).rejects.toMatchObject({
      statusCode: 502
    });
  });

  it("recupera pedido criado por id", async () => {
    const expected = {
      id: "id-1",
      status: "PENDING",
      createdAt: "2026-03-26T12:00:00.000Z",
      items: [{ productId: "11111111-1111-1111-1111-111111111111", quantity: 2 }]
    };

    mockDynamoSend.mockResolvedValueOnce({ Item: expected } as never);

    const loaded = await getOrderById("id-1");

    expect(loaded).toEqual(expected);
    expect(mockDynamoSend).toHaveBeenCalledTimes(1);
  });

  it("retorna null para id inexistente", async () => {
    mockDynamoSend.mockResolvedValueOnce({ Item: undefined } as never);

    const loaded = await getOrderById("00000000-0000-0000-0000-000000000000");

    expect(loaded).toBeNull();
    expect(mockDynamoSend).toHaveBeenCalledTimes(1);
  });

  it("atualiza status do pedido", async () => {
    mockDynamoSend.mockResolvedValueOnce({} as never);

    await updateOrderStatus("id-1", "PROCESSED");

    expect(mockDynamoSend).toHaveBeenCalledTimes(1);
  });
});
