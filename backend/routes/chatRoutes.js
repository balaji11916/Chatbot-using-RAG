const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  createConversation,
  getConversations,
  getMessages,
  sendMessage,
} = require('../controllers/chatController');

router.use(auth);
router.post('/conversation', createConversation);
router.get('/conversations', getConversations);
router.get('/conversation/:id/messages', getMessages);
router.post('/message', sendMessage);

module.exports = router;