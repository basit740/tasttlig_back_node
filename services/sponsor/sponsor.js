"use strict";

// Libraries
const {db} = require("../../db/db-config");

const getUserSponsorships = async (user_id) => {
  return await db
    .select("festivals.*", "user_subscriptions.subscription_code")
    .from("festivals")
    .leftJoin(
      "user_subscriptions",
      "festivals.festival_business_sponsor_id[1]",
      "user_subscriptions.user_id"
    )
    .groupBy("festivals.*")
    .groupBy("user_subscriptions.subscription_code")
    .groupBy("festivals.festival_business_sponsor_id")
    .groupBy("festivals.festival_id")
    .groupBy("user_subscriptions.user_id")
    .where("user_subscriptions.user_id", "=", user_id)
    .andWhere(function () {
      this.where("user_subscriptions.subscription_code", "S_C1")
        .orWhere("user_subscriptions.subscription_code", "S_C2")
        .orWhere("user_subscriptions.subscription_code", "S_C3");
    })
    //.having("user_subscriptions.subscription_code", "S_C1")
    //.orWhere("user_subscriptions.subscription_code", "S_C2")
    //.orWhere("user_subscriptions.subscription_code", "S_C3")
    .then((value) => {
      console.log(value);
      return {success: true, details: value};
    })
    .catch((reason) => {
      console.log(reason);
      return {success: false, details: reason};
    });
};
const getInKindUserSponsorships = async (user_id) => {
  return await db
    .select("festivals.*", "products.title")
    .from("festivals")
    .leftJoin(
      "products",
      "festivals.festival_id",
      "products.festival_selected[1]"
    )
    .leftJoin(
      "business_details",
      "business_details.business_details_id",
      "products.product_business_id"
    )
    .groupBy("festivals.*")
    .groupBy("business_details.business_details_user_id")
    .groupBy("festivals.festival_business_sponsor_id")
    .groupBy("products.title")
    .groupBy("products.product_type")
    .groupBy("products.festival_selected[1]")
    .groupBy("festivals.festival_id")
    .having("business_details.business_details_user_id", "=", Number(user_id))
    .andHaving("products.product_type", "=", "SPONSOR")
    .then((value) => {
      console.log(value);
      return {success: true, details: value};
    })
    .catch((reason) => {
      console.log(reason);
      return {success: false, details: reason};
    });
};

module.exports = {
  getUserSponsorships,
  getInKindUserSponsorships,
};
