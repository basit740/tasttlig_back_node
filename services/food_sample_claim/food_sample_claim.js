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
  db_all_products,
  quantityAfterClaim,
  product_claim_details
) => {
  console.log("data coming from here :" , product_claim_details)
  try {
    await db.transaction(async (trx) => {
      const db_food_sample_claim = await trx("food_sample_claims")
        .insert(product_claim_details)
        .returning("*");

      if (!db_food_sample_claim) {
        return {
          success: false,
          details: "Inserting new food sample claim failed.",
        };
      }
      console.log("food sample claim result:", db_food_sample_claim)

      if(quantityAfterClaim>=0) {
        await db("products")
        .where({ product_id: db_food_sample_claim[0].food_sample_id})
        .update(
         { claimed_total_quantity: quantityAfterClaim}
          )

      }

      await sendClaimedEmailToUser(
        db_user,
        db_all_products,
        db_food_sample_claim[0]
      );

      await sendClaimedEmailToProvider(
        db_user,
        db_all_products,
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
const confirmProductClaim = async (claimId, quantityAfterRedeem, totalRedeemQuantity) => {
  try {
    await db.transaction(async (trx) => {
      const db_food_sample_claim = await trx("food_sample_claims")
        .where({ claim_viewable_id: claimId })
        .update({
          status: Food_Sample_Claim_Status.CONFIRMED,
          current_status: "Redeemed",
        })
        .returning("*");

        if(quantityAfterRedeem>=0) {
          await db("products")
          .where({ product_id: db_food_sample_claim[0].food_sample_id})
          .update(
           { quantity: quantityAfterRedeem,
              redeemed_total_quantity: totalRedeemQuantity
          }
            )
            // .returning("*")

        }
    });

    return { success: true, details: "Success." };
  } catch (error) {
    return { success: false, details: error.message };
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
const getUserProductsClaims = async (user_id) => {
  try {
    const db_food_sample_claim = await db
      .select(
        "products.*",
        "food_sample_claims.*",
        "tasttlig_users.first_name",
        "tasttlig_users.last_name",
        "nationalities.nationality",
        "nationalities.alpha_2_code",
        db.raw("ARRAY_AGG(product_images.product_image_url) as image_urls")
      )
      .from("food_sample_claims")
      .leftJoin(
        "products",
        "food_sample_claims.food_sample_id",
        "products.product_id"
      )
      .leftJoin(
        "product_images",
        "products.product_id",
        "product_images.product_id"
      )
      .leftJoin(
        "tasttlig_users",
        "food_sample_claims.food_sample_claim_user_id",
        "tasttlig_users.tasttlig_user_id"
      )
      .leftJoin(
        "nationalities",
        "products.nationality_id",
        "nationalities.id"
      )
      .groupBy("food_sample_claims.food_sample_claim_id")
      .groupBy("products.product_id")
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

// Get user food sample claims helper function
const getUserProductsRedeems = async (user_id, keyword) => {
  let query = db
      .select(
        "products.*",
        "food_sample_claims.*",
        "tasttlig_users.first_name",
        "tasttlig_users.last_name",
        "nationalities.nationality",
        "nationalities.alpha_2_code",
        db.raw("ARRAY_AGG(product_images.product_image_url) as image_urls")
      )
      .from("food_sample_claims")
      .leftJoin(
        "products",
        "food_sample_claims.food_sample_id",
        "products.product_id"
      )
      .leftJoin(
        "product_images",
        "products.product_id",
        "product_images.product_id"
      )
      .leftJoin(
        "tasttlig_users",
        "food_sample_claims.food_sample_claim_user_id",
        "tasttlig_users.tasttlig_user_id"
      )
      .leftJoin(
        "nationalities",
        "products.nationality_id",
        "nationalities.id"
      )
      .groupBy("food_sample_claims.food_sample_claim_id")
      .groupBy("products.product_id")
      .groupBy("tasttlig_users.first_name")
      .groupBy("tasttlig_users.last_name")
      .groupBy("nationalities.nationality")
      .groupBy("nationalities.alpha_2_code")
      .having("product_user_id", "=", user_id);

      if (keyword) {
        // keyword=parseInt(keyword)
        // console.log("keyword from condfition: ", keyword)
        query = db
          .select(
            "*",
            db.raw(
              "CASE WHEN (phraseto_tsquery('??')::text = '') THEN 0 " +
                "ELSE ts_rank_cd(main.search_text, (phraseto_tsquery('??')::text || ':*')::tsquery) " +
                "END rank",
              [keyword, keyword]
            )
          )
          .from(
            db
              .select(
                "main.*",
                db.raw(
                  "to_tsvector(concat_ws(' '," +
                  "main.title, " +
                  "main.claim_viewable_id, " +
                  "main.first_name)) as search_text"
                )
              )
              .from(query.as("main"))
              .as("main")
          )
          .orderBy("rank", "desc");
      }

      return await query
    .then((value) => {
      return { success: true, details: value };
    })
    .catch((reason) => {
      console.log("service", reason);
      return { success: false, details: reason };
    });
};

module.exports = {
  createNewFoodSampleClaim,
  getFoodClaimCount,
  userCanClaimFoodSample,
  confirmProductClaim,
  getUserProductsClaims,
  getUserProductsRedeems
};
