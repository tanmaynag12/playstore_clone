const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "icon") {
      cb(null, "uploads/icons");
    } else {
      cb(null, "uploads/screenshots");
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExt = [".png", ".jpg", ".jpeg", ".webp"];

    console.log("Uploaded file:", file.originalname, file.mimetype);

    if (!allowedExt.includes(ext)) {
      return cb(new Error("Only image files are allowed"), false);
    }

    cb(null, true);
  },
});

module.exports = upload;
