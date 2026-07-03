// Split by LINES with overlap so headings stay with their content
function splitText(text) {
  // Clean text
  text = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .trim();

  // Split into individual lines
  const lines = text
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 1);

  const chunks = [];
  const CHUNK_SIZE = 8;   // lines per chunk
  const OVERLAP    = 3;   // overlap lines between chunks

  for (let i = 0; i < lines.length; i += (CHUNK_SIZE - OVERLAP)) {
    const chunk = lines.slice(i, i + CHUNK_SIZE).join('\n');
    if (chunk.trim().length > 10) {
      chunks.push(chunk.trim());
    }
  }

  return chunks;
}

module.exports = { splitText };