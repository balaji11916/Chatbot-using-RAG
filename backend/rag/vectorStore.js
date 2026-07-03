// Saves and loads TF-IDF index as a JSON file — no database, no vector DB needed
const fs = require('fs');
const path = require('path');
const { computeIDF, tokenize, vectorize } = require('./tfidf');

const VECTORS_DIR = path.join(__dirname, '../vectors');

function buildAndSave(chunks, vectorFile) {
  const idf = computeIDF(chunks);
  const chunkVectors = chunks.map(chunk => vectorize(tokenize(chunk), idf));

  const store = { chunks, idf, chunkVectors };
  fs.writeFileSync(
    path.join(VECTORS_DIR, vectorFile),
    JSON.stringify(store)
  );
  return store;
}

function load(vectorFile) {
  const filePath = path.join(VECTORS_DIR, vectorFile);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function deleteStore(vectorFile) {
  const filePath = path.join(VECTORS_DIR, vectorFile);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

module.exports = { buildAndSave, load, deleteStore };