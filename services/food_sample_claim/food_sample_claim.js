"use strict";

const db = require("../../db/db-config");
const Mailer = require("../email/nodemailer").nodemailer_transporter;
const {
  formatDate,
  formatMilitaryToStandardTime,
} = require("../../functions/functions");

const ADMIN_EMAIL = process.env.TASTTLIG_ADMIN_EMAIL;

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
    // Email to user on claiming food sample
    await Mailer.sendMail({
      to: db_user.email,
      bcc: ADMIN_EMAIL,
      subject: `[Tasttlig] You have claimed ${db_food_sample.title}`,
      template: "new_food_sample_claim_user",
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
        frequency: db_food_sample.frequency
      },
    });
    return { success: true, details: "success" };
  } catch (err) {
    return { success: false, details: err.message };
  }
};

module.exports = {
  createNewFoodSampleClaim
};
