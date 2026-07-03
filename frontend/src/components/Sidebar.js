import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({ conversations, activeId, onSelect, onNewChat }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="sidebar">
      <button className="new-chat-btn" onClick={onNewChat}>+ New Chat</button>
      <div className="conversation-list">
        {conversations.map(c => (
          <div
            key={c.id}
            className={`conversation-item ${activeId === c.id ? 'active' : ''}`}
            onClick={() => onSelect(c.id)}
          >
            {c.has_pdf ? '📄' : '💬'} {c.title}
          </div>
        ))}
      </div>
      <div className="sidebar-footer">
        <div className="user-info">👤 {user?.name}</div>
        <button className="logout-btn" onClick={() => { logout(); navigate('/'); }}>Logout</button>
      </div>
    </div>
  );
}