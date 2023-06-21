require("dotenv").config({ path: "../.env" });

const {
  CommissionLevel,
  Country,
  PaymentType,
  Role,
  RwStatus,
  TrStatus,
  User,
  WdStatus,
} = require("../models");
const bcrypt = require("bcryptjs");
const cryptoString = require("crypto-random-string");

async function createRole() {
  await Role.bulkCreate([
    { name: "ROOT" },
    { name: "ADMIN" },
    { name: "AGEN" },
    { name: "MEMBER" },
  ]);
  console.log("[DONE CRETE ROLE]");
}

async function createTrStatus() {
  await TrStatus.bulkCreate([
    { name: "Pending" },
    { name: "Canceled" },
    { name: "Approved" },
    { name: "Rejected" },
  ]);
  console.log("[DONE CREATE TR-STATUS");
}

async function createPaymentType() {
  await PaymentType.bulkCreate([{ name: "Cash" }, { name: "Transfer" }]);
}

async function createRwStatus() {
  await RwStatus.bulkCreate([
    { name: "Pending" },
    { name: "Canceled" },
    { name: "Approved" },
    { name: "Rejected" },
    { name: "Delivered" },
  ]);
  console.log("[DONE CREATE RW-STATUS]");
}

async function createWdStatus() {
  await WdStatus.bulkCreate([
    { name: "Pending" },
    { name: "Canceled" },
    { name: "Rejected" },
    { name: "Process" },
    { name: "Transfered" },
  ]);
  console.log("[DONE CREATE WD-STATUS]");
}

async function createCommissionLevel() {
  await CommissionLevel.bulkCreate([
    { name: "Level 1", percent: 17 },
    { name: "Level 2", percent: 10 },
    { name: "Level 3", percent: 5 },
    { name: "Level 4", percent: 1 },
    { name: "Level 5", percent: 1 },
  ]);
}

async function bulkSync() {
  Promise.all(
    createRole(),
    createTrStatus(),
    createPaymentType(),
    createRwStatus(),
    createWdStatus(),
    createCommissionLevel()
  )
    .then(async (response) => {
      console.log("[OK]", response);
      process.exit(0);
    })
    .catch(async (err) => {
      console.log("[Error]", err);
      process.exit(0);
    });
}

async function createUser() {
  const sponsorKey = cryptoString({ length: 10, type: "base64" });
  const password = bcrypt.hashSync("rahasia", bcrypt.genSaltSync(2));
  const payload = {
    name: "Super Admin",
    username: "Super Admin",
    email: "superadmin@gmail.com",
    password,
    phone: "085325224829",
    gender: "Male",
    kk: "3318161304010001",
    sponsorKey,
    roleId: 1,
  };
  User.create(payload)
    .then((result) => {
      console.log("[DONE CREATE USER]");
      process.exit(0);
    })
    .catch((err) => {
      console.log("Error : ", err);
      process.exit(0);
    });
}

async function createState() {
  Country.create({ kode: "ID", name: "INDONESIA" })
    .then((response) => {
      process.exit(0);
    })
    .catch((err) => {
      process.exit(0);
    });
}

// createState()
// bulkSync()
// createUser()
