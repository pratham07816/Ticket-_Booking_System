import React, { useState } from 'react';

export default function Admin() {
  const [type, setType] = useState('movie'); // default Movie
  const [msg, setMsg] = useState('');

  // Movie fields
  const [movieName, setMovieName] = useState('');
  const [movieTime, setMovieTime] = useState('');
  const [movieSeats, setMovieSeats] = useState(1);

  // Bus fields
  const [busFrom, setBusFrom] = useState('');
  const [busTo, setBusTo] = useState('');
  const [busDate, setBusDate] = useState('');
  const [busAvailable, setBusAvailable] = useState(1);

  // Doctor fields
  const [doctorName, setDoctorName] = useState('');
  const [doctorProblem, setDoctorProblem] = useState('');
  const [doctorTime, setDoctorTime] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg('Creating...');

    let payload: any = { type };

    if (type === 'movie') {
      payload = { ...payload, name: movieName, start_time: movieTime, total_seats: movieSeats };
    } else if (type === 'bus') {
      payload = { ...payload, from: busFrom, to: busTo, date: busDate, available_buses: busAvailable };
    } else if (type === 'doctor') {
      payload = { ...payload, doctor_name: doctorName, problem: doctorProblem, start_time: doctorTime };
    }

    try {
      const r = await fetch((import.meta.env.VITE_API_URL ?? '') + '/api/admin/shows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const j = await r.json();
      if (r.ok) {
        setMsg(`${type} created! ID: ${j.id}`);
        // Reset fields
        setMovieName(''); setMovieTime(''); setMovieSeats(1);
        setBusFrom(''); setBusTo(''); setBusDate(''); setBusAvailable(1);
        setDoctorName(''); setDoctorProblem(''); setDoctorTime('');
      } else {
        setMsg('Error: ' + (j.error ?? 'unknown'));
      }
    } catch {
      setMsg('Network error');
    }
  }

  return (
    <div className="card">
      <h2 className="header-1">Admin — Create Booking</h2>
      <form onSubmit={submit}>
        <div className="row">
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="movie">Movie</option>
            <option value="bus">Bus Trip</option>
            <option value="doctor">Doctor Slot</option>
          </select>
        </div>

        {/* Movie Fields */}
        {type === 'movie' && (
          <div className="row">
            <input placeholder="Movie Name" value={movieName} onChange={e => setMovieName(e.target.value)} />
            <input type="datetime-local" value={movieTime} onChange={e => setMovieTime(e.target.value)} />
            <input type="number" min={1} value={movieSeats} onChange={e => setMovieSeats(Number(e.target.value))} />
          </div>
        )}

        {/* Bus Fields */}
        {type === 'bus' && (
          <div className="row">
            <input placeholder="From" value={busFrom} onChange={e => setBusFrom(e.target.value)} />
            <input placeholder="To" value={busTo} onChange={e => setBusTo(e.target.value)} />
            <input type="date" value={busDate} onChange={e => setBusDate(e.target.value)} />
            <input type="number" min={1} value={busAvailable} onChange={e => setBusAvailable(Number(e.target.value))} />
          </div>
        )}

        {/* Doctor Fields */}
        {type === 'doctor' && (
          <div className="row">
            <input placeholder="Doctor Name" value={doctorName} onChange={e => setDoctorName(e.target.value)} />
            <input placeholder="Problem" value={doctorProblem} onChange={e => setDoctorProblem(e.target.value)} />
            <input type="datetime-local" value={doctorTime} onChange={e => setDoctorTime(e.target.value)} />
          </div>
        )}

        <div className="row">
          <button className="btn" type="submit">Create</button>
          <div className="muted">{msg}</div>
        </div>
      </form>
    </div>
  );
}
