const env = process.env.NODE_ENV;
const config = require("../../../config/core")[env];
const fs = require("fs");

const Directory = (req, res, next) => {
  const dir = `${config.tempdir}/reward`;
  req.tempdir = dir;
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

const RemoveFile = (rows, options) => {
  return new Promise(async (resolve, reject) => {
    const tempDir = `${config.tempDir}/reward/`;
    const image = rows
      ? rows.image
      : rows && rows.image.length > 0
      ? rows.image[0].filename
      : null;

    image &&
      fs.unlink(path.join(tempDir, image), (err) =>
        console.log(`${image} deleted`)
      );
    resolve();
  });
};
module.exports = { Directory, RemoveFile };
