module.exports = {
  development: {
    port: process.env.DEV_PORT,
    tempdir: process.env.DEV_TEMPDIR,
    maxFill: process.env.DEV_MAXFILL,
  },
  production: {
    port: process.env.PORT,
    tempdir: process.env.TEMPDIR,
    maxFill: process.env.MAXFILL,
  },
};
