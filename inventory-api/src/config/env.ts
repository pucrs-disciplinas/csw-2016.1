import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  APP_PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  AWS_REGION: z.string().min(1).default("us-east-1"),
  AWS_ACCESS_KEY_ID: z.string().min(1).default("test"),
  AWS_SECRET_ACCESS_KEY: z.string().min(1).default("test"),
  DYNAMODB_ENDPOINT: z.string().url().optional(),
  DYNAMODB_TABLE_NAME: z.string().min(1).default("products")
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Erro ao validar variaveis de ambiente:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
