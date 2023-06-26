require("dotenv").config({ path: "../.env" });

const {
  AgenStatus,
  CommissionLevel,
  Country,
  PaymentType,
  Role,
  RwStatus,
  TrStatus,
  User,
  WdStatus,
  SponsorKey,
} = require("../models");
const db = require("../models");

const bcrypt = require("bcryptjs");
const cryptoString = require("crypto-random-string");

async function createRole() {
  await Role.bulkCreate([
    { name: "ROOT" },
    { name: "ADMIN" },
    { name: "AGEN" },
    { name: "MEMBER" },
  ]);
  console.log("[DONE CREATE ROLE]");
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
  await PaymentType.bulkCreate([{ name: "CASH" }, { name: "TRANSFER" }]);
}

async function createRwStatus() {
  await RwStatus.bulkCreate([
    { name: "Pending" },
    { name: "Canceled" },
    { name: "Rejected" },
    { name: "Approved" },
    { name: "Delivered" },
  ]);
  console.log("[DONE CREATE RW-STATUS]");
}

async function createWdStatus() {
  await WdStatus.bulkCreate([
    { name: "Pending" },
    { name: "Canceled" },
    { name: "Rejected" },
    { name: "Processed" },
    { name: "Transfered" },
  ]);
  console.log("[DONE CREATE WD-STATUS]");
}

async function createCommissionLevel() {
  await CommissionLevel.bulkCreate([
    { name: "Level 1", percent: 16 },
    { name: "Level 2", percent: 10 },
    { name: "Level 3", percent: 6 },
    { name: "Level 4", percent: 3 },
    { name: "Level 5", percent: 2 },
  ]);
  console.log("[DONE CREATE COMMISSION-LEVEL]");
}

async function createAgenStatus() {
  await AgenStatus.bulkCreate([
    { name: "PENDING" },
    { name: "ACTIVED" },
    { name: "DISABLED" },
  ]);
  console.log("[DONE CREATE AGEN-STATUS]");
}

async function bulkSync() {
  Promise.all(
    createAgenStatus(),
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
  const transaction = await db.sequelize.transaction({ autocommit: false });
  const sponsorKey = cryptoString({ length: 10, type: "base64" });
  const password = bcrypt.hashSync("rahasia", bcrypt.genSaltSync(2));

  try {
    const payload = {
      name: "Super Admin",
      username: "Super Admin",
      email: "superadmin@gmail.com",
      password,
      phone: "085325224829",
      gender: "Male",
      kk: "3318161304010001",
      roleId: 1,
      isActive: true,
    };

    const userData = await User.create(payload, { transaction });
    // create sponsorKey
    const userSponsor = await SponsorKey.create(
      { userId: userData.userId, key: sponsorKey },
      { transaction }
    );
    await userData.update({ sponsorId: userSponsor.id }, { transaction });
    console.log("[DONE CREATE USER]");
    process.exit(0);
  } catch (err) {
    console.log("Error : ", err);
    process.exit(0);
  }
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
bulkSync();
// createUser()
