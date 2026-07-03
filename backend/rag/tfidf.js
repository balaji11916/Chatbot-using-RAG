const STOP_WORDS = new Set([
  'the','is','at','which','on','a','an','and','or','but','in',
  'to','of','for','with','this','that','it','are','was','be',
  'as','by','from','have','has','had','not','we','you','he',
  'she','they','i','my','your','our','its','will','can','do',
  'did','does','been','being','would','could','should','may',
  'might','shall','also','than','then','so','if','about','into',
  'through','during','before','after','each','no','nor','very',
  'just','because','while','where','when','who','what','how',
  'all','both','few','more','most','other','some','own','same',
  'too','s','t','re','ve','ll','d','m'
]);

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1 && !STOP_WORDS.has(t));
}

function computeIDF(chunks) {
  const idf = {};
  const N = chunks.length;
  chunks.forEach(chunk => {
    const unique = new Set(tokenize(chunk));
    unique.forEach(t => { idf[t] = (idf[t] || 0) + 1; });
  });
  Object.keys(idf).forEach(t => {
    idf[t] = Math.log((N + 1) / (idf[t] + 1)) + 1;
  });
  return idf;
}

function vectorize(tokens, idf) {
  const tf = {};
  tokens.forEach(t => { tf[t] = (tf[t] || 0) + 1; });
  const total = tokens.length || 1;
  const vec = {};
  Object.keys(tf).forEach(t => {
    vec[t] = (tf[t] / total) * (idf[t] || 1);
  });
  return vec;
}

function cosineSimilarity(vecA, vecB) {
  const keys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
  let dot = 0, normA = 0, normB = 0;
  keys.forEach(k => {
    const a = vecA[k] || 0;
    const b = vecB[k] || 0;
    dot   += a * b;
    normA += a * a;
    normB += b * b;
  });
  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

module.exports = { tokenize, computeIDF, vectorize, cosineSimilarity };