import multer from "multer";
import path from "path";

// Storage engine (where files go)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "src/uploads/");
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

// File filter (optional safety)
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images allowed"), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
});