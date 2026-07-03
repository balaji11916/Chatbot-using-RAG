// Extracts raw text from a PDF file using pdf-parse (pure Node.js, no Python)
const pdfParse = require('pdf-parse');
const fs = require('fs');

async function loadPDF(filePath) {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return data.text; // returns full text string
}

module.exports = { loadPDF };