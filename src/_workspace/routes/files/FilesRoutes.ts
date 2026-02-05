import express from "express";
import multer from "multer";
import { FilesController } from "@controllers/files/FilesController.js";
import { authMiddleware } from "@src/middlewares/authMiddleware.js";

const FilesRoutes = express.Router();

// Multer configuration
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "pms-uploads",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  } as any,
});

const upload = multer({ storage: storage });

FilesRoutes.use(authMiddleware);

// Get files for a task
FilesRoutes.get("/tasks/:taskId", FilesController.search);

// Upload file to task
FilesRoutes.post(
  "/tasks/:taskId",
  upload.single("file"),
  FilesController.upload,
);

// Get file by ID
FilesRoutes.get("/:id", FilesController.findById);

// Delete file
FilesRoutes.delete("/:id", FilesController.delete);

export default FilesRoutes;
