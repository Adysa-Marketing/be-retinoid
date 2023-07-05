const router = require("express").Router();
const Statistic = require("./statistic");
const IsAdmin = require("../../../middleware/isAdmin");

// admin
router.get("/", Statistic.ChartSales);
router.get("/product", Statistic.Product);
router.get("/agen", Statistic.Agen);
router.get("/member", Statistic.Member);
router.get("/package", Statistic.Package);
router.get("/stokis", Statistic.Stokis);
router.get("/sale", Statistic.TrSale);
router.get("/income", Statistic.Income);
router.get("/mon-income", Statistic.MonthlyIncome);
router.get("/outcome", Statistic.Outcome);
router.get("/mon-outcome", Statistic.MonthlyOutcome);
router.get("/sale-stokis", Statistic.TrStokis);
router.get("/income-stokis", Statistic.IncomeTrStokis);
router.get("/mon-income-stokis", Statistic.MonthlyIncomeTrStokis);
router.get("/mon-rw", Statistic.MonthlyTrReward);
router.get("/mon-wd", Statistic.MonthlyWd);
router.get("/mon-spend-wd", Statistic.MonthlySpendingWd);

// agen + member
router.get("/agen-sale", Statistic.ATrSale);
router.get("/agen-profit", Statistic.AgenProfit);
router.get("/agen-mon-profit", Statistic.MonthlyAgenProfit);
router.get("/bonus", Statistic.Bonus);
router.get("/mon-bonus", Statistic.MonthlyBonus);
router.get("/success-wd", Statistic.SuccessWidhraw);
router.get("/referral", Statistic.Referrals);
router.get("/tr-reward", Statistic.TrReward);

module.exports = router;
