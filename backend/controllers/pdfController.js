const fs = require('fs');
const path = require('path');
const pool = require('../config/db');
const { loadPDF } = require('../rag/pdfLoader');
const { splitText } = require('../rag/textSplitter');
const { buildAndSave } = require('../rag/vectorStore');

exports.uploadPDF = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.body;

    if (!req.file)
      return res.status(400).json({ message: 'No PDF uploaded.' });

    const filePath = req.file.path;
    const vectorFile = `${Date.now()}_${userId}.json`;

    // Extract text from PDF
    const text = await loadPDF(filePath);

    // Split into chunks
    const chunks = splitText(text);

    // Build TF-IDF index and save as JSON
    buildAndSave(chunks, vectorFile);

    // Clean up uploaded temp file
    fs.unlinkSync(filePath);

    // Update conversation in DB
    if (conversationId) {
      await pool.query(
        'UPDATE conversations SET has_pdf = TRUE, pdf_filename = ?, vector_file = ? WHERE id = ? AND user_id = ?',
        [req.file.originalname, vectorFile, conversationId, userId]
      );
    }

    res.json({
      message: 'PDF processed successfully.',
      vectorFile,
      chunks: chunks.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'PDF processing failed: ' + err.message });
  }
};