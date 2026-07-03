const express = require('express');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const pdfRoutes  = require('./routes/pdfRoutes');

const app = express();

// Create required folders
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
if (!fs.existsSync('vectors')) fs.mkdirSync('vectors');

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/pdf',  pdfRoutes);

app.get('/', (req, res) => res.send('AI Chatbot API Running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));