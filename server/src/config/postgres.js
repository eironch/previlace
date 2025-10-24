import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  host: process.env.PG_HOST || "localhost",
  port: process.env.PG_PORT || 5432,
  database: process.env.PG_DATABASE || "civilearn",
  user: process.env.PG_USER || "postgres",
  password: process.env.PG_PASSWORD || "",
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on("error", (err) => {
  if (process.env.NODE_ENV === "development") {
    console.error("Unexpected PostgreSQL error:", err);
  }
  process.exit(-1);
});

async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === "development" && duration > 1000) {
      console.error("Slow query detected:", { text, duration, rows: res.rowCount });
    }
    return res;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Query error:", { text, error: error.message });
    }
    throw error;
  }
}

async function getClient() {
  const client = await pool.connect();
  const query = client.query;
  const release = client.release;

  const timeout = setTimeout(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("A client has been checked out for more than 5 seconds!");
    }
  }, 5000);

  client.query = (...args) => {
    return query.apply(client, args);
  };

  client.release = () => {
    clearTimeout(timeout);
    client.query = query;
    client.release = release;
    return release.apply(client);
  };

  return client;
}

async function checkConnection() {
  try {
    const result = await query("SELECT NOW()");
    return {
      isConnected: true,
      timestamp: result.rows[0].now,
    };
  } catch (error) {
    return {
      isConnected: false,
      error: error.message,
    };
  }
}

export { pool, query, getClient, checkConnection };
