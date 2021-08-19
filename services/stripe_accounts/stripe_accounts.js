const { db } = require("../../db/db-config");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

function generateAccountLink(accountID, origin) {
  return stripe.accountLinks
    .create({
      type: "account_onboarding",
      account: accountID,
      refresh_url: `${origin}/onboard-user/refresh`,
      // return_url: `${origin}/success.html`,
      return_url: `${origin}`,
    })
    .then((link) => link.url);
}

// save the account id in the database
function storeStripeAccountId(user_id, account_id) {
  try {
    const entry = { user_id: user_id, account_id: account_id };
    db("stripe_accounts")
      .insert(entry)
      .then(() => {
        console.log("STRIPE ACCOUNT INSERTED", entry);
      });
    return { success: true, message: "account stored" };
  } catch (err) {
    console.log("STRIPE ACCOUNT STORE ERROR", err);
    return { success: false, message: err };
  }
}

async function getStripeAccountId(user_id) {
  // let account_id;
  return await db("stripe_accounts")
    .select("account_id")
    .where({ user_id: user_id })
    .returning("*")
    .then((res) => {
      // account_id = res.length > 0 ? res[res.length - 1] : null;
      return res.length > 0 ? res[res.length - 1] : null;
    })
    .catch((err) => {
      console.log(err);
      return null;
    });
  // return account_id;
  /*
  if (result.length > 0) {
    return result[0];
  } else {
    return null;
  }
  */
}

module.exports = {
  generateAccountLink,
  storeStripeAccountId,
  getStripeAccountId,
};
