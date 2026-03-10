/**
 * Cloudinary Configuration
 * Initializes the Cloudinary SDK and exports upload/delete helpers.
 */

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload a file buffer or base64 string to Cloudinary.
 * @param {string} fileBuffer - base64 data URI or file path
 * @param {string} folder - Cloudinary folder to store image in
 * @returns {Promise<{url: string, public_id: string}>}
 */
const uploadImage = async (fileBuffer, folder = "ecommerce") => {
  const result = await cloudinary.uploader.upload(fileBuffer, {
    folder,
    resource_type: "auto",
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  });

  return {
    url: result.secure_url,
    public_id: result.public_id,
  };
};

/**
 * Delete an image from Cloudinary by its public_id.
 * @param {string} publicId - Cloudinary public_id of the image
 * @returns {Promise<object>}
 */
const deleteImage = async (publicId) => {
  return cloudinary.uploader.destroy(publicId);
};

module.exports = { cloudinary, uploadImage, deleteImage };
