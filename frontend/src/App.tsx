import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import BookingPage from './pages/BookingPage'
import Admin from './pages/Admin'

export default function App(){
  return (
    <div className="app">
      <nav className="nav">
        <h1 className="logo">✨ TicketHuman</h1>
        <div>
          <Link to="/">Home</Link>
          <Link to="/admin">Admin</Link>
        </div>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/booking/:id" element={<BookingPage/>} />
          <Route path="/admin" element={<Admin/>} />
        </Routes>
      </main>
      <footer className="footer">Made with ♥ — humanized features & color 🌈</footer>
    </div>
  )
}
