const multer = require("multer");
const cryptojs = require("crypto-js");
const moment = require("moment");

const extenions = [".png", ".jpg", ".jpeg"];
const mimetypes = ["image/png", "iamge/jpg", "image/jpeg"];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, req.tempDir);
  },
  filename: function (req, file, cb) {
    const extension = extenions[mimetypes.indexOf(file.mimetype)];
    const filename = cryptojs.SHA256(file.originalname + moment()).toString();

    try {
      cb(null, filename + extension);
    } catch (err) {
      console.log(err);
      return cb(new Error("Internal server error"));
    }
  },
});

module.exports = multer({
  storage,
  limits: { fileSize: 5 * 1000 * 1000 }, // 5MB max file size
  fileFilter: function (req, file, cb) {
    if (mimetypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("File type not accepted (.png, .jpg, .jpeg)"));
    }
  },
});
