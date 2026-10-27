import { Pool, types } from "pg";

// The database stores Singapore wall-clock times in `timestamp without time zone`
// columns. Tag them with +08:00 so they mean the same instant no matter which
// timezone the server (Vercel runs in UTC) or the browser is in.
types.setTypeParser(1114, (value) => `${value.replace(" ", "T")}+08:00`);
// Keep plain dates as "YYYY-MM-DD" instead of shifting them through a Date.
types.setTypeParser(1082, (value) => value);

declare global {
  // Reuse one pool across hot reloads and warm serverless invocations.
  var __pgPool: Pool | undefined;
}

function createPool() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({
    ...(connectionString
      ? { connectionString }
      : {
          host: process.env.DB_HOSTNAME,
          user: process.env.DB_USERNAME,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_DATABASE,
          port: Number(process.env.DB_PORT) || 5432,
        }),
    ssl: process.env.DB_SSL === "false" ? false : { rejectUnauthorized: false },
    max: 3,
  });

  // CURRENT_DATE, LOCALTIMESTAMP and ::date casts all use Singapore time.
  pool.on("connect", (client) => {
    client.query("SET TIME ZONE 'Asia/Singapore'").catch(() => {});
  });

  return pool;
}

const pool = globalThis.__pgPool ?? createPool();
globalThis.__pgPool = pool;

export default pool;
