"use strict";

const {db} = require("../../db/db-config");

const getHostApplications = async () => {
  try {
    const applications = await db
      .select("*")
      .from("tasttlig_users")
      .innerJoin("business_details", "tasttlig_users.tasttlig_user_id", "business_details.user_id")
      .where("tasttlig_users.role", "like", "%HOST_PENDING%");
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
      .where("tasttlig_users.role", "like", "%HOST_PENDING%")
      .where("tasttlig_users.tasttlig_user_id", "=", userId)
      .first();
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