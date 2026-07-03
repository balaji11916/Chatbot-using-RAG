import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import MessageInput from '../components/MessageInput';
import api from '../utils/api';
import '../styles/chat.css';

export default function ChatPage() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId]           = useState(null);
  const [messages, setMessages]           = useState([]);
  const [isTyping, setIsTyping]           = useState(false);
  const [uploading, setUploading]         = useState(false);
  const [pdfName, setPdfName]             = useState(null);

  const loadConversations = useCallback(async () => {
    const res = await api.get('/chat/conversations');
    setConversations(res.data);
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  useEffect(() => {
    if (activeId) loadMessages(activeId);
  }, [activeId]);

  const loadMessages = async id => {
    const res = await api.get(`/chat/conversation/${id}/messages`);
    setMessages(res.data);
    const conv = conversations.find(c => c.id === id);
    setPdfName(conv?.has_pdf ? conv.pdf_filename : null);
  };

  const handleNewChat = async () => {
    const res = await api.post('/chat/conversation');
    await loadConversations();
    setActiveId(res.data.conversationId);
    setMessages([]);
    setPdfName(null);
  };

  const handleSend = async text => {
    let convId = activeId;
    if (!convId) {
      const res = await api.post('/chat/conversation');
      convId = res.data.conversationId;
      setActiveId(convId);
      await loadConversations();
    }
    setMessages(prev => [...prev, { sender: 'user', message: text }]);
    setIsTyping(true);
    try {
      const res = await api.post('/chat/message', { conversationId: convId, message: text });
      setMessages(prev => [...prev, { sender: 'bot', message: res.data.reply }]);
    } catch {
      setMessages(prev => [...prev, { sender: 'bot', message: 'Something went wrong.' }]);
    } finally {
      setIsTyping(false);
      loadConversations();
    }
  };

  const handleUploadPdf = async file => {
    setUploading(true);
    try {
      let convId = activeId;
      if (!convId) {
        const res = await api.post('/chat/conversation');
        convId = res.data.conversationId;
        setActiveId(convId);
      }
      const form = new FormData();
      form.append('file', file);
      form.append('conversationId', convId);
      await api.post('/pdf/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setPdfName(file.name);
      await loadConversations();
    } catch {
      setMessages(prev => [...prev, { sender: 'bot', message: 'PDF upload failed. Please try again.' }]);
    } finally { setUploading(false); }
  };

  return (
    <div className="chat-page">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={setActiveId}
        onNewChat={handleNewChat}
      />
      <div className="chat-main">
        <ChatWindow messages={messages} isTyping={isTyping} />
        <MessageInput
          onSend={handleSend}
          onUploadPdf={handleUploadPdf}
          pdfName={pdfName}
          uploading={uploading}
        />
      </div>
    </div>
  );
}