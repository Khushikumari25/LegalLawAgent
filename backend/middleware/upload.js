const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const caseUploadDir = path.join(uploadDir, 'cases');
    if (!fs.existsSync(caseUploadDir)) {
      fs.mkdirSync(caseUploadDir, { recursive: true });
    }
    cb(null, caseUploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed MIME types
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  // Allowed extensions
  const allowedExtensions = /\.(pdf|doc|docx|txt)$/i;

  const extValid = allowedExtensions.test(path.extname(file.originalname));
  const mimeValid = allowedMimeTypes.includes(file.mimetype);

  if (extValid && mimeValid) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, DOCX, and TXT files are allowed'));
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024, // 100MB default (supports ~2000 page PDFs)
  },
  fileFilter: fileFilter
});

// Export upload middleware
module.exports = upload;

// Single file upload
module.exports.single = (fieldName) => upload.single(fieldName);

// Multiple files upload
module.exports.multiple = (fieldName, maxCount) => upload.array(fieldName, maxCount);

// Multiple fields upload
module.exports.fields = (fields) => upload.fields(fields);
