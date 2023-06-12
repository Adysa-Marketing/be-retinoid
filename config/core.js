module.exports = {
  development: {
    port: process.env.DEV_PORT,
    tempdir: process.env.DEV_TEMPDIR,
  },
  production: {
    port: process.env.PORT,
    tempdir: process.env.TEMPDIR,
  },
};
