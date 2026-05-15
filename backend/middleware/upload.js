import multer from "multer";
import path from "path";
import fs from "fs";

const ensureDir = (dir) => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); };

ensureDir("uploads/assignments");
ensureDir("uploads/submissions");

const makeStorage = (folder) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, folder),
    filename: (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
      cb(null, unique + path.extname(file.originalname));
    },
  });

const fileFilter = (_req, file, cb) => {
  const allowed = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
  allowed.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error("Only PDF, PNG, and JPG files are allowed"), false);
};

const limits = { fileSize: 10 * 1024 * 1024 }; // 10 MB

export const uploadAssignment = multer({ storage: makeStorage("uploads/assignments"), fileFilter, limits });
export const uploadSubmission = multer({ storage: makeStorage("uploads/submissions"), fileFilter, limits });

// keep default export for backward compat (teacher assignment upload)
export default uploadAssignment;
