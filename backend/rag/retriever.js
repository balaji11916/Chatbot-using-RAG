const { tokenize, vectorize, cosineSimilarity } = require('./tfidf');

const NOT_FOUND = 'The requested information is not available in the uploaded document.';

// ─── CASUAL ──────────────────────────────────────────────────
const CASUAL = {
  'hi':             'Hello! 👋 Ask me anything about your uploaded document.',
  'hii':            'Hello! 👋 Ask me anything about your uploaded document.',
  'hello':          'Hello! 👋 Ask me anything about your uploaded document.',
  'hey':            'Hey! 👋 Ask me anything about your uploaded document.',
  'how are you':    "I'm doing great! Ask me anything about your document.",
  'thanks':         "You're welcome! 😊",
  'thank you':      "You're welcome! 😊",
  'bye':            'Goodbye! 👋',
  'good morning':   'Good morning! 👋',
  'good evening':   'Good evening! 👋',
  'good afternoon': 'Good afternoon! 👋',
  'wow':             'Wow! 😮 That\'s interesting.',
};

function casualReply(q) {
  const lower = q.trim().toLowerCase();
  for (const key of Object.keys(CASUAL)) {
    if (lower === key || lower.startsWith(key + ' ') || lower.startsWith(key + '!'))
      return CASUAL[key];
  }
  return null;
}

// ─── GET ALL LINES FROM DOCUMENT ─────────────────────────────
function getAllLines(chunks) {
  return chunks
    .join('\n')
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 1);
}

// ─── FIND TITLE ───────────────────────────────────────────────
// Titles are ALL CAPS lines in the first part of the document
function findTitle(lines) {
  // Check first 40 lines for ALL CAPS meaningful line
  for (const line of lines.slice(0, 40)) {
    if (
      line.length > 10 &&
      line.length < 250 &&
      line === line.toUpperCase() &&
      /[A-Z]{3,}/.test(line) &&
      !/^\d+$/.test(line) &&
      !/^(PAGE|TABLE|FIGURE|FIG|REF|WWW|HTTP)/.test(line) &&
      !line.startsWith('©') &&
      (line.match(/[A-Z]/g) || []).length > 5
    ) {
      return line;
    }
  }
  // Fallback: first non-empty line
  return lines[0] || null;
}

// ─── FIND SECTION CONTENT ─────────────────────────────────────
// Find a heading line then return content lines below it
function findSectionContent(lines, ...keywords) {
  for (let i = 0; i < lines.length; i++) {
    const upper = lines[i].toUpperCase();
    const isHeading = keywords.some(k => upper.includes(k.toUpperCase()));

    if (isHeading) {
      // Collect content lines after the heading (skip heading itself)
      const content = [];
      for (let j = i + 1; j < Math.min(i + 15, lines.length); j++) {
        const l = lines[j].trim();
        if (l.length > 2) {
          content.push(l);
          if (content.length >= 6) break;
        }
      }
      if (content.length > 0) {
        return content.join(' • ');
      }
      // If no content after heading, return surrounding lines
      return lines.slice(i, Math.min(i + 5, lines.length)).join(' ');
    }
  }
  return null;
}

// ─── REGEX FACT EXTRACTION ────────────────────────────────────
function regexExtract(question, fullText) {
  const q = question.toLowerCase();

  // Phone number
  if (/phone|mobile|contact number|call me|phone number/.test(q)) {
    const m = fullText.match(/(\+?\d[\d\s\-]{7,14}\d)/);
    if (m) return '📞 ' + m[1].trim();
  }

  // Email
  if (/email|e-mail|mail id|gmail/.test(q)) {
    const m = fullText.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
    if (m) return '📧 ' + m[0];
  }

  // Contact = phone + email
  if (/^contact$|contact detail|contact info|how to reach|reach me/.test(q)) {
    let result = '';
    const phone = fullText.match(/(\+?\d[\d\s\-]{7,14}\d)/);
    const email = fullText.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
    if (phone) result += '📞 ' + phone[1].trim() + '\n';
    if (email) result += '📧 ' + email[0];
    if (result.trim()) return result.trim();
  }

  // CGPA
  if (/cgpa|gpa|grade point/.test(q)) {
    const m = fullText.match(/CGPA[:\s]+(\d+\.?\d*\s*\/\s*\d+)/i)
           || fullText.match(/(\d+\.\d+)\s*\/\s*10/);
    if (m) return '🎓 CGPA: ' + (m[1] || m[0]).trim();
  }

  // Percentage
  if (/percentage|percent/.test(q)) {
    const m = fullText.match(/(\d+\.?\d*\s*%)/);
    if (m) return '📊 ' + m[0];
  }

  // Year / Date
  if (/\b(year|date|when|published|submitted)\b/.test(q)) {
    const m = fullText.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}/i)
           || fullText.match(/\b(20\d{2})\b/);
    if (m) return '📅 ' + m[0];
  }

  return null;
}

// ─── SECTION KEYWORD EXTRACTION ──────────────────────────────
function sectionExtract(question, lines) {
  const q = question.toLowerCase();

  // Title / project name / paper name
  if (/title|project name|name of.*project|heading|topic|paper name|name of.*paper/.test(q)) {
    const title = findTitle(lines);
    if (title) return '📌 ' + title;
  }

  // Abstract
  if (/abstract|summary|overview|brief description/.test(q)) {
    const s = findSectionContent(lines, 'ABSTRACT', 'SUMMARY', 'OVERVIEW');
    if (s) return '📄 ' + s;
  }

  // Introduction
  if (/\bintroduction\b|\bbackground\b/.test(q)) {
    const s = findSectionContent(lines, 'INTRODUCTION', 'BACKGROUND', 'I. INTRODUCTION');
    if (s) return '📖 ' + s;
  }

  // Conclusion
  if (/conclusion|result|finding|outcome/.test(q)) {
    const s = findSectionContent(lines, 'CONCLUSION', 'RESULT', 'FINDING', 'OUTCOME');
    if (s) return '✅ ' + s;
  }

  // Methodology
  if (/methodology|method|approach|algorithm|architecture|technique/.test(q)) {
    const s = findSectionContent(lines, 'METHODOLOGY', 'METHOD', 'APPROACH', 'ALGORITHM', 'ARCHITECTURE', 'TECHNIQUE');
    if (s) return '⚙️ ' + s;
  }

  // Objective
  if (/objective|aim|goal|purpose|scope/.test(q)) {
    const s = findSectionContent(lines, 'OBJECTIVE', 'AIM', 'GOAL', 'PURPOSE', 'SCOPE');
    if (s) return '🎯 ' + s;
  }

  // Technical Skills / Skills
  if (/technical skill|skill|technology|tech stack|tool|programming language/.test(q)) {
    const s = findSectionContent(lines, 'TECHNICAL SKILL', 'SKILL', 'TECHNOLOG', 'TOOL', 'PROGRAMMING');
    if (s) return '💡 ' + s;
  }

  // Projects
  if (/\bproject\b|built|developed|created/.test(q)) {
    const s = findSectionContent(lines, 'PROJECT');
    if (s) return '🗂️ ' + s;
  }

  // Experience / Internship
  if (/experience|internship|intern|work experience/.test(q)) {
    const s = findSectionContent(lines, 'EXPERIENCE', 'INTERNSHIP', 'WORK');
    if (s) return '💼 ' + s;
  }

  // Education
  if (/education|degree|qualification|b\.e|b\.tech|course/.test(q)) {
    const s = findSectionContent(lines, 'EDUCATION', 'QUALIFICATION', 'DEGREE', 'ACADEMIC');
    if (s) return '📚 ' + s;
  }

  // Certification
  if (/certif|certificate|course|nptel|coursera|udemy/.test(q)) {
    const s = findSectionContent(lines, 'CERTIF', 'CERTIFICATE', 'COURSE');
    if (s) return '📜 ' + s;
  }

  // References
  if (/reference|bibliography|citation/.test(q)) {
    const s = findSectionContent(lines, 'REFERENCE', 'BIBLIOGRAPHY');
    if (s) return '📎 ' + s;
  }

  // Language
  if (/\blanguage\b|spoken|tamil|english|hindi/.test(q)) {
    const s = findSectionContent(lines, 'LANGUAGE');
    if (s) return '🌐 ' + s;
  }

  // College / University
  if (/college|university|institution/.test(q)) {
    // Try to find from text directly
    const m = lines
      .slice(0, 60)
      .find(l => /college|university|institute/i.test(l) && l.length > 5);
    if (m) return '🏫 ' + m;
  }

  // Soft skills
  if (/soft skill|personal skill|interpersonal/.test(q)) {
    const s = findSectionContent(lines, 'SOFT SKILL', 'PERSONAL SKILL');
    if (s) return '🤝 ' + s;
  }

  // Authors / submitted by
  if (/author|written by|submitted by|prepared by|team member/.test(q)) {
    const s = findSectionContent(lines, 'SUBMITTED BY', 'AUTHOR', 'PREPARED BY', 'TEAM');
    if (s) return '✍️ ' + s;
  }

  // Name of person
  if (/^(what is (your|my|the) name|who are you|candidate name|person name)/.test(q)) {
    const firstMeaningful = lines.find(l => l.length > 3 && /[A-Za-z]/.test(l));
    if (firstMeaningful) return '👤 ' + firstMeaningful;
  }

  return null;
}

// ─── TF-IDF FALLBACK ──────────────────────────────────────────
function tfidfRetrieve(question, store, allLines) {
  const { chunks, idf, chunkVectors } = store;
  const qVec = vectorize(tokenize(question), idf);

  // Score all chunks
  const scored = chunkVectors
    .map((cv, i) => ({ chunk: chunks[i], score: cosineSimilarity(qVec, cv) }))
    .sort((a, b) => b.score - a.score);

  if (!scored.length || scored[0].score < 0.02) return NOT_FOUND;

  // Take top 3 chunks, collect all their lines
  const topLines = scored
    .slice(0, 3)
    .flatMap(s => s.chunk.split('\n').map(l => l.trim()).filter(l => l.length > 10));

  if (!topLines.length) return scored[0].chunk.trim();

  // Score each line against question
  const lineScored = topLines
    .map(l => ({
      text: l,
      score: cosineSimilarity(qVec, vectorize(tokenize(l), idf))
    }))
    .sort((a, b) => b.score - a.score);

  const best = lineScored.filter(l => l.score > 0.02).slice(0, 2);
  if (!best.length) return scored[0].chunk.split('\n').filter(l => l.trim().length > 5).slice(0, 3).join(' ');

  // Return best 1-2 lines
  if (best.length === 2 && best[1].score > 0.04 && best[0].text !== best[1].text) {
    return best[0].text + ' ' + best[1].text;
  }
  return best[0].text;
}

// ─── MAIN ────────────────────────────────────────────────────
function retrieve(question, store) {
  const { chunks } = store;
  const allLines  = getAllLines(chunks);
  const fullText  = allLines.join('\n');

  // 1. Casual
  const casual = casualReply(question);
  if (casual) return casual;

  // 2. Regex facts (phone, email, cgpa, date)
  const regex = regexExtract(question, fullText);
  if (regex) return regex;

  // 3. Section / keyword extraction
  const section = sectionExtract(question, allLines);
  if (section) return section;

  // 4. TF-IDF fallback for any other question
  return tfidfRetrieve(question, store, allLines);
}

module.exports = { retrieve };