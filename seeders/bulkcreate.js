require("dotenv").config({ path: "../.env" });

const {
  AccountLevel,
  AgenStatus,
  CommissionLevel,
  PaymentType,
  ProductCategory,
  Role,
  RwStatus,
  Stokis,
  TrStatus,
  User,
  WdStatus,
  SponsorKey,
} = require("../models");
const db = require("../models");

const bcrypt = require("bcryptjs");
const cryptoString = require("crypto-random-string");

async function createAgenStatus() {
  await AgenStatus.bulkCreate([
    { name: "Pending" },
    { name: "Disabled" },
    { name: "Rejected" },
    { name: "Approved" },
  ]);
  console.log("[DONE CREATE AGEN-STATUS]");
}

async function createCommissionLevel() {
  // buat akun level setelah itu buat komisi beradsarkan account level
  await AccountLevel.bulkCreate([
    { name: "SILVER", amount: 500000, remark: "PAKET STANDAR" },
    { name: "GOLD", amount: 2000000, remark: "PAKET PREMIUM" },
  ]);
  console.log("[DONE CREATE ACCOUNT-LEVEL]");

  await CommissionLevel.bulkCreate([
    // AKUN LEVEL SILVER
    {
      name: "Komisi Silver Level 1",
      percent: 14,
      level: 1,
      remark: "komisi level 1 sebanyak 14% untuk member dengan level silver",
      accountLevelId: 1,
    },
    {
      name: "Komisi Silver Level 2",
      percent: 6,
      level: 2,
      remark: "komisi level 2 sebanyak 6% untuk member dengan level silver",
      accountLevelId: 1,
    },
    {
      name: "Komisi Silver Level 3",
      percent: 4,
      level: 3,
      remark: "komisi level 3 sebanyak 4% untuk member dengan level silver",
      accountLevelId: 1,
    },
    {
      name: "Komisi Silver Level 4",
      percent: 3,
      level: 4,
      remark: "komisi level 4 sebanyak 3% untuk member dengan level silver",
      accountLevelId: 1,
    },
    {
      name: "Komisi Silver Level 5",
      percent: 2,
      level: 5,
      remark: "komisi level 5 sebanyak 2% untuk member dengan level silver",
      accountLevelId: 1,
    },

    // AKUN LEVEL GOLD
    {
      name: "Komisi Gold Level 1",
      percent: 20,
      level: 1,
      remark: "komisi level 1 sebanyak 20% untuk member dengan level gold",
      accountLevelId: 2,
    },
    {
      name: "Komisi Gold Level 2",
      percent: 7,
      level: 2,
      remark: "komisi level 2 sebanyak 7% untuk member dengan level gold",
      accountLevelId: 2,
    },
    {
      name: "Komisi Gold Level 3",
      percent: 4,
      level: 3,
      remark: "komisi level 3 sebanyak 4% untuk member dengan level gold",
      accountLevelId: 2,
    },
    {
      name: "Komisi Gold Level 4",
      percent: 3,
      level: 4,
      remark: "komisi level 4 sebanyak 3% untuk member dengan level gold",
      accountLevelId: 2,
    },
    {
      name: "Komisi Gold Level 5",
      percent: 2,
      level: 5,
      remark: "komisi level 5 sebanyak 2% untuk member dengan level gold",
      accountLevelId: 2,
    },
  ]);
  console.log("[DONE CREATE COMMISSION-LEVEL]");
}

async function createPaymentType() {
  await PaymentType.bulkCreate([{ name: "CASH" }, { name: "TRANSFER" }]);
  console.log("[DONE CREATE PAYMENT-TYPE]");
}

async function createProductCategory() {
  await ProductCategory.bulkCreate([
    {
      name: "Bundle Paket",
      remark:
        "Pembelian Bundle Paket akan bendapatkan potongan harga 20 - 40rb / produk untuk agen stokis",
    },
    {
      name: "Bundle Produk",
      remark:
        "Pembelian Bundle Produk akan bendapatkan potongan harga 10 - 20rb / produk untuk agen stokis",
    },
  ]);
  console.log("[DONE CREATE PRODUCT-CATEGORY]");
}

async function createRole() {
  await Role.bulkCreate([
    { name: "ROOT" },
    { name: "ADMIN" },
    { name: "AGEN" },
    { name: "MEMBER" },
  ]);
  console.log("[DONE CREATE ROLE]");
}

async function createStokis() {
  await Stokis.bulkCreate([
    {
      name: "Agen Stokis Regular",
      price: 10000000,
      discount: 9600000,
      agenDiscount: 10000,
      description:
        "Dengan mendaftar sebagai agen stokis Regular, anda akan mendapatkan 40 product + 20 pin serial register. (profit stokis 10rb/product)",
    },
    {
      name: "Agen Stokis Premiun",
      price: 20000000,
      discount: 18500000,
      agenDiscount: 20000,
      description:
        "Dengan mendaftar sebagai agen stokis Premium, anda akan mendapatkan 80 product + 40 pin serial register. (profit stokis 20rb/product)",
    },
  ]);
  console.log("[DONE CREATE STOKIS]");
}

async function createTrStatus() {
  await TrStatus.bulkCreate([
    { name: "Pending" },
    { name: "Canceled" },
    { name: "Rejected" },
    { name: "Approved" },
    { name: "Delivered" },
  ]);
  console.log("[DONE CREATE TR-STATUS]");
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

async function bulkSync() {
  Promise.all([
    createAgenStatus(),
    createCommissionLevel(),
    createPaymentType(),
    createProductCategory(),
    createRole(),
    createStokis(),
    createTrStatus(),
    createRwStatus(),
    createWdStatus(),
  ])
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
  const sponsorKey = cryptoString({ length: 10, type: "alphanumeric" });
  // const password = bcrypt.hashSync("Rahasia123", bcrypt.genSaltSync(2));
  const password = "Rahasia123";

  try {
    const payload = {
      name: "Super Admin",
      username: "adysaskincare",
      email: "adysaskin@gmail.com",
      password,
      phone: "628121588315",
      gender: "Male",
      kk: "3318161304010001",
      accountLevelId: 1,
      roleId: 1,
      isActive: true,
    };

    const userData = await User.create(payload, { transaction });
    // create sponsorKey
    const userSponsor = await SponsorKey.create(
      { userId: userData.id, key: sponsorKey },
      { transaction }
    );
    await userData.update({ sponsorId: userSponsor.id }, { transaction });
    console.log("user : ", userData);
    transaction.commit();
    console.log("[DONE CREATE USER]");
  } catch (err) {
    transaction.rollback();
    console.log("Error : ", err);
  }
}

// bulkSync();
// createUser();
