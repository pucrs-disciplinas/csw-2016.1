import { orderInputSchema } from "../../src/models/order";

const validInput = {
  items: [
    {
      productId: "11111111-1111-1111-1111-111111111111",
      quantity: 2
    }
  ]
};

describe("orderInputSchema", () => {
  it("valida um pedido com itens corretamente", () => {
    const result = orderInputSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("rejeita pedido sem itens", () => {
    const result = orderInputSchema.safeParse({ items: [] });
    expect(result.success).toBe(false);
  });

  it("rejeita productId invalido", () => {
    const result = orderInputSchema.safeParse({
      items: [{ productId: "abc", quantity: 2 }]
    });
    expect(result.success).toBe(false);
  });

  it("rejeita quantity menor que 1", () => {
    const result = orderInputSchema.safeParse({
      items: [{ productId: "11111111-1111-1111-1111-111111111111", quantity: 0 }]
    });
    expect(result.success).toBe(false);
  });
});
