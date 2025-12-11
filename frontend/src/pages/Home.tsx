import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

type Show = {
  id: number;
  name?: string;
  type: string;
  start_time?: string;
  total_seats?: number;
  from?: string;
  to?: string;
  date?: string;
  available_buses?: number;
  doctor_name?: string;
  problem?: string;
};

export default function Home() {
  const [shows, setShows] = useState<Show[]>([]);

  useEffect(() => {
    fetch((import.meta.env.VITE_API_URL ?? '') + '/api/shows')
      .then(r => r.json())
      .then(setShows)
      .catch(() => {});
  }, []);

  return (
    <div>
      <div className="card">
        <h2 className="header-1">Available Bookings</h2>
        <p className="muted">Movies, Bus Trips, and Doctor Appointments</p>
      </div>

      <div className="shows-grid">
        {shows.map(s => (
          <div key={s.id} className="card show-card">
            {s.type === 'movie' && (
              <>
                <h3>{s.name}</h3>
                <p className="muted">{new Date(s.start_time!).toLocaleString()}</p>
                <div className="muted">{s.total_seats} seats available</div>
              </>
            )}
            {s.type === 'bus' && (
              <>
                <h3>{s.from} → {s.to}</h3>
                <p className="muted">{s.date}</p>
                <div className="muted">{s.available_buses} buses available</div>
              </>
            )}
            {s.type === 'doctor' && (
              <>
                <h3>Dr. {s.doctor_name}</h3>
                <p className="muted">{s.problem}</p>
                <div className="muted">{new Date(s.start_time!).toLocaleString()}</div>
              </>
            )}

            <div style={{ marginTop: 12 }} className="flex">
              <Link to={`/booking/${s.id}`} className="btn">
                Book
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

