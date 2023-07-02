const {
  Role,
  TrStatus,
  RwStatus,
  WdStatus,
  PaymentType,
  CommissionLevel,
  AgenStatus,
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
