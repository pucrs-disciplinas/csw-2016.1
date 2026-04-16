import express from "express";
import cors from "cors";
import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Pool } from "pg";

const app = express();
app.use(cors());
app.use(express.json());

const awsConfig = {
  region: process.env.AWS_REGION ?? "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "test",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "test",
  },
  ...(process.env.AWS_ENDPOINT ? { endpoint: process.env.AWS_ENDPOINT } : {}),
  forcePathStyle: true,
};

const s3 = new S3Client(awsConfig);
const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient(awsConfig));

const db = new Pool({
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT ?? 5432),
  database: process.env.DB_NAME ?? "appdb",
  user: process.env.DB_USER ?? "appuser",
  password: process.env.DB_PASSWORD ?? "apppassword",
});

const S3_BUCKET = process.env.S3_BUCKET ?? "app-files";
const DYNAMO_TABLE = process.env.DYNAMO_TABLE ?? "app-sessions";

async function initDb() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      price NUMERIC(10,2) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

// ── Health ────────────────────────────────────────────────────────────────────

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── RDS: Products ─────────────────────────────────────────────────────────────

app.get("/products", async (_req, res) => {
  const { rows } = await db.query("SELECT * FROM products ORDER BY id");
  res.json(rows);
});

app.post("/products", async (req, res) => {
  const { name, price } = req.body as { name: string; price: number };
  const { rows } = await db.query(
    "INSERT INTO products (name, price) VALUES ($1, $2) RETURNING *",
    [name, price]
  );
  res.status(201).json(rows[0]);
});

app.delete("/products/:id", async (req, res) => {
  await db.query("DELETE FROM products WHERE id = $1", [req.params.id]);
  res.status(204).end();
});

// ── DynamoDB: Sessions ────────────────────────────────────────────────────────

app.get("/sessions", async (_req, res) => {
  const result = await dynamo.send(new ScanCommand({ TableName: DYNAMO_TABLE }));
  res.json(result.Items ?? []);
});

app.post("/sessions", async (req, res) => {
  const session = {
    sessionId: `sess_${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  await dynamo.send(new PutCommand({ TableName: DYNAMO_TABLE, Item: session }));
  res.status(201).json(session);
});

app.get("/sessions/:id", async (req, res) => {
  const result = await dynamo.send(
    new GetCommand({ TableName: DYNAMO_TABLE, Key: { sessionId: req.params.id } })
  );
  if (!result.Item) return res.status(404).json({ error: "Not found" });
  res.json(result.Item);
});

// ── S3: Files ─────────────────────────────────────────────────────────────────

app.get("/files", async (_req, res) => {
  const result = await s3.send(new ListObjectsV2Command({ Bucket: S3_BUCKET }));
  const files = (result.Contents ?? []).map((obj) => ({
    key: obj.Key,
    size: obj.Size,
    lastModified: obj.LastModified,
  }));
  res.json(files);
});

app.post("/files/upload-url", async (req, res) => {
  const { filename, contentType } = req.body as { filename: string; contentType: string };
  const key = `uploads/${Date.now()}-${filename}`;
  const url = await getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: S3_BUCKET, Key: key, ContentType: contentType }),
    { expiresIn: 300 }
  );
  res.json({ url, key });
});

app.get("/files/:key(*)", async (req, res) => {
  const url = await getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: S3_BUCKET, Key: req.params.key }),
    { expiresIn: 300 }
  );
  res.json({ url });
});

// ─────────────────────────────────────────────────────────────────────────────

const PORT = Number(process.env.PORT ?? 3000);

initDb()
  .then(() => {
    app.listen(PORT, () => console.log(`Backend running on :${PORT}`));
  })
  .catch((err) => {
    console.error("DB init failed", err);
    process.exit(1);
  });
