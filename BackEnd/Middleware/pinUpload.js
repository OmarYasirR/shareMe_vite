import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create pins upload directory
const pinsUploadDir = path.join(__dirname, '../uploads/pins');
if (!fs.existsSync(pinsUploadDir)) {
  fs.mkdirSync(pinsUploadDir, { recursive: true });
  console.log('Created pins upload directory:', pinsUploadDir);
}

// Configure storage for pins
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, pinsUploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename with user ID and timestamp
    const userId = req.userId || 'anonymous'; // Get from auth middleware
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    
    // Clean file name
    const originalName = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9]/g, '-')
      .substring(0, 50);
    
    const filename = `pin-${userId}-${timestamp}-${random}-${originalName}${ext}`;
    cb(null, filename);
  }
});

// File filter for pins
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  
  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed!'), false);
  }
};

// Create multer instance for pins
const pinUpload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for pins
    files: 1 // Only one file per request
  },
  fileFilter: fileFilter
});

// Middleware to handle multer errors
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File is too large. Maximum size is 10MB'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
};

export { pinUpload, handleUploadError };