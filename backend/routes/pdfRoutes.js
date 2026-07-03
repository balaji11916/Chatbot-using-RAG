const express = require('express');
const multer = require('multer');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { uploadPDF } = require('../controllers/pdfController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

router.post('/upload', auth, upload.single('file'), uploadPDF);

module.exports = router;