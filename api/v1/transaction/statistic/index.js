const router = require("express").Router();
const Statistic = require("./statistic");
const IsAdmin = require("../../../middleware/isAdmin");

// admin
router.get("/", Statistic.ChartSales);
router.get("/product", Statistic.Product);
router.get("/user", Statistic.User); //admin, agen, member
router.get("/new-member", Statistic.NewMember); //membar baru bulan ini
// router.get("/member", Statistic.Member);
router.get("/package", Statistic.Package);
router.get("/stokis", Statistic.Stokis);
router.get("/sale", Statistic.TrSale);
// router.get("/mutation", Statistic.Mutation); // dana masuk , dana keluar
router.get("/mon-mutation", Statistic.MonthlyMutation); // dana masuk, dana keluar
// router.get("/outcome", Statistic.Outcome);
// router.get("/mon-outcome", Statistic.MonthlyOutcome);
router.get("/sale-stokis", Statistic.TrStokis);
// router.get("/income-stokis", Statistic.IncomeTrStokis);
// router.get("/mon-income-stokis", Statistic.MonthlyIncomeTrStokis);
router.get("/mon-rw", Statistic.MonthlyTrReward);
router.get("/mon-wd", Statistic.MonthlyWd);
router.get("/mon-spend-wd", Statistic.MonthlySpendingWd);
router.get("/history-sale", Statistic.HistorySale);
router.get("/history-reward", Statistic.HistoryReward);
router.get("/history-stokis", Statistic.HistoryStokis);

// agen + member
router.get("/agen-sale", Statistic.ATrSale);
router.get("/agen-product", Statistic.AgenProductItem);
router.get("/agen-profit", Statistic.AgenProfit);
router.get("/agen-mon-profit", Statistic.MonthlyAgenProfit);
// router.get("/bonus", Statistic.Bonus);
router.get("/mon-bonus", Statistic.MonthlyBonus);
router.get("/success-wd", Statistic.SuccessWidhraw);
router.get("/referral", Statistic.Referrals);
router.get("/tr-reward", Statistic.TrReward);
router.get("/self-info", Statistic.SelfInfo);
router.get("/history-referral", Statistic.HistoryReferral);
router.get("/history-widhraw", Statistic.HistoryWidhraw);
router.get("/history-agen-sale", Statistic.HistoryAgenSale);

module.exports = router;
