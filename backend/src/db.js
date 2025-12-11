// src/db.js (ES Module)
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function init() {
  await connectWithRetry();
  // You can add table creation logic here if needed
}

async function connectWithRetry(retries = 5, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.query('SELECT 1');
      console.log('DB connected');
      return pool;
    } catch (err) {
      console.log(`DB not ready, retrying in ${delay / 1000}s...`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error('Could not connect to DB');
}

export default {
  init,
  pool,
};


