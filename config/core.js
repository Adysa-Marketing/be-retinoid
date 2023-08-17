module.exports = {
  development: {
    port: process.env.DEV_PORT,
    tempDir: process.env.DEV_TEMPDIR,
    maxFill: process.env.DEV_MAXFILL,
    token: process.env.DEV_TOKEN_BOT,
    apiBot: process.env.DEV_API_BOT,
  },
  production: {
    port: process.env.PORT,
    tempDir: process.env.TEMPDIR,
    maxFill: process.env.MAXFILL,
    token: process.env.TOKEN_BOT,
    apiBot: process.env.API_BOT,
  },
};
