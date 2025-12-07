import cloudinary from "../Utlis/Cloudinary.js";
import { successHandler, errorHandler } from "../Utlis/ResponseHandler.js";

// Upload file to Cloudinary
export const uploadFile = async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return errorHandler(res, 400, "No file uploaded");
    }

    const file = req.files.file;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
    if (!allowedTypes.includes(file.mimetype)) {
      return errorHandler(res, 400, "Please upload only PDF or PowerPoint files");
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return errorHandler(res, 400, "File size must be less than 10MB");
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      resource_type: "auto",
      folder: "lesson-plans",
    });

    successHandler(res, 200, "File uploaded successfully", {
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      resource_type: result.resource_type,
    });
  } catch (error) {
    console.error("Upload error:", error);
    errorHandler(res, 500, "Failed to upload file", error.message);
  }
};

export default { uploadFile };
