const multer = require("multer");
const path = require("path");
const sanitizeFilename = require("sanitize-filename");

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads")); // Save files in the "uploads" directory
  },
  filename: (req, file, cb) => {
    const sanitizedFilename = sanitizeFilename(file.originalname); // Sanitize the filename
    cb(null, `${Date.now()}-${sanitizedFilename}`); // Rename files to avoid conflicts
  },
});

// File filter to allow only specific file types (e.g., images, PDFs)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, and PDF files are allowed."), false);
  }
};

// Initialize multer
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

module.exports = upload;