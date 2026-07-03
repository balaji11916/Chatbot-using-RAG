import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/landing.css';

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="landing">
      <nav className="navbar">
        <div className="logo">📄 Chatbot<span>AI</span></div>
        <div className="nav-buttons">
          <button className="btn-outline" onClick={() => navigate('/login')}>Login</button>
          <button className="btn-primary" onClick={() => navigate('/signup')}>Sign Up</button>
        </div>
      </nav>

      <header className="hero">
        <h1>Chat With Your PDFs Using AI</h1>
        <div className="hero-buttons">
          <button className="btn-primary large" onClick={() => navigate('/signup')}>Get Started Free</button>
          <button className="btn-outline large" onClick={() => navigate('/login')}>Login</button>
        </div>
      </header>

      <section className="features">
        <h2>Features</h2>
        <div className="feature-grid">
          <div className="feature-card"><h3>💬 Smart Chat</h3><p>Have natural conversations just like ChatGPT.</p></div>
          <div className="feature-card"><h3>📑 PDF Q&A</h3><p>Upload a PDF and get answers sourced directly from it.</p></div>
          <div className="feature-card"><h3>🔒 Secure Auth</h3><p>JWT-based authentication with hashed passwords.</p></div>
          <div className="feature-card"><h3>🗂️ Chat History</h3><p>All conversations saved and accessible anytime.</p></div>
        </div>
      </section>

      <footer className="footer"><p>© 2026 AI Chatbot</p></footer>
    </div>
  );
}