import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';

type Seat = { id: number; seat_number: number; booked: boolean };
type Show = any;

export default function BookingPage() {
  const { id } = useParams();
  const [show, setShow] = useState<Show | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [status, setStatus] = useState('');

  const fetchShow = async () => {
    try {
      const r = await fetch((import.meta.env.VITE_API_URL ?? '') + `/api/shows/${id}`);
      const j = await r.json();
      setShow(j);
      if (j.type === 'movie') fetchSeats();
    } catch {}
  };

  const fetchSeats = async () => {
    if (!id) return;
    try {
      const r = await fetch((import.meta.env.VITE_API_URL ?? '') + `/api/shows/${id}/seats`);
      const j = await r.json();
      setSeats(j);
    } catch {}
  };

  useEffect(() => { fetchShow(); }, [id]);

  const toggleSeat = (s: Seat) => {
    if (s.booked) return;
    setSelected(prev => prev.includes(s.seat_number) ? prev.filter(x => x !== s.seat_number) : [...prev, s.seat_number]);
  };

  const submit = async () => {
    if (!show) return;
    setStatus('Booking...');
    let payload: any = { showId: Number(id), userId: 'human@example.com' };

    if (show.type === 'movie') {
      if (selected.length === 0) { setStatus('Select seats first'); return; }
      payload.seatNumbers = selected;
    }

    try {
      const r = await fetch((import.meta.env.VITE_API_URL ?? '') + '/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const j = await r.json();
      if (r.status === 201) {
        setStatus('Booking confirmed! ID: ' + j.bookingId);
        setSelected([]);
        if (show.type === 'movie') fetchSeats();
      } else setStatus('Failed: ' + (j.error ?? 'unknown'));
    } catch {
      setStatus('Network error');
    }
  };

  const seatGrid = useMemo(() => {
    if (!seats.length) return <div className="muted">Loading seats...</div>;
    return (
      <div className="seat-grid">
        {seats.map(s => (
          <div key={s.id} className={`seat ${s.booked ? 'booked' : ''} ${selected.includes(s.seat_number) ? 'selected' : ''}`}
               onClick={() => toggleSeat(s)}>
            {s.seat_number}
          </div>
        ))}
      </div>
    );
  }, [seats, selected]);

  if (!show) return <div className="muted">Loading show...</div>;

  return (
    <div className="card">
      <h2 className="header-1">Booking — {show.type.toUpperCase()}</h2>

      {show.type === 'movie' && (
        <>
          <p className="muted">Select your seats</p>
          {seatGrid}
        </>
      )}

      {show.type === 'bus' && (
        <>
          <p className="muted">Trip: {show.from} → {show.to} on {show.date}</p>
          <p className="muted">{show.available_buses} buses available. Click Confirm to book one.</p>
        </>
      )}

      {show.type === 'doctor' && (
        <>
          <p className="muted">Doctor: {show.doctor_name}</p>
          <p className="muted">Problem: {show.problem}</p>
          <p className="muted">Appointment time: {new Date(show.start_time).toLocaleString()}</p>
        </>
      )}

      <div style={{ marginTop: 12 }} className="flex">
        <button className="btn" onClick={submit}>
          Confirm Booking {show.type === 'movie' ? `(${selected.length})` : ''}
        </button>
        {show.type === 'movie' && <button style={{ marginLeft: 8 }} onClick={fetchSeats}>Refresh Seats</button>}
        <div className="muted" style={{ marginLeft: 8 }}>{status}</div>
      </div>
    </div>
  );
}
