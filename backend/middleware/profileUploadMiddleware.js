import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "instagram-clone/profiles",
    allowed_formats: [
      "jpg",
      "jpeg",
      "png",
      "webp",
    ],
  },
});
const profileUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export default profileUpload;
