const {
  Role,
  TrStatus,
  RwStatus,
  WdStatus,
  PaymentType,
  CommissionLevel,
  AgenStatus,
  Country,
  Province,
  District,
  SubDistrict,
  AccountLevel,
} = require("../../../models");

module.exports.Role = async (req, res) => {
  try {
    const role = await Role.findAll({ attributes: ["id", "name"] });
    return res.json({
      status: "success",
      data: role,
    });
  } catch (error) {
    console.log("[!] Error : ", error.message);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports.TrStatus = async (req, res) => {
  try {
    const trStatus = await TrStatus.findAll({ attributes: ["id", "name"] });
    return res.json({
      status: "success",
      data: trStatus,
    });
  } catch (error) {
    console.log("[!] Error : ", error.message);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports.PaymentType = async (req, res) => {
  try {
    const paymentType = await PaymentType.findAll({
      attributes: ["id", "name"],
    });
    return res.json({
      status: "success",
      data: paymentType,
    });
  } catch (error) {
    console.log("[!] Error : ", error.message);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports.RwStatus = async (req, res) => {
  try {
    const rwStatus = await RwStatus.findAll({ attributes: ["id", "name"] });
    return res.json({
      status: "success",
      data: rwStatus,
    });
  } catch (error) {
    console.log("[!] Error : ", error.message);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports.WdStatus = async (req, res) => {
  try {
    const wdStatus = await WdStatus.findAll({ attributes: ["id", "name"] });
    return res.json({
      status: "success",
      data: wdStatus,
    });
  } catch (error) {
    console.log("[!] Error : ", error.message);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports.CommissionLevel = async (req, res) => {
  try {
    const commissionLevel = await CommissionLevel.findAll({
      attributes: ["id", "name", "percent"],
    });
    return res.json({
      status: "success",
      data: commissionLevel,
    });
  } catch (error) {
    console.log("[!] Error : ", error.message);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports.AgenStatus = async (req, res) => {
  try {
    const agenStatus = await AgenStatus.findAll({ attributes: ["id", "name"] });
    return res.json({
      status: "success",
      data: agenStatus,
    });
  } catch (error) {
    console.log("[!] Error : ", error.message);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports.Country = async (req, res) => {
  try {
    const country = await Country.findAll({
      attributes: ["id", "kode", "name"],
    });
    return res.json({
      status: "success",
      data: country,
    });
  } catch (error) {
    console.log("[!] Error : ", error.message);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports.Province = async (req, res) => {
  try {
    const queryCountry = req.query.countryId
      ? { countryId: req.query.countryId }
      : {};
    const province = await Province.findAll({
      attributes: ["id", "key", "name"],
      where: {
        ...queryCountry,
      },
    });
    return res.json({
      status: "success",
      data: province,
    });
  } catch (error) {
    console.log("[!] Error : ", error.message);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports.District = async (req, res) => {
  try {
    const queryProvince = req.query.provinceId
      ? { provinceId: req.query.provinceId }
      : {};
    const district = await District.findAll({
      attributes: ["id", "key", "name"],
      where: {
        ...queryProvince,
      },
    });
    return res.json({
      status: "success",
      data: district,
    });
  } catch (error) {
    console.log("[!] Error : ", error.message);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports.SubDistrict = async (req, res) => {
  try {
    const queryDistrict = req.query.districtId
      ? { districtId: req.query.districtId }
      : {};
    const subDistrict = await SubDistrict.findAll({
      attributes: ["id", "key", "name"],
      where: {
        ...queryDistrict,
      },
    });
    return res.json({
      status: "success",
      data: subDistrict,
    });
  } catch (error) {
    console.log("[!] Error : ", error.message);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports.AccountLevel = async (req, res) => {
  try {
    const accountLevel = await AccountLevel.findAll({
      attributes: ["id", "name"],
    });
    return res.json({
      status: "success",
      data: accountLevel,
    });
  } catch (error) {
    console.log("[!] Error : ", error.message);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
