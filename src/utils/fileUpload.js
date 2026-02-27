const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "icon") {
      cb(null, "uploads/icons");
    } else if (file.fieldname === "screenshots") {
      cb(null, "uploads/screenshots");
    } else if (file.fieldname === "apk") {
      cb(null, "uploads/apks");
    } else if (file.fieldname === "profile_image") {
      cb(null, "uploads/profiles");
    } else {
      cb(new Error("Invalid field name"), null);
    }
  },

  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    const imageExt = [".png", ".jpg", ".jpeg", ".webp"];
    const apkExt = [".apk"];

    if (
      (file.fieldname === "icon" ||
        file.fieldname === "screenshots" ||
        file.fieldname === "profile_image") &&
      imageExt.includes(ext)
    ) {
      return cb(null, true);
    }

    if (file.fieldname === "apk" && apkExt.includes(ext)) {
      return cb(null, true);
    }

    cb(new Error("Invalid file type"), false);
  },
});

module.exports = upload;
