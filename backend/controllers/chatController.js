const pool = require('../config/db');
const { load } = require('../rag/vectorStore');
const { retrieve } = require('../rag/retriever');
const { normalChatResponse } = require('../utils/normalChat');

const CASUAL_PATTERN = /^(hi|hello|hey|how are you|thanks|thank you|bye|good morning|good evening|good afternoon)\b/i;

// POST /api/chat/conversation
exports.createConversation = async (req, res) => {
  try {
    const [result] = await pool.query(
      'INSERT INTO conversations (user_id, title) VALUES (?, ?)',
      [req.user.id, 'New Chat']
    );
    res.status(201).json({ conversationId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Could not create conversation.' });
  }
};

// GET /api/chat/conversations
exports.getConversations = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, title, has_pdf, pdf_filename, created_at FROM conversations WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch conversations.' });
  }
};

// GET /api/chat/conversation/:id/messages
exports.getMessages = async (req, res) => {
  try {
    const [conv] = await pool.query(
      'SELECT id FROM conversations WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (!conv.length)
      return res.status(404).json({ message: 'Conversation not found.' });

    const [messages] = await pool.query(
      'SELECT sender, message, created_at FROM chat_history WHERE conversation_id = ? ORDER BY created_at ASC',
      [req.params.id]
    );
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch messages.' });
  }
};

// POST /api/chat/message
exports.sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId, message } = req.body;

    if (!conversationId || !message)
      return res.status(400).json({ message: 'conversationId and message are required.' });

    // Get conversation details
    const [rows] = await pool.query(
      'SELECT * FROM conversations WHERE id = ? AND user_id = ?',
      [conversationId, userId]
    );
    if (!rows.length)
      return res.status(404).json({ message: 'Conversation not found.' });

    const conv = rows[0];

    // Save user message
    await pool.query(
      'INSERT INTO chat_history (conversation_id, sender, message) VALUES (?, "user", ?)',
      [conversationId, message]
    );

    let botReply;

    // If PDF is attached and it's not a casual message → use RAG
    if (conv.has_pdf && conv.vector_file && !CASUAL_PATTERN.test(message.trim())) {
      const store = load(conv.vector_file);
      if (!store) {
        botReply = 'PDF index not found. Please re-upload the PDF.';
      } else {
        botReply = retrieve(message, store);
      }
    } else {
      // Normal chat
      botReply = normalChatResponse(message);
    }

    // Save bot reply
    await pool.query(
      'INSERT INTO chat_history (conversation_id, sender, message) VALUES (?, "bot", ?)',
      [conversationId, botReply]
    );

    // Auto title from first message
    const [count] = await pool.query(
      'SELECT COUNT(*) as c FROM chat_history WHERE conversation_id = ?',
      [conversationId]
    );
    if (count[0].c <= 2) {
      await pool.query(
        'UPDATE conversations SET title = ? WHERE id = ?',
        [message.slice(0, 40), conversationId]
      );
    }

    res.json({ reply: botReply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to process message.' });
  }
};