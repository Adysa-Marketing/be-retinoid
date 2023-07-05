module.exports = {
  development: {
    port: process.env.DEV_PORT,
    tempDir: process.env.DEV_TEMPDIR,
    maxFill: process.env.DEV_MAXFILL,
  },
  production: {
    port: process.env.PORT,
    tempDir: process.env.TEMPDIR,
    maxFill: process.env.MAXFILL,
  },
};
