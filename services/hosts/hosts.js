"use strict";

const {db} = require("../../db/db-config");
const _ = require("lodash");

const getHostApplications = async () => {
  try {
    const applications = await db
      .select("*")
      .from("tasttlig_users")
      .innerJoin("business_details", "tasttlig_users.tasttlig_user_id", "business_details.user_id")
      .where("tasttlig_users.role", "like", "%RESTAURANT_PENDING%");
    return {
      success: true,
      applications
    }
  } catch (e) {
    return {success: false, error: e.message}
  }
}

const getHostApplication = async (userId) => {
  try {
    const application = await db
      .select("*")
      .from("tasttlig_users")
      .innerJoin("business_details", "tasttlig_users.tasttlig_user_id", "business_details.user_id")
      .innerJoin("hosting_application", "tasttlig_users.tasttlig_user_id", "hosting_application.user_id")
      .innerJoin("payment_bank", "tasttlig_users.tasttlig_user_id", "payment_bank.user_id")
      .where("tasttlig_users.role", "like", "%RESTAURANT_PENDING%")
      .where("tasttlig_users.tasttlig_user_id", "=", userId)
      .first();

    const reviews = await db.select("*")
      .from("external_review")
      .where("external_review.user_id","=", userId);

    const documents = await db.select("*")
      .from("documents")
      .where("documents.user_id","=", userId);

    application.reviews = _.groupBy(reviews, "platform");
    application.documents = documents;

    return {
      success: true,
      application
    }
  } catch (e) {
    return {success: false, error: e.message}
  }
}

module.exports = {
  getHostApplications,
  getHostApplication
}