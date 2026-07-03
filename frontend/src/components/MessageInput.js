import React, { useState, useRef } from 'react';

export default function MessageInput({ onSend, onUploadPdf, pdfName, uploading }) {
  const [text, setText] = useState('');
  const fileRef = useRef(null);

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text); setText('');
  };

  return (
    <div className="message-input-container">
      {pdfName && <div className="pdf-tag">📄 PDF Mode: {pdfName}</div>}
      <div className="input-row">
        <button className="upload-btn" onClick={() => fileRef.current.click()} disabled={uploading} title="Upload PDF">
          {uploading ? '⏳' : '📎'}
        </button>
        <input type="file" accept="application/pdf" ref={fileRef} style={{ display: 'none' }}
          onChange={e => { if (e.target.files[0]) { onUploadPdf(e.target.files[0]); e.target.value = null; } }} />
        <textarea rows={1} placeholder="Type your message..."
          value={text} onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} />
        <button className="send-btn" onClick={handleSend}>➤</button>
      </div>
    </div>
  );
}