const router = require("express").Router();
const Statistic = require("./statistic");

// admin
router.get("/stat", Statistic.ChartSales);
router.get("/stat/product", Statistic.Product);
router.get("/stat/agen", Statistic.Agen);
router.get("/stat/member", Statistic.Member);
router.get("/stat/package", Statistic.Package);
router.get("/stat/stokis", Statistic.Stokis);
router.get("/stat/sale", Statistic.TrSale);
router.get("/stat/income", Statistic.Income);
router.get("/stat/mon-income", Statistic.MonthlyIncome);
router.get("/stat/sale-stokis", Statistic.TrStokis);
router.get("/stat/income-stokis", Statistic.IncomeTrStokis);
router.get("/stat/mon-income-stokis", Statistic.MonthlyIncomeTrStokis);
router.get("/stat/mon-rw", Statistic.MonthlyTrReward);
router.get("/stat/mon-wd", Statistic.MonthlyWd);
router.get("/stat/mon-spend-wd", Statistic.MonthlySpendingWd);

// agen + member
router.get("/stat/agen-sale", Statistic.ATrSale);
router.get("/stat/bonus", Statistic.Bonus);
router.get("/stat/mon-bonus", Statistic.MonthlyBonus);
router.get("/stat/success-wd", Statistic.SuccessWidhraw);
router.get("/stat/refferal", Statistic.Refferals);
router.get("/stat/tr-reward", Statistic.TrReward);

module.exports = router;
