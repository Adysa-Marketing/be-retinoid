module.exports = {
  development: {
    username: process.env.DEV_PG_USERNAME,
    password: process.env.DEV_PG_PASSWORD,
    database: process.env.DEV_PG_DATABASE,
    host: process.env.DEV_PG_HOST,
    port: process.env.DEV_PG_PORT,
    dialect: "postgres",
    loggin: false,
    operatorsAliases: 0,
    dialectOptions: {
      supportBigNumbers: true,
      decimalNumbers: true,
    },
  },
  production: {
    username: process.env.PG_USERNAME,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    dialect: "postgres",
    loggin: false,
    operatorsAliases: 0,
    dialectOptions: {
      supportBigNumbers: true,
      decimalNumbers: true,
    },
  },
};
