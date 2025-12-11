CREATE TABLE IF NOT EXISTS shows (
  id BIGSERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  total_seats INT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS seats (
  id BIGSERIAL PRIMARY KEY,
  show_id BIGINT NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
  seat_number INT NOT NULL,
  UNIQUE (show_id, seat_number)
);

-- Correct ENUM creation
DO $$
BEGIN
  BEGIN
    CREATE TYPE booking_status AS ENUM ('PENDING', 'CONFIRMED', 'FAILED');
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
END $$;

CREATE TABLE IF NOT EXISTS bookings (
  id BIGSERIAL PRIMARY KEY,
  show_id BIGINT NOT NULL REFERENCES shows(id),
  user_id TEXT,
  status booking_status NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS booking_seats (
  id BIGSERIAL PRIMARY KEY,
  booking_id BIGINT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  seat_id BIGINT NOT NULL REFERENCES seats(id),
  UNIQUE (seat_id)
);

CREATE INDEX IF NOT EXISTS idx_bookings_status_expires 
ON bookings(status, expires_at);

