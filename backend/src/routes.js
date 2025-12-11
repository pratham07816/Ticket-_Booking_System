// src/routes.js
import express from 'express';
import db from './db.js';

const router = express.Router();

// Admin: create show
router.post('/admin/shows', async (req, res) => {
  const { name, type, start_time, total_seats } = req.body;
  if (!name || !type || !start_time) return res.status(400).json({ error: 'Missing fields' });
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const insertShow = 'INSERT INTO shows (name, type, start_time, total_seats) VALUES ($1,$2,$3,$4) RETURNING id';
    const r = await client.query(insertShow, [name, type, start_time, total_seats || null]);
    const showId = r.rows[0].id;
    if (total_seats && Number(total_seats) > 0) {
      const seatSql = 'INSERT INTO seats (show_id, seat_number) SELECT $1, generate_series(1, $2)';
      await client.query(seatSql, [showId, total_seats]);
    }
    await client.query('COMMIT');
    res.status(201).json({ id: showId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// List shows
router.get('/shows', async (req, res) => {
  const r = await db.query('SELECT id, name, type, start_time, total_seats FROM shows ORDER BY start_time');
  res.json(r.rows);
});

// Seats for a show
router.get('/shows/:id/seats', async (req, res) => {
  const showId = req.params.id;
  const seats = await db.query(
    `SELECT s.id, s.seat_number,
      CASE WHEN bs.id IS NULL THEN false ELSE true END as booked
     FROM seats s
     LEFT JOIN booking_seats bs ON bs.seat_id = s.id
     LEFT JOIN bookings b ON b.id = bs.booking_id AND b.status = 'CONFIRMED'
     WHERE s.show_id = $1
     ORDER BY s.seat_number`,
    [showId]
  );
  res.json(seats.rows);
});

// Book seats
router.post('/book', async (req, res) => {
  const { showId, userId, seatNumbers } = req.body;
  if (!showId || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
    return res.status(400).json({ error: 'Invalid payload' });
  }
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);
    const insertBookingText = `
      INSERT INTO bookings (show_id, user_id, status, expires_at)
      VALUES ($1, $2, 'PENDING', $3)
      RETURNING id
    `;
    const bookingRes = await client.query(insertBookingText, [showId, userId || null, expiresAt]);
    const bookingId = bookingRes.rows[0].id;

    const seatQuery = `
      SELECT id, seat_number
      FROM seats
      WHERE show_id = $1 AND seat_number = ANY($2)
      FOR UPDATE
    `;
    const seatRowsRes = await client.query(seatQuery, [showId, seatNumbers]);
    if (seatRowsRes.rows.length !== seatNumbers.length) {
      await client.query('ROLLBACK');
      await db.query('UPDATE bookings SET status=$1 WHERE id=$2', ['FAILED', bookingId]);
      return res.status(400).json({ error: 'One or more seats invalid' });
    }

    const insertSeatText = 'INSERT INTO booking_seats (booking_id, seat_id) VALUES ($1, $2)';
    for (const seatRow of seatRowsRes.rows) {
      try {
        await client.query(insertSeatText, [bookingId, seatRow.id]);
      } catch (err) {
        await client.query('ROLLBACK');
        await db.query('UPDATE bookings SET status=$1 WHERE id=$2', ['FAILED', bookingId]);
        return res.status(409).json({ error: `Seat ${seatRow.seat_number} already booked` });
      }
    }

    await client.query('UPDATE bookings SET status=$1, updated_at = now() WHERE id=$2', ['CONFIRMED', bookingId]);
    await client.query('COMMIT');
    res.status(201).json({ bookingId, status: 'CONFIRMED' });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Booking error', err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// Booking status
router.get('/bookings/:id', async (req, res) => {
  const id = req.params.id;
  const r = await db.query('SELECT id, show_id, status, created_at, expires_at FROM bookings WHERE id=$1', [id]);
  if (r.rows.length === 0) return res.status(404).json({ error: 'Not found' });
  res.json(r.rows[0]);
});

export default router; // ✅ make it ES module compatible
