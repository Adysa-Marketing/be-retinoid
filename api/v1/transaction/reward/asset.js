const env = process.env.NODE_ENV;
const config = require("../../../../config/core")[env];
const fs = require("fs");
const path = require("path");

const Directory = (req, res, next) => {
  const dir = `${config.tempDir}/trx/reward`;
  req.tempDir = dir;
  try {
    if (fs.existsSync(dir)) {
      next();
    } else {
      fs.mkdir(dir, { recursive: true }, (err) => {
        if (err) throw err;
        next();
      });
    }
  } catch (error) {
    console.log("[!] Error : ", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const RemoveFile = (files, status) => {
  return new Promise(async (resolve, reject) => {
    const tempDir = `${config.tempDir}/trx/reward/`;
    const imageKtp = status
      ? files.imageKtp
      : files && files.imageKtp?.length > 0
      ? files.imageKtp[0].filename
      : null;

    imageKtp &&
      fs.unlink(path.join(tempDir, imageKtp), (err) =>
        console.log(`${imageKtp} deleted`)
      );
    resolve();
  });
};
module.exports = { Directory, RemoveFile };
