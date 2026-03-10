/**
 * Upload Middleware
 * Uses Multer with memory storage. Images are uploaded to Cloudinary
 * in the controller, not here — keeping the middleware transport-agnostic.
 */

const multer = require("multer");
const { ApiError } = require("../utils/apiUtils");

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Store files in memory as Buffer (sent directly to Cloudinary)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(400, "Invalid file type. Only JPEG, PNG, and WEBP are allowed."),
      false
    );
  }
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

/**
 * Convert Multer memory buffer to a base64 data URI for Cloudinary upload.
 * @param {Express.Multer.File} file
 * @returns {string}
 */
const bufferToDataURI = (file) => {
  const b64 = Buffer.from(file.buffer).toString("base64");
  return `data:${file.mimetype};base64,${b64}`;
};

module.exports = { upload, bufferToDataURI };
