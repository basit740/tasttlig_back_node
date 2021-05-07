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
const festival_service = require("../festival/festival");

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
  console.log("db_user from create new food sample claim",db_user)

  console.log("db_all_products from create new food sample claim",db_all_products)
  console.log("quantityAfterClaim from create new food sample claim",quantityAfterClaim)
  console.log(" product_claim_detailsfrom create new food sample claim",product_claim_details)
  try {
    await db.transaction(async (trx) => {
      const db_food_sample_claim = await trx("user_claims")
        .insert(product_claim_details)
        .returning("*");

      if (!db_food_sample_claim) {
        return {
          success: false,
          details: "Inserting new food sample claim failed.",
        };
      }

      if (quantityAfterClaim >= 0) {
        await db("products")
          .where({ product_id: db_food_sample_claim[0].claimed_product_id })
          .update({ claimed_total_quantity: quantityAfterClaim });
      }

      await sendClaimedEmailToUser(
        db_user,
        db_all_products,
        db_food_sample_claim[0]
      );

      // await sendClaimedEmailToProvider(
      //   db_user,
      //   db_all_products,
      //   db_food_sample_claim[0]
      // );

      //assign festival end-date and festival to guest subscription package after product claim
      const subs = await user_profile_service.getValidSubscriptionsByUserId(
        product_claim_details.claim_user_id
      );

      const response = await festival_service.getFestivalDetails(
        product_claim_details.festival_id
      );
      const getFestivalEndDate = response.details[0].festival_end_date;
      console.log("subs", subs);
      subs &&
        subs.user.map((sub) => {
          if (
            sub.subscription_code === "G_BASIC" ||
            sub.subscription_code === "G_MSHIP1" ||
            sub.subscription_code === "G_MSHIP2" ||
            sub.subscription_code === "G_MSHIP3" ||
            (sub.subscription_code === "G_AMB" &&
              sub.suscribed_festivals == null)
          ) {
            /* let subscription_end_datetime = null;
            subscription_end_datetime = new Date(
              new Date().setMonth(new Date().getMonth() + Number(1))
            );
            console.log("sub date", subscription_end_datetime); */

            const updateSub = async (subId, subDate, festivalId) => {
              await db("user_subscriptions")
                .where({
                  user_subscription_id: subId,
                  user_subscription_status: "ACTIVE",
                })
                .update({
                  subscription_end_datetime: subDate,
                  suscribed_festivals: [festivalId],
                })
                .returning("*")
                .catch((reason) => {
                  console.log(reason);
                  return { success: false, message: reason };
                });
            };

            updateSub(
              sub.user_subscription_id,
              getFestivalEndDate,
              product_claim_details.festival_id
            );
          }
        });
      //assign festival end-date and festival to guest subscription package after product claim ended
    });

    return { success: true, details: "Success." };
  } catch (error) {
    console.log("error", error);
    return { success: false, details: error.message };
  }
};

// Create food sample claim helper function
const createNewProductClaim = async (
  db_user,
  db_all_products,
  quantityAfterClaim,
  product_claim_details
) => {
  console.log("db_user from create new food sample claim",db_user)

  console.log("db_all_products from create new food sample claim",db_all_products)
  console.log("quantityAfterClaim from create new food sample claim",quantityAfterClaim)
  console.log(" product_claim_detailsfrom create new food sample claim",product_claim_details)
  try {
    await db.transaction(async (trx) => {
      const db_food_sample_claim = await trx("user_claims")
        .insert(product_claim_details)
        .returning("*");

      if (!db_food_sample_claim) {
        return {
          success: false,
          details: "Inserting new food sample claim failed.",
        };
      }

      if (quantityAfterClaim >= 0) {
        await db("products")
          .where({ product_id: db_food_sample_claim[0].claimed_product_id })
          .update({ claimed_total_quantity: quantityAfterClaim });
      }

      await sendClaimedEmailToUser(
        db_user,
        db_all_products,
        db_food_sample_claim[0]
      );

      // await sendClaimedEmailToProvider(
      //   db_user,
      //   db_all_products,
      //   db_food_sample_claim[0]
      // );

    });

    return { success: true, details: "Success." };
  } catch (error) {
    console.log("error", error);
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
      .pluck("claimed_product_id")
      .from("user_claims")
      .where("user_claim_email", email)
      .where("claimed_product_id", food_sample_id);

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
      .from("user_claims")
      .where("user_claim_email", email);

    if (food_sample_id) {
      query.where("claimed_product_id", food_sample_id);
    }

    const count = await query;

    return { success: true, count };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Confirm food sample claim helper function
const confirmProductClaim = async (
  claimId,
  quantityAfterRedeem,
  totalRedeemQuantity
) => {
  try {
    console.log("claimId",claimId)
    console.log("quantityAfterRedeem",quantityAfterRedeem)
    console.log("totalRedeemQuantity",totalRedeemQuantity)
    
    let db_product;
    let db_food_sample_claim;
    let db_business;
    let db_user;
    await db.transaction(async (trx) => {
      db_food_sample_claim = await trx("user_claims")
        .where({ claim_viewable_id: parseInt(claimId) })
        .update({
          stamp_status: Food_Sample_Claim_Status.CONFIRMED,
          current_stamp_status: "Redeemed",
        })
        .returning("*");
      if (quantityAfterRedeem >= 0) {
        db_product = await db("products")
          .where({ product_id: db_food_sample_claim[0].claimed_product_id })
          .update({
            quantity: quantityAfterRedeem,
            redeemed_total_quantity: totalRedeemQuantity,
          })
          .returning("*");
      }
      //console.log(db_food_sample_claim);
      //insert data to user_reviews
      await db("user_reviews").insert({
        review_user_id: db_food_sample_claim[0].claim_user_id,
        review_user_email: db_food_sample_claim[0].user_claim_email,
        review_product_id: db_food_sample_claim[0].claimed_product_id,
        review_status: "NOT REVIEWED",
        review_ask_count: 0,
      });
    });
    if (db_product && db_food_sample_claim) {
      db_business = await user_profile_service.getBusinessDetailsByUserId(
        db_product[0].product_user_id
      );
      db_user = await user_profile_service.getUserById(
        db_food_sample_claim[0].claim_user_id
      );
    }

    sendRedeemedEmailToUser(
      db_user,
      db_food_sample_claim[0],
      db_product[0],
      db_business
    );

    return { success: true, details: "Success." };
  } catch (error) {
    console.log(error);
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

// Confirm service claim helper function
const confirmServiceClaim = async (
  claimId,
  quantityAfterRedeem,
  totalRedeemQuantity
) => {
  try {
    console.log("claimId",claimId)
    console.log("quantityAfterRedeem",quantityAfterRedeem)
    console.log("totalRedeemQuantity",totalRedeemQuantity)
    
    let db_product;
    let db_food_sample_claim;
    let db_business;
    let db_user;
    await db.transaction(async (trx) => {
      db_food_sample_claim = await trx("user_claims")
        .where({ claim_viewable_id: parseInt(claimId) })
        .update({
          stamp_status: Food_Sample_Claim_Status.CONFIRMED,
          current_stamp_status: "Redeemed",
        })
        .returning("*");
      if (quantityAfterRedeem >= 0) {
        db_product = await db("services")
          .where({ service_id: db_food_sample_claim[0].claimed_service_id })
          .update({
            service_capacity: quantityAfterRedeem,
            redeemed_total_quantity: totalRedeemQuantity,
          })
          .returning("*");
      }
      //console.log(db_food_sample_claim);
      //insert data to user_reviews
      await db("user_reviews").insert({
        review_user_id: db_food_sample_claim[0].claim_user_id,
        review_user_email: db_food_sample_claim[0].user_claim_email,
        review_product_id: db_food_sample_claim[0].claimed_product_id,
        review_status: "NOT REVIEWED",
        review_ask_count: 0,
      });
    });
    if (db_product && db_food_sample_claim) {
      db_business = await user_profile_service.getBusinessDetailsByUserId(
        db_product[0].product_user_id
      );
      db_user = await user_profile_service.getUserById(
        db_food_sample_claim[0].claim_user_id
      );
    }

    sendRedeemedEmailToUser(
      db_user,
      db_food_sample_claim[0],
      db_product[0],
      db_business
    );

    return { success: true, details: "Success." };
  } catch (error) {
    console.log(error);
    return { success: false, details: error.message };
  }
};


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
// Send claimed food sample email to owner helper function
const sendRedeemedEmailToUser = async (
  db_user,
  db_food_sample_claim,
  db_product,
  db_business
) => {
  console.log("db_food_sample", db_food_sample_claim);
  console.log("db_product", db_product);
  console.log("db_user", db_user);
  console.log("db_business", db_business);
  const token = jwt.sign(
    {
      claim_id: db_food_sample_claim.claim_id,
      food_sample_id: db_food_sample_claim.claimed_product_id,
      db_user: {
        email: db_user.email,
        first_name: db_user.first_name,
        last_name: db_user.last_name,
      },
    },
    process.env.EMAIL_SECRET
  );

  const url = `${process.env.SITE_BASE}/dashboard?token=${token}`;

  return Mailer.sendMail({
    from: process.env.SES_DEFAULT_FROM,
    to: db_food_sample_claim.user_claim_email,
    bcc: ADMIN_EMAIL,
    subject: `[Tasttlig] Food sample has been redeemed - ${db_product.title}`,
    template: "redeemed_food_sample",
    context: {
      business_name: db_business.business_details_all.business_name,
      first_name: db_user.first_name === "NA" ? "" : db_user.first_name,
      last_name: db_user.last_name === "NA" ? "" : db_user.last_name,
      email: db_user.email,
      title: db_product.title,
      //food_ad_code: db_food_sample_claim.food_ad_code,
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
        "services.*",
        "experiences.*",
        "user_claims.*",
        "tasttlig_users.first_name",
        "tasttlig_users.last_name",
        "nationalities.nationality",
        "nationalities.alpha_2_code",
        db.raw("ARRAY_AGG(product_images.product_image_url) as image_urls")
      )
      .from("user_claims")
      .leftJoin(
        "products",
        "user_claims.claimed_product_id",
        "products.product_id"
      )
      .leftJoin(
        "product_images",
        "products.product_id",
        "product_images.product_id"
      )
      .leftJoin(
        "services",
        "user_claims.claimed_service_id",
        "services.service_id"
      )
      .leftJoin(
        "experiences",
        "user_claims.claimed_experience_id",
        "experiences.experience_id"
      )
      .leftJoin(
        "tasttlig_users",
        "user_claims.claim_user_id",
        "tasttlig_users.tasttlig_user_id"
      )
      .leftJoin("nationalities", "products.nationality_id", "nationalities.id")
      .groupBy("user_claims.claim_user_id")
      .groupBy("user_claims.claim_id")
      .groupBy("products.product_id")
      .groupBy("services.service_id")
      .groupBy("experiences.experience_id")
      .groupBy("tasttlig_users.first_name")
      .groupBy("tasttlig_users.last_name")
      .groupBy("nationalities.nationality")
      .groupBy("nationalities.alpha_2_code")
      .having("claim_user_id", "=", user_id);

    return { success: true, details: db_food_sample_claim };
  } catch (error) {
    console.log(error);
    return { success: false, error: error.message };
  }
};

// Get user food sample claims helper function
const getUserProductsRedeems = async (user_id, keyword, db_user) => {
  let query = db
    .select(
      "products.*",
      "user_claims.*",
      "tasttlig_users.first_name",
      "tasttlig_users.last_name",
      "nationalities.nationality",
      "nationalities.alpha_2_code",
      db.raw("ARRAY_AGG(product_images.product_image_url) as image_urls")
    )
    .from("user_claims")
    .leftJoin(
      "products",
      "user_claims.claimed_product_id",
      "products.product_id"
    )
    .leftJoin(
      "product_images",
      "products.product_id",
      "product_images.product_id"
    )
    .leftJoin(
      "tasttlig_users",
      "user_claims.claim_user_id",
      "tasttlig_users.tasttlig_user_id"
    )
   
    .leftJoin("nationalities", "products.nationality_id", "nationalities.id")
    .groupBy("products.product_id")
    .groupBy("user_claims.claim_id")
    .groupBy("products.product_user_id")
    .groupBy("tasttlig_users.first_name")
    .groupBy("tasttlig_users.last_name")
    .groupBy("nationalities.nationality")
    .groupBy("nationalities.alpha_2_code")
    .having("product_user_id", "=", user_id,  );

  console.log("keyword from condfition: ", user_id);
  if (keyword) {
    // keyword=parseInt(keyword)
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
      // console.log("value from redeem>>.>>>", value);
      return { success: true, details: value };
    })
    .catch((reason) => {
      console.log("service problem>>>>>>", reason);
      return { success: false, details: reason };
    });
};


// Get user service redeeming helper function
const getUserServiceRedeems = async (user_id, keyword, db_user) => {
  let query = db
    .select(
      "services.*",
      "user_claims.*",
      "tasttlig_users.first_name",
      "tasttlig_users.last_name",
      // "nationalities.nationality",
      // "nationalities.alpha_2_code",
      db.raw("ARRAY_AGG(service_images.service_image_url) as image_urls")
    )
    .from("user_claims")
    .leftJoin(
      "services",
      "user_claims.claimed_service_id",
      "services.service_id"
    )
    .leftJoin(
      "service_images",
      "services.service_id",
      "service_images.service_id"
    )
    .leftJoin(
      "tasttlig_users",
      "user_claims.claim_user_id",
      "tasttlig_users.tasttlig_user_id"
    )
   
    // .leftJoin("nationalities", "services.nationality_id", "nationalities.id")
    .groupBy("services.service_id")
    .groupBy("user_claims.claim_id")
    .groupBy("services.service_user_id")
    .groupBy("tasttlig_users.first_name")
    .groupBy("tasttlig_users.last_name")
    // .groupBy("nationalities.nationality")
    // .groupBy("nationalities.alpha_2_code")
    .having("services.service_user_id", "=", user_id,  );

  console.log("keyword from condition: ", user_id);
  if (keyword) {
    // keyword=parseInt(keyword)
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
      // console.log("value from redeem>>.>>>", value);
      return { success: true, details: value };
    })
    .catch((reason) => {
      console.log("service problem>>>>>>", reason);
      return { success: false, details: reason };
    });
};

// Get user food sample claims helper function
const getUserExperiencesRedeems = async (user_id, keyword, db_user) => {
  console.log("db_user", db_user)
  let query = db
    .select(
      "experiences.*",
      "user_claims.*",
      "tasttlig_users.first_name",
      "tasttlig_users.last_name",
      "nationalities.nationality",
      "nationalities.alpha_2_code",
      db.raw("ARRAY_AGG(experience_images.experience_image_url) as image_urls")
    )
    .from("user_claims")
    .leftJoin(
      "experiences",
      "user_claims.claimed_experience_id",
      "experiences.experience_id"
    )
    .leftJoin(
      "experience_images",
      "experiences.experience_id",
      "experience_images.experience_id"
    )
    .leftJoin(
      "tasttlig_users",
      "user_claims.claim_user_id",
      "tasttlig_users.tasttlig_user_id"
    )

    .leftJoin("nationalities",
     "experiences.experience_nationality_id", 
     "nationalities.id"
     )
    .groupBy("user_claims.claim_id")
    .groupBy("experiences.experience_id")
    .groupBy("tasttlig_users.first_name")
    .groupBy("tasttlig_users.last_name")
    .groupBy("nationalities.nationality")
    .groupBy("nationalities.alpha_2_code")
    .having("experience_business_id", "=", db_user.user.business_details_id, )

  if (keyword) {
    // keyword=parseInt(keyword)
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
  console.log("query from condfition: ", query);

  return await query
    .then((value) => {
      // console.log("value from redeem>>.>>>", value);
      return { success: true, details: value };
    })
    .catch((reason) => {
      console.log("service problem>>>>>>", reason);
      return { success: false, details: reason };
    });
};


// Confirm food sample claim helper function
const confirmExperienceClaim = async (
  claimId,
  quantityAfterRedeem,
  totalRedeemQuantity
) => {
  try {
    await db.transaction(async (trx) => {
      const db_food_sample_claim = await trx("user_claims")
        .where({ claim_viewable_id: parseInt(claimId) })
        .update({
          stamp_status: Food_Sample_Claim_Status.CONFIRMED,
          current_stamp_status: "Redeemed",
        })
        .returning("*");
      if (quantityAfterRedeem >= 0) {
        await db("experiences")
          .where({
            experience_id: db_food_sample_claim[0].claimed_experience_id,
          })
          .update({
            experience_capacity: quantityAfterRedeem,
            redeemed_total_quantity: totalRedeemQuantity,
          });
        // .returning("*")
      }
    });

    return { success: true, details: "Success." };
  } catch (error) {
    return { success: false, details: error.message };
  }
};


// Confirm service claim helper function
// const confirmServiceClaim = async (
//   claimId,
//   quantityAfterRedeem,
//   totalRedeemQuantity
// ) => {
//   try {
//     await db.transaction(async (trx) => {
//       const db_food_sample_claim = await trx("user_claims")
//         .where({ claim_viewable_id: parseInt(claimId) })
//         .update({
//           stamp_status: Food_Sample_Claim_Status.CONFIRMED,
//           current_stamp_status: "Redeemed",
//         })
//         .returning("*");
//       if (quantityAfterRedeem >= 0) {
//         await db("services")
//           .where({
//             service_id: db_food_sample_claim[0].claimed_service_id,
//           })
//           .update({
//             service_capacity: quantityAfterRedeem,
//             redeemed_total_quantity: totalRedeemQuantity,
//           });
//         // .returning("*")
//       }
//     });

//     return { success: true, details: "Success." };
//   } catch (error) {
//     return { success: false, details: error.message };
//   }
// };

// Get experience claim count helper function
const getExperienceClaimCount = async (email, food_sample_id) => {
  try {
    const query = db
      .select("count(*)")
      .from("user_claims")
      .where("user_claim_email", email);

    if (food_sample_id) {
      query.where("claimed_experience_id", food_sample_id);
    }

    const count = await query;

    return { success: true, count };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get experience claim count helper function
const getServiceClaimCount = async (email, food_sample_id) => {
  try {
    const query = db
      .select("count(*)")
      .from("user_claims")
      .where("user_claim_email", email);

    if (food_sample_id) {
      query.where("claimed_service_id", food_sample_id);
    }

    const count = await query;

    return { success: true, count };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// User can claim food sample helper function
const userCanClaimExperience = async (email, food_sample_id) => {
  try {
    const { user } = await user_profile_service.getUserByEmailWithSubscription(
      email
    );

    const claimIds = await db
      .pluck("claimed_experience_id")
      .from("user_claims")
      .where("user_claim_email", email)
      .where("claimed_experience_id", food_sample_id);

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


// User can claim service helper function
const userCanClaimService = async (email, food_sample_id) => {
  try {
    const { user } = await user_profile_service.getUserByEmailWithSubscription(
      email
    );

    const claimIds = await db
      .pluck("claimed_service_id")
      .from("user_claims")
      .where("user_claim_email", email)
      .where("claimed_service_id", food_sample_id);

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
          message: "Service has already been claimed.",
        };
      }
    }

    return { success: true, canClaim: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Create experience claim helper function
const createNewExperienceClaim = async (
  db_user,
  db_all_products,
  quantityAfterClaim,
  product_claim_details
) => {
  try {
    await db.transaction(async (trx) => {
      const db_food_sample_claim = await trx("user_claims")
      .insert(product_claim_details)
      .returning("*");
      
      if (!db_food_sample_claim) {
        return {
          success: false,
          details: "Inserting new food sample claim failed.",
        };
      }
      
      if (quantityAfterClaim >= 0) {
        await db("experiences")
        .where({
          experience_id: db_food_sample_claim[0].claimed_experience_id,
        })
        .update({ claimed_total_quantity: quantityAfterClaim });
      }
      console.log("db_food_sample_claim", db_food_sample_claim)

      await sendClaimedExperienceEmailToUser(
        db_user,
        db_all_products,
        db_food_sample_claim[0]
      );

      await sendClaimedExperienceEmailToProvider(
        db_user,
        db_all_products,
        db_food_sample_claim[0]
      );

      //assign festival end-date and festival to guest subscription package after product claim
      const subs = await user_profile_service.getValidSubscriptionsByUserId(
        product_claim_details.claim_user_id
      );

      const response = await festival_service.getFestivalDetails(
        product_claim_details.festival_id
      );
      const getFestivalEndDate = response.details[0].festival_end_date;
      console.log("subs", subs);
      subs &&
        subs.user.map((sub) => {
          if (
            sub.subscription_code === "G_BASIC" ||
            sub.subscription_code === "G_MSHIP1" ||
            sub.subscription_code === "G_MSHIP2" ||
            sub.subscription_code === "G_MSHIP3" ||
            (sub.subscription_code === "G_AMB" &&
              sub.suscribed_festivals == null)
          ) {
            /* let subscription_end_datetime = null;
            subscription_end_datetime = new Date(
              new Date().setMonth(new Date().getMonth() + Number(1))
            );
            console.log("sub date", subscription_end_datetime); */

            const updateSub = async (subId, subDate, festivalId) => {
              await db("user_subscriptions")
                .where({
                  user_subscription_id: subId,
                  user_subscription_status: "ACTIVE",
                })
                .update({
                  subscription_end_datetime: subDate,
                  suscribed_festivals: [festivalId],
                })
                .returning("*")
                .catch((reason) => {
                  console.log(reason);
                  return { success: false, message: reason };
                });
            };

            updateSub(
              sub.user_subscription_id,
              getFestivalEndDate,
              product_claim_details.festival_id
            );
          }
        });
      //assign festival end-date and festival to guest subscription package after product claim ended
    });

    return { success: true, details: "Success." };
  } catch (error) {
    console.log("error", error);
    return { success: false, details: error.message };
  }
};

// Send claimed food sample email to user helper function
const sendClaimedExperienceEmailToUser = async (
  db_user,
  db_food_sample,
  db_food_sample_claim
) => {
  const token = jwt.sign(
    {
      claim_id: db_food_sample_claim.claim_id,
      experience_id: db_food_sample.experience_id,
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
    subject: `[Tasttlig] You have claimed ${db_food_sample.experience_name}`,
    template: "new_food_sample_claim",
    context: {
      first_name: db_user.first_name === "NA" ? "" : db_user.first_name,
      host_first_name: db_food_sample.first_name,
      title: db_food_sample.experience_name,
      business_name: db_food_sample.business_name,
      address: db_food_sample.address,
      city: db_food_sample.city,
      state: db_food_sample.state,
      postal_code: db_food_sample.postal_code,
      start_date: formatDate(db_food_sample.start_date),
      end_date: formatDate(db_food_sample.end_date),
      start_time: formatMilitaryToStandardTime(db_food_sample.start_time),
      end_time: formatMilitaryToStandardTime(db_food_sample.end_time),
      description: db_food_sample.experience_description,
      //frequency: db_food_sample.frequency,
      code: db_food_sample.experience_code,
      url,
    },
  });
};

// Send claimed food sample email to owner helper function
const sendClaimedExperienceEmailToProvider = async (
  db_user,
  db_food_sample,
  db_food_sample_claim
) => {
  const token = jwt.sign(
    {
      claim_id: db_food_sample_claim.claim_id,
      food_sample_id: db_food_sample.experience_id,
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
    subject: `[Tasttlig] Food sample has been reserved - ${db_food_sample.experience_name}`,
    template: "new_food_sample_reserved",
    context: {
      host_first_name: db_food_sample.first_name,
      first_name: db_user.first_name === "NA" ? "" : db_user.first_name,
      last_name: db_user.last_name === "NA" ? "" : db_user.last_name,
      email: db_user.email,
      title: db_food_sample.experience_name,
      food_ad_code: db_food_sample.experience_code,
      url,
    },
  });
};


// Create experience claim helper function
const createNewServiceClaim = async (
  db_user,
  db_all_products,
  quantityAfterClaim,
  product_claim_details
) => {
  try {
    await db.transaction(async (trx) => {
      const db_food_sample_claim = await trx("user_claims")
      .insert(product_claim_details)
      .returning("*");
      
      if (!db_food_sample_claim) {
        return {
          success: false,
          details: "Inserting new food sample claim failed.",
        };
      }
      
      if (quantityAfterClaim >= 0) {
        await db("services")
        .where({
          service_id: db_food_sample_claim[0].claimed_service_id,
        })
        .update({ claimed_total_quantity: quantityAfterClaim });
      }
      console.log("db_food_sample_claim", db_food_sample_claim)

      await sendClaimedServiceEmailToUser(
        db_user,
        db_all_products,
        db_food_sample_claim[0]
      );

      // await sendClaimedServiceEmailToProvider(
      //   db_user,
      //   db_all_products,
      //   db_food_sample_claim[0]
      // );

      //assign festival end-date and festival to guest subscription package after product claim
      const subs = await user_profile_service.getValidSubscriptionsByUserId(
        product_claim_details.claim_user_id
      );

      const response = await festival_service.getFestivalDetails(
        product_claim_details.festival_id
      );
      const getFestivalEndDate = response.details[0].festival_end_date;
      console.log("subs", subs);
      subs &&
        subs.user.map((sub) => {
          if (
            sub.subscription_code === "G_BASIC" ||
            sub.subscription_code === "G_MSHIP1" ||
            sub.subscription_code === "G_MSHIP2" ||
            sub.subscription_code === "G_MSHIP3" ||
            (sub.subscription_code === "G_AMB" &&
              sub.suscribed_festivals == null)
          ) {
            /* let subscription_end_datetime = null;
            subscription_end_datetime = new Date(
              new Date().setMonth(new Date().getMonth() + Number(1))
            );
            console.log("sub date", subscription_end_datetime); */

            const updateSub = async (subId, subDate, festivalId) => {
              await db("user_subscriptions")
                .where({
                  user_subscription_id: subId,
                  user_subscription_status: "ACTIVE",
                })
                .update({
                  subscription_end_datetime: subDate,
                  suscribed_festivals: [festivalId],
                })
                .returning("*")
                .catch((reason) => {
                  console.log(reason);
                  return { success: false, message: reason };
                });
            };

            updateSub(
              sub.user_subscription_id,
              getFestivalEndDate,
              product_claim_details.festival_id
            );
          }
        });
      //assign festival end-date and festival to guest subscription package after product claim ended
    });

    return { success: true, details: "Success." };
  } catch (error) {
    console.log("error", error);
    return { success: false, details: error.message };
  }
};

// Send claimed food sample email to user helper function
const sendClaimedServiceEmailToUser = async (
  db_user,
  db_food_sample,
  db_food_sample_claim
) => {
  const token = jwt.sign(
    {
      claim_id: db_food_sample_claim.claim_id,
      Service_id: db_food_sample.service_id,
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
    subject: `[Tasttlig] You have claimed ${db_food_sample.service_name}`,
    template: "new_food_sample_claim",
    context: {
      first_name: db_user.first_name === "NA" ? "" : db_user.first_name,
      host_first_name: db_food_sample.first_name,
      title: db_food_sample.experience_name,
      business_name: db_food_sample.business_name,
      address: db_food_sample.address,
      city: db_food_sample.city,
      state: db_food_sample.state,
      postal_code: db_food_sample.postal_code,
      start_date: formatDate(db_food_sample.start_date),
      end_date: formatDate(db_food_sample.end_date),
      // start_time: formatMilitaryToStandardTime(db_food_sample.start_time),
      // end_time: formatMilitaryToStandardTime(db_food_sample.end_time),
      description: db_food_sample.service_description,
      //frequency: db_food_sample.frequency,
      // code: db_food_sample.servicece_code,
      url,
    },
  });
};

// Send claimed food sample email to owner helper function
const sendClaimedServiceEmailToProvider = async (
  db_user,
  db_food_sample,
  db_food_sample_claim
) => {
  console.log('host email',  db_food_sample);
  const token = jwt.sign(
    {
      claim_id: db_food_sample_claim.claim_id,
      food_sample_id: db_food_sample.service_id,
      db_user: {
        email: db_user.email,
        first_name: db_user.first_name,
        last_name: db_user.last_name,
      },
    },
    process.env.EMAIL_SECRET
  );

  const url = `${process.env.SITE_BASE}/confirm-food-sample/${token}`;
  console.log('hosting food sample', db_food_sample.email );
  return Mailer.sendMail({    
    from: process.env.SES_DEFAULT_FROM,
    to: db_food_sample.email,
    bcc: ADMIN_EMAIL,
    subject: `[Tasttlig] Service has been reserved - ${db_food_sample.service_name}`,
    template: "new_service_reserved",
    context: {
      host_first_name: db_food_sample.first_name,
      first_name: db_user.first_name === "NA" ? "" : db_user.first_name,
      last_name: db_user.last_name === "NA" ? "" : db_user.last_name,
      email: db_user.email,
      title: db_food_sample.service_name,
      // food_ad_code: db_food_sample.experience_code,
      url,
    },
  });
};

module.exports = {
  createNewFoodSampleClaim,
  createNewProductClaim,
  getFoodClaimCount,
  userCanClaimFoodSample,
  confirmProductClaim,
  getUserProductsClaims,
  getUserProductsRedeems,
  userCanClaimExperience,
  createNewExperienceClaim,
  sendClaimedExperienceEmailToUser,
  sendClaimedExperienceEmailToProvider,
  getExperienceClaimCount,
  confirmExperienceClaim,
  userCanClaimService,
  createNewServiceClaim,
  sendClaimedServiceEmailToUser,  
  sendClaimedServiceEmailToProvider,
  getServiceClaimCount,
  confirmServiceClaim,
  getUserServiceRedeems,
  getUserExperiencesRedeems
};
