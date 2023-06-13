require("dotenv").config();
const db = require("./models");

db.sequelize
  .sync({ alert: true })
  .then(() => console.log("Migration Success"))
  .catch((error) => console.log(error))
  .finally(() => process.exit(0));
