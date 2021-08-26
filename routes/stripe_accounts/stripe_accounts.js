const session = require("express-session");
const {
  storeStripeAccountId,
} = require("../../services/stripe_accounts/stripe_accounts.js");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const stripeAccountRouter = require("express").Router();
const stripeAccountService = require("../../services/stripe_accounts/stripe_accounts.js");
const { authenticateToken } = require("../../services/authentication/token");

stripeAccountRouter.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

// create a stripe account for user
stripeAccountRouter.post(
  "/onboard-user",
  authenticateToken,
  async (req, res) => {
    try {
      const account = await stripe.accounts.create({ type: "express" });

      // set payout schedule to weekly
      /*
    stripe.accounts.update(account.id, {
      settings: {
        payouts: {
          schedule: {
            interval: "weekly",
          },
        },
      },
    });
    */

      // store stripe account id in databse
      await stripeAccountService.storeStripeAccountId(req.user.id, account.id);

      // save account ID in session object
      req.session.accountID = account.id;

      const origin = `${req.headers.origin}`;
      const accountLinkURL = await stripeAccountService.generateAccountLink(
        account.id,
        origin
      );
      console.log("ONBOARDING SUCCESSFUL");
      res.send({ url: accountLinkURL });
    } catch (err) {
      console.log("ONBOARDING USER FAILED", err);
      res.status(500).send({
        error: err.message,
      });
    }
  }
);

stripeAccountRouter.get("/onboard-user/refresh", async (req, res) => {
  if (!req.session.accountID) {
    res.redirect("/");
    return;
  }
  try {
    const { accountID } = req.session;
    const origin = `${req.secure ? "https://" : "https://"}${req.headers.host}`;

    const accountLinkURL = await stripeAccountService.generateAccountLink(
      accountID,
      origin
    );
    res.redirect(accountLinkURL);
  } catch (err) {
    console.log("link refresh failed", err);
    res.status(500).send({
      error: err.message,
    });
  }
});

stripeAccountRouter.get(
  "/dashboard-link",
  authenticateToken,
  async (req, res) => {
    console.log(req.user.id);
    try {
      const account_id = await stripeAccountService.getStripeAccountId(
        req.user.id
      );
      let link = "";
      if (account_id) {
        link = await stripe.accounts.createLoginLink(account_id.account_id);
      }
      res.send({ link });
    } catch (err) {
      console.log("request for dashboard link failed", err);
      res.status(500).send({
        error: err.message,
      });
    }
  }
);

module.exports = stripeAccountRouter;
