// PostgreSQL config
import postgres from "pg";
const { Pool } = postgres;

const poolClient = new Pool({
  user: process.env.PG_USER ? process.env.PG_USER : "user1",
  host: process.env.PG_HOST ? process.env.PG_HOST : "localhost",
  database: process.env.PG_DATABASE ? process.env.PG_DATABASE : "mydatabase",
  password: process.env.PG_PASSWORD ? process.env.PG_PASSWORD : "password",
  port: process.env.PG_PORT ? process.env.PG_PORT : 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
export default poolClient;
