// index.js
import 'dotenv/config';           // load .env automatically
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import pkg from 'pg';
const { Pool } = pkg;

import db from './src/db.js';
import bookingRouter from './src/routes.js';

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api', bookingRouter);

// Test route
app.get('/', (req, res) => {
  res.send('Backend is running');
});

const port = process.env.PORT || 4000;

app.listen(port, async () => {
  console.log(`Server listening on port ${port}`);
  // Ensure tables
  try {
    await db.init();
    console.log('DB initialized');
  } catch (e) {
    console.error('DB init error', e);
  }
});
