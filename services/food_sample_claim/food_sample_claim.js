"use strict";

// Libraries
const { db } = require("../../db/db-config");
const jwt = require("jsonwebtoken");
const Mailer = require("../email/nodemailer").nodemailer_transporter;
const user_profile_service = require("../profile/user_profile");
const Food_Sample_Claim_Status = require("../../enums/food_sample_claim_status");
const {
  formatDate,
  formatMilitaryToStandardTime,
} = require("../../functions/functions");

// Environment variables
const ADMIN_EMAIL = process.env.TASTTLIG_ADMIN_EMAIL;
const MAX_CLAIMS = 3;

// Create food sample claim helper function
const createNewFoodSampleClaim = async (
  db_user,
  db_food_sample,
  food_sample_claim_details
) => {
  try {
    console.log("food_sample_claims detaisl:0", food_sample_claim_details)
    await db.transaction(async (trx) => {
      const db_food_sample_claim = await trx("food_sample_claims")
        .insert(food_sample_claim_details)
        .returning("*");

      if (!db_food_sample_claim) {
        return {
          success: false,
          details: "Inserting new food sample claim failed.",
        };
      }

      // Email to user on claiming food sample
      // await sendPendingClaimedEmailToUser(db_user, db_food_sample);
      await sendClaimedEmailToUser(
        db_user,
        db_food_sample,
        db_food_sample_claim[0]
      );

      await sendClaimedEmailToProvider(
        db_user,
        db_food_sample,
        db_food_sample_claim[0]
      );
    });

    return { success: true, details: "Success." };
  } catch (error) {
    return { success: false, details: error.message };
  }
};

// User can claim food sample helper function
const userCanClaimFoodSample = async (email, food_sample_id) => {
  try {
    const { user } = await user_profile_service.getUserByEmailWithSubscription(
      email
    );

    const claimIds = await db
      .pluck("food_sample_id")
      .from("food_sample_claims")
      .where("food_sample_claim_email", email)
      .where("food_sample_id", food_sample_id);

    if (claimIds.length) {
      if (user == null && claimIds.length > MAX_CLAIMS) {
        return {
          success: true,
          canClaim: false,
          message: "Maximum number of claims reached.",
        };
      } else if (
        (user == null || user.subscription_code.endsWith("_S")) &&
        claimIds.includes(food_sample_id)
      ) {
        return {
          success: true,
          canClaim: false,
          message: "Food sample has already been claimed.",
        };
      }
    }

    return { success: true, canClaim: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get food sample claim count helper function
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

    return { success: true, count };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Confirm food sample claim helper function
const confirmFoodSampleClaim = async (token) => {
  try {
    let payload = jwt.verify(token, process.env.EMAIL_SECRET);

    await db.transaction(async (trx) => {
      await trx("food_sample_claims")
        .where("food_sample_claim_id", payload.claim_id)
        .update({
          status: Food_Sample_Claim_Status.CONFIRMED,
        });

      // const db_food_sample = await trx("food_samples")
      //   .select("food_samples.*")
      //   .where("food_sample_id", payload.food_sample_id)
      //   .first();

      // await sendClaimedEmailToUser(payload.db_user, db_food_sample);
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// const sendPendingClaimedEmailToUser = async (db_user, db_food_sample) => {
//   return Mailer.sendMail({
//     from: process.env.SES_DEFAULT_FROM,
//     to: db_user.email,
//     bcc: ADMIN_EMAIL,
//     subject: `[Tasttlig] You have claimed ${db_food_sample.title}`,
//     template: "new_food_sample_claim_pending",
//     context: {
//       first_name: (db_user.first_name === "NA" ? "" : db_user.first_name),
//       last_name: (db_user.last_name === "NA" ? "" : db_user.last_name),
//       title: db_food_sample.title,
//     },
//   });
// }

// Send claimed food sample email to user helper function
const sendClaimedEmailToUser = async (
  db_user,
  db_food_sample,
  db_food_sample_claim
) => {
  const token = jwt.sign(
    {
      claim_id: db_food_sample_claim.food_sample_claim_id,
      food_sample_id: db_food_sample.food_sample_id,
      db_user: {
        email: db_user.email,
        first_name: db_user.first_name,
        last_name: db_user.last_name,
      },
    },
    process.env.EMAIL_SECRET
  );

  const url = `${process.env.SITE_BASE}/confirm-food-sample/${token}`;

  return Mailer.sendMail({
    from: process.env.SES_DEFAULT_FROM,
    to: db_user.email,
    bcc: ADMIN_EMAIL,
    subject: `[Tasttlig] You have claimed ${db_food_sample.title}`,
    template: "new_food_sample_claim",
    context: {
      first_name: db_user.first_name === "NA" ? "" : db_user.first_name,
      host_first_name: db_food_sample.first_name,
      title: db_food_sample.title,
      business_name: db_food_sample.business_name,
      address: db_food_sample.address,
      city: db_food_sample.city,
      state: db_food_sample.state,
      postal_code: db_food_sample.postal_code,
      start_date: formatDate(db_food_sample.start_date),
      end_date: formatDate(db_food_sample.end_date),
      start_time: formatMilitaryToStandardTime(db_food_sample.start_time),
      end_time: formatMilitaryToStandardTime(db_food_sample.end_time),
      description: db_food_sample.description,
      frequency: db_food_sample.frequency,
      code: db_food_sample.food_ad_code,
      url,
    },
  });
};

// Send claimed food sample email to owner helper function
const sendClaimedEmailToProvider = async (
  db_user,
  db_food_sample,
  db_food_sample_claim
) => {
  const token = jwt.sign(
    {
      claim_id: db_food_sample_claim.food_sample_claim_id,
      food_sample_id: db_food_sample.food_sample_id,
      db_user: {
        email: db_user.email,
        first_name: db_user.first_name,
        last_name: db_user.last_name,
      },
    },
    process.env.EMAIL_SECRET
  );

  const url = `${process.env.SITE_BASE}/confirm-food-sample/${token}`;

  return Mailer.sendMail({
    from: process.env.SES_DEFAULT_FROM,
    to: db_food_sample.email,
    bcc: ADMIN_EMAIL,
    subject: `[Tasttlig] Food sample has been reserved - ${db_food_sample.title}`,
    template: "new_food_sample_reserved",
    context: {
      host_first_name: db_food_sample.first_name,
      first_name: db_user.first_name === "NA" ? "" : db_user.first_name,
      last_name: db_user.last_name === "NA" ? "" : db_user.last_name,
      email: db_user.email,
      title: db_food_sample.title,
      food_ad_code: db_food_sample.food_ad_code,
      url,
    },
  });
};

// Get user food sample claims helper function
const getUserFoodSampleClaims = async (user_id) => {
  try {
    const db_food_sample_claim = await db
      .select(
        "food_samples.*",
        "food_sample_claims.*",
        "tasttlig_users.first_name",
        "tasttlig_users.last_name",
        "nationalities.nationality",
        "nationalities.alpha_2_code",
        db.raw("ARRAY_AGG(food_sample_images.image_url) as image_urls")
      )
      .from("food_sample_claims")
      .leftJoin(
        "food_samples",
        "food_sample_claims.food_sample_id",
        "food_samples.food_sample_id"
      )
      .leftJoin(
        "food_sample_images",
        "food_samples.food_sample_id",
        "food_sample_images.food_sample_id"
      )
      .leftJoin(
        "tasttlig_users",
        "food_sample_claims.food_sample_claim_user_id",
        "tasttlig_users.tasttlig_user_id"
      )
      .leftJoin(
        "nationalities",
        "food_samples.nationality_id",
        "nationalities.id"
      )
      .groupBy("food_sample_claims.food_sample_claim_id")
      .groupBy("food_samples.food_sample_id")
      .groupBy("tasttlig_users.first_name")
      .groupBy("tasttlig_users.last_name")
      .groupBy("nationalities.nationality")
      .groupBy("nationalities.alpha_2_code")
      .having("food_sample_claim_user_id", "=", user_id);

    return { success: true, details: db_food_sample_claim };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = {
  createNewFoodSampleClaim,
  getFoodClaimCount,
  userCanClaimFoodSample,
  confirmFoodSampleClaim,
  getUserFoodSampleClaims,
};
