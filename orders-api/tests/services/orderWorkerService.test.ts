import { sqsClient } from "../../src/config/sqs";
import { processOrdersQueueOnce } from "../../src/services/orderWorkerService";

const mockSqsSend = sqsClient.send as jest.MockedFunction<typeof sqsClient.send>;

describe("processOrdersQueueOnce", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    global.fetch = jest.fn();
  });

  it("processa mensagem de pedido e atualiza estoque na inventory-api", async () => {
    mockSqsSend
      .mockResolvedValueOnce({
        Messages: [
          {
            Body: JSON.stringify({
              Message: JSON.stringify({
                orderId: "order-1",
                createdAt: "2026-03-26T12:00:00.000Z",
                items: [{ productId: "11111111-1111-1111-1111-111111111111", quantity: 2 }]
              })
            }),
            ReceiptHandle: "receipt-1"
          }
        ]
      } as never)
      .mockResolvedValueOnce({} as never);

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ id: "11111111-1111-1111-1111-111111111111", name: "GPU", stock: 10 })
      })
      .mockResolvedValueOnce({ ok: true, status: 200 });

    await processOrdersQueueOnce("http://localhost:4566/queue/orders-created-queue");

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch).toHaveBeenLastCalledWith(
      "http://localhost:3000/products/11111111-1111-1111-1111-111111111111",
      expect.objectContaining({
        method: "PUT"
      })
    );
    expect(mockSqsSend).toHaveBeenCalledTimes(2);
  });

  it("nao remove mensagem quando processamento falha", async () => {
    mockSqsSend.mockResolvedValueOnce({
      Messages: [
        {
          Body: JSON.stringify({
            Message: JSON.stringify({
              orderId: "order-2",
              createdAt: "2026-03-26T12:00:00.000Z",
              items: [{ productId: "11111111-1111-1111-1111-111111111111", quantity: 20 }]
            })
          }),
          ReceiptHandle: "receipt-2"
        }
      ]
    } as never);

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ id: "11111111-1111-1111-1111-111111111111", name: "GPU", stock: 5 })
    });

    await processOrdersQueueOnce("http://localhost:4566/queue/orders-created-queue");

    expect(mockSqsSend).toHaveBeenCalledTimes(1);
  });
});
