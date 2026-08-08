import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storyStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "instagram-clone/stories",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const storyUpload = multer({
  storage: storyStorage,
});

export default storyUpload;

