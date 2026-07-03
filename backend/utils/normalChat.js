// Rule-based responses when no PDF is uploaded
const GREETINGS = ['hi','hello','hey','hii'];

function normalChatResponse(message) {
  const msg = message.trim().toLowerCase();

  if (GREETINGS.some(g => msg.includes(g)))
    return 'Hello! 👋 How can I help you today? Upload a PDF to chat with its contents, or just talk to me normally!';

  if (msg.includes('how are you'))
    return "I'm doing great, thanks for asking! How can I assist you?";

  if (msg.includes('thank'))
    return "You're welcome! 😊";

  if (msg.includes('bye'))
    return 'Goodbye! Have a great day. 👋';

  if (msg.includes('good morning'))
    return 'Good morning! 👋';

  if (msg.includes('good evening'))
    return 'Good evening! 👋';

  if (msg.includes('good afternoon'))
    return 'Good afternoon! 👋';

  if (msg.includes('who are you') || msg.includes('what can you do'))
    return "I'm an AI assistant. Chat normally with me, or upload a PDF and I'll answer questions from it using RAG!";

  return "I'm here to help! Upload a PDF using the 📎 button and ask me anything about it.";
}

module.exports = { normalChatResponse };