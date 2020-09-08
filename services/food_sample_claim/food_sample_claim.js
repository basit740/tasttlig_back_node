"use strict";

const {db} = require("../../db/db-config");
const Mailer = require("../email/nodemailer").nodemailer_transporter;
const user_profile_service = require("../profile/user_profile");
const {
  formatDate,
  formatMilitaryToStandardTime,
} = require("../../functions/functions");

const ADMIN_EMAIL = process.env.TASTTLIG_ADMIN_EMAIL;
const MAX_CLAIMS = 3;

const createNewFoodSampleClaim = async (
  db_user,
  db_food_sample,
  food_sample_claim_details
) => {
  try {
    await db.transaction(async (trx) => {
      const db_food_sample_claim = await trx("food_sample_claims")
        .insert(food_sample_claim_details)
        .returning("*");
      if (!db_food_sample_claim) {
        return {
          success: false,
          details: "Inserting new Food Sample Claim failed",
        };
      }
    });
    const mail_list_claimed = [
      ADMIN_EMAIL,
      db_food_sample.email
    ];
    // Email to user on claiming food sample
    await Mailer.sendMail({
      from: process.env.SES_DEFAULT_FROM,
      to: db_user.email,
      bcc: mail_list_claimed,
      subject: `[Tasttlig] You have claimed ${db_food_sample.title}`,
      template: "new_food_sample_claim",
      context: {
        first_name: db_user.first_name,
        last_name: db_user.last_name,
        title: db_food_sample.title,
        address: db_food_sample.address,
        city: db_food_sample.city,
        state: db_food_sample.state,
        postal_code: db_food_sample.postal_code,
        start_date: formatDate(db_food_sample.start_date),
        end_date: formatDate(db_food_sample.end_date),
        start_time: formatMilitaryToStandardTime(db_food_sample.start_time),
        end_time: formatMilitaryToStandardTime(db_food_sample.end_time),
        frequency: db_food_sample.frequency,
        code: db_food_sample.food_ad_code
      },
    });
    return {success: true, details: "success"};
  } catch (err) {
    return {success: false, details: err.message};
  }
};

const userCanClaimFoodSample = async (email, food_sample_id) => {
  try {
    const {user} = await user_profile_service.getUserByEmailWithSubscription(email);

    const claimIds = await db
      .pluck("food_sample_id")
      .from("food_sample_claims")
      .where("food_sample_claim_email", email)
      .where("food_sample_id", food_sample_id);

    if(claimIds.length) {
      if (user == null && claimIds.length >= MAX_CLAIMS) {
        return {
          success: true,
          canClaim: false,
          message: "Maximum number of claims reached"
        }
      } else if((user == null || user.subscription_code.endsWith("_S")) && claimIds.includes(food_sample_id)) {
        return {
          success: true,
          canClaim: false,
          message: "Food sample has already been claimed"
        }
      }
    }

    return {success: true, canClaim: true};
  } catch (e) {
    return {success: false, error: e.message}
  }
}

const getFoodClaimCount = async (email, food_sample_id) => {
  try {
    const query = db
      .select("count(*)")
      .from("food_sample_claims")
      .where("food_sample_claim_email", email);

    if (food_sample_id) {
      query.where("food_sample_id", food_sample_id);
    }

    const count = await query;
    return {success: true, count,};
  } catch (e) {
    return {success: false, error: err.message};
  }
}

module.exports = {
  createNewFoodSampleClaim,
  getFoodClaimCount,
  userCanClaimFoodSample
};
