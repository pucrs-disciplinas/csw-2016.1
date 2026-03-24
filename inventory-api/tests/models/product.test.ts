import { productInputSchema, productUpdateSchema } from "../../src/models/product";

const validInput = {
  name: "RTX 4090",
  sku: "GPU-RTX4090",
  brand: "NVIDIA",
  category: "GPU",
  price: 9999.99,
  stock: 5,
  description: "Placa de vídeo de alta performance"
};

describe("productInputSchema", () => {
  it("valida um produto completo corretamente", () => {
    const result = productInputSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("valida um produto sem descrição (campo opcional)", () => {
    const { ...withoutDesc } = validInput;
    const result = productInputSchema.safeParse(withoutDesc);
    expect(result.success).toBe(true);
  });

  it("rejeita name com menos de 2 caracteres", () => {
    const result = productInputSchema.safeParse({ ...validInput, name: "A" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.name).toBeDefined();
    }
  });

  it("rejeita sku com menos de 2 caracteres", () => {
    const result = productInputSchema.safeParse({ ...validInput, sku: "X" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.sku).toBeDefined();
    }
  });

  it("rejeita brand com menos de 2 caracteres", () => {
    const result = productInputSchema.safeParse({ ...validInput, brand: "A" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.brand).toBeDefined();
    }
  });

  it("rejeita category com menos de 2 caracteres", () => {
    const result = productInputSchema.safeParse({ ...validInput, category: "G" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.category).toBeDefined();
    }
  });

  it("rejeita price negativo", () => {
    const result = productInputSchema.safeParse({ ...validInput, price: -1 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.price).toBeDefined();
    }
  });

  it("rejeita price igual a zero", () => {
    const result = productInputSchema.safeParse({ ...validInput, price: 0 });
    expect(result.success).toBe(false);
  });

  it("rejeita stock negativo", () => {
    const result = productInputSchema.safeParse({ ...validInput, stock: -1 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.stock).toBeDefined();
    }
  });

  it("aceita stock igual a zero", () => {
    const result = productInputSchema.safeParse({ ...validInput, stock: 0 });
    expect(result.success).toBe(true);
  });

  it("rejeita stock com número decimal", () => {
    const result = productInputSchema.safeParse({ ...validInput, stock: 1.5 });
    expect(result.success).toBe(false);
  });

  it("rejeita description com mais de 500 caracteres", () => {
    const result = productInputSchema.safeParse({
      ...validInput,
      description: "a".repeat(501)
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.description).toBeDefined();
    }
  });

  it("aceita description com exatamente 500 caracteres", () => {
    const result = productInputSchema.safeParse({
      ...validInput,
      description: "a".repeat(500)
    });
    expect(result.success).toBe(true);
  });

  it("rejeita campos ausentes obrigatórios", () => {
    const result = productInputSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("productUpdateSchema", () => {
  it("valida atualização com todos os campos", () => {
    const result = productUpdateSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("valida atualização com apenas um campo (partial)", () => {
    const result = productUpdateSchema.safeParse({ price: 4999.99 });
    expect(result.success).toBe(true);
  });

  it("valida objeto vazio (todos campos são opcionais)", () => {
    const result = productUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("rejeita price negativo mesmo em update", () => {
    const result = productUpdateSchema.safeParse({ price: -100 });
    expect(result.success).toBe(false);
  });

  it("rejeita name com menos de 2 caracteres em update", () => {
    const result = productUpdateSchema.safeParse({ name: "A" });
    expect(result.success).toBe(false);
  });
});
