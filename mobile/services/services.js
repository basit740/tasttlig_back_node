"use strict";

// Libraries
const { db } = require("../../db/db-config");
const Mailer = require("../../email/nodemailer").nodemailer_transporter;
const user_profile_service = require("../../services/profile/user_profile");
const festival_service = require("../../services/festival/festival");

// Environment variables
const ADMIN_EMAIL = process.env.TASTTLIG_ADMIN_EMAIL;

const userCanClaimService = async (email, food_sample_id) => {
  try {
    const { user } = await user_profile_service.getUserByEmailWithSubscription(
      email
    );

    const claimIds = await db
      .pluck("claimed_science_id")
      .from("user_claims")
      .where("user_claim_email", email)
      .where("claimed_science_id", food_sample_id);

    if (claimIds.length) {
      if (user == null && claimIds.length > 3) {
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

const findService = async (service_id) => {
  return await db
    .select("services.*", "business_details.*", "tasttlig_users.*")
    .from("services")
    .leftJoin(
      "business_details",
      "services.service_business_id",
      "business_details.business_details_id"
    )
    .leftJoin(
      "tasttlig_users",
      "business_details.business_details_user_id",
      "tasttlig_users.tasttlig_user_id"
    )
    .groupBy("services.service_id")
    .groupBy("business_details.business_details_id")
    .groupBy("business_details.business_details_user_id")
    .groupBy("tasttlig_users.tasttlig_user_id")
    .having("services.service_id", "=", service_id)
    .first()
    .then((value) => {
      return { success: true, details: value };
    })
    .catch((reason) => {
      return { success: false, details: reason };
    });
};

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

      await sendClaimedServiceEmailToUser(
        db_user,
        db_all_products,
        db_food_sample_claim[0]
      );

      await sendClaimedServiceEmailToProvider(
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

const sendClaimedServiceEmailToUser = async (
  db_user,
  db_food_sample,
  db_food_sample_claim
) => {
  const token = jwt.sign(
    {
      claim_id: db_food_sample_claim.claim_id,
      service_id: db_food_sample.service_id,
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
      title: db_food_sample.service_name,
      business_name: db_food_sample.business_name,
      address: db_food_sample.address,
      city: db_food_sample.city,
      state: db_food_sample.state,
      postal_code: db_food_sample.postal_code,
      start_date: formatDate(db_food_sample.start_date),
      end_date: formatDate(db_food_sample.end_date),
      start_time: formatMilitaryToStandardTime(db_food_sample.start_time),
      end_time: formatMilitaryToStandardTime(db_food_sample.end_time),
      description: db_food_sample.service_description,
      //frequency: db_food_sample.frequency,
      code: db_food_sample.service_code,
      url,
    },
  });
};

const sendClaimedServiceEmailToProvider = async (
  db_user,
  db_food_sample,
  db_food_sample_claim
) => {
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

  return Mailer.sendMail({
    from: process.env.SES_DEFAULT_FROM,
    to: db_food_sample.email,
    bcc: ADMIN_EMAIL,
    subject: `[Tasttlig] Service has been reserved - ${db_food_sample.service_name}`,
    template: "new_food_sample_reserved",
    context: {
      host_first_name: db_food_sample.first_name,
      first_name: db_user.first_name === "NA" ? "" : db_user.first_name,
      last_name: db_user.last_name === "NA" ? "" : db_user.last_name,
      email: db_user.email,
      title: db_food_sample.service_name,
      food_ad_code: db_food_sample.service_code,
      url,
    },
  });
};

module.exports = {
  userCanClaimService,
  findService,
  createNewServiceClaim,
  sendClaimedServiceEmailToProvider,
  sendClaimedServiceEmailToUser,
};
