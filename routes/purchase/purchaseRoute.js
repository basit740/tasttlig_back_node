const purchaseRouter = require("express").Router();
const auth = require("../auth/authFunctions");
const Purchase = require("../../db/queries/purchase");
const { authenticateToken } = auth;

purchaseRouter.post("/purchase", authenticateToken, async (req, res) => {
  const purchase = {
    charge_id: req.body.charge_id,
    amount: req.body.amount,
    receipt_email: req.body.receipt_email,
    receipt_url: req.body.receipt_url,
    fingerprint: req.body.fingerprint,
    source_id: req.body.source_id
  };
  const purchase = await Purchase.createPurchase(purchase, req.user.id);
  res.json(purchase);
});

module.exports = purchaseRouter;
