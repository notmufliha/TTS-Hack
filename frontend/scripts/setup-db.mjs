// Creates the mock EPIC tables and loads fake demo data.
// WARNING: drops and recreates the tables.
// Usage: npm run db:setup   (reads DATABASE_URL from the environment or .env.local)
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import pg from "pg";

const databaseDir = new URL("../../database/", import.meta.url);
const envFile = fileURLToPath(new URL("../.env.local", import.meta.url));

if (existsSync(envFile)) {
  const env = readFileSync(envFile, "utf8");
  for (const key of ["DATABASE_URL", "DB_SSL"]) {
    const match = env.match(new RegExp(`^${key}=["']?([^"'\\r\\n]+)`, "m"));
    if (match && !process.env[key]) process.env[key] = match[1];
  }
}
if (!process.env.DATABASE_URL) {
  console.error("Set DATABASE_URL first (environment or frontend/.env.local).");
  process.exit(1);
}

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === "false" ? false : { rejectUnauthorized: false },
});

await client.connect();
await client.query("SET TIME ZONE 'Asia/Singapore'");
for (const file of ["schema.sql", "seed.sql"]) {
  await client.query(readFileSync(new URL(file, databaseDir), "utf8"));
  console.log(`Ran ${file}`);
}
await client.end();
