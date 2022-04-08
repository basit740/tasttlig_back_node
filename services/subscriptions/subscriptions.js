"use strict";

const { update } = require("lodash");
// Libraries
const { db } = require("../../db/db-config");

const addFestivalToUserSubscription = async (
  festival_id,
  user_subscription_id
) => {
  console.log("user_subscription_id", user_subscription_id);
  console.log("festival_id", festival_id);
  try {
    let query = await db
      .select("user_subscriptions.*")
      .from("user_subscriptions")
      .where("user_subscription_id", "=", user_subscription_id);
    console.log(query);
    if (query[0].suscribed_festivals) {
      await db.transaction(async (trx) => {
        const db_user_subscription = await trx("user_subscriptions")
          .where({ user_subscription_id })
          .update({
            suscribed_festivals: trx.raw(
              "array_append(suscribed_festivals, ?)",
              [festival_id]
            ),
          })
          .returning("*");

        if (!db_user_subscription) {
          return {
            success: false,
            details: "Inserting new subscription failed.",
          };
        }
      });
    }
    await db.transaction(async (trx) => {
      const db_user_subscription = await trx("user_subscriptions")
        .where({ user_subscription_id })
        .update({ suscribed_festivals: [festival_id] })
        .returning("*");

      if (!db_user_subscription) {
        return {
          success: false,
          details: "Inserting new subscription failed.",
        };
      }
    });
  } catch (error) {
    console.log(error);
    return { success: false, details: error.message };
  }

  return { success: true, details: "Success." };
};

const autoEndSubscriptions = async (
  user_id
) => {
  console.log("user_id", user_id);
  const currentDate = new Date();
  try {
    let query = await db
      .select("user_subscriptions.*")
      .from("user_subscriptions")
      .where("user_id", "=", user_id)
      .andWhere("subscription_end_datetime", ">", currentDate)
      .update({user_subscription_status: "INACTIVE"});
    console.log(query);

    
  } catch (error) {
    console.log(error);
    return { success: false, details: error.message };
  }

  return { success: true, details: "Success." };
};

module.exports = {
  addFestivalToUserSubscription,
  autoEndSubscriptions
};
