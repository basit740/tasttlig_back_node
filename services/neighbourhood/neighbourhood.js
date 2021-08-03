"use strict";

// Libraries
const { db } = require("../../db/db-config");
const { generateRandomString } = require("../../functions/functions");
const user_order_service = require("../payment/user_orders");

// Get user by ID helper function
const getUserById = async (id) => {
  return await db
    .select("tasttlig_users.*", db.raw("ARRAY_AGG(roles.role) as role"))
    .from("tasttlig_users")
    .leftJoin(
      "user_role_lookup",
      "tasttlig_users.tasttlig_user_id",
      "user_role_lookup.user_id"
    )
    .leftJoin("roles", "user_role_lookup.role_code", "roles.role_code")
    .groupBy("tasttlig_users.tasttlig_user_id")
    .having("tasttlig_users.tasttlig_user_id", "=", id)
    .first()
    .then((value) => {
      if (!value) {
        return { success: false, message: "No user found." };
      }

      return { success: true, user: value };
    })
    .catch((error) => {
      return { success: false, message: error };
    });
};

const getNeighbourhoodApplications = async () => {
  try {
    const applications = await db
      .select("*")
      .from("applications")
      .leftJoin(
        "tasttlig_users",
        "applications.user_id",
        "tasttlig_users.tasttlig_user_id"
      )
      .groupBy("applications.application_id")
      .groupBy("tasttlig_users.tasttlig_user_id")
      .having("applications.status", "=", "Pending")
      .having("applications.type", "=", "neighbourhood");

    return {
      success: true,
      applications,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const getNeighbourhoodApplicantDetails = async (userId) => {
  try {
    console.log(userId);
    let application = await db
      .select(
        "neighbourhood.*",
        "tasttlig_users.*"
      )
      .from("neighbourhood")
      .leftJoin(
        "tasttlig_users",
        "tasttlig_users.tasttlig_user_id",
        "neighbourhood.user_id"
      )

      .leftJoin(
        "user_role_lookup",
        "tasttlig_users.tasttlig_user_id",
        "user_role_lookup.user_id"
      )

      .groupBy("tasttlig_users.tasttlig_user_id")
      .groupBy("neighbourhood.user_id")
      .groupBy("neighbourhood.neighbourhood_id")
      .groupBy("user_role_lookup.user_role_lookup_id")
      .having("tasttlig_users.tasttlig_user_id", "=", Number(userId))
      //.having("user_role_lookup.role_code", "=", "NHP")
      .first();

    console.log(application);

    return {
      success: true,
      application,
    };
  } catch (error) {
    console.log(error);
    return { success: false, error: error.message };
  }
};


const approveOrDeclineNeighbourhoodApplication = async (
  userId,
  status,

) => {
  try {
    console.log("here entry");
    const db_user_row = await getUserById(userId);

    if (!db_user_row.success) {
      return { success: false, message: db_user_row.message };
    }

    const db_user = db_user_row.user;

    // If status is approved
    if (status === "APPROVED") {
      // update role
      await db("user_role_lookup")
        .where("user_id", db_user.tasttlig_user_id)
        .andWhere("role_code", "NHP")
        .update("role_code", "NH")
        .catch((reason) => {
          return { success: false, message: reason };
        });

          

      await db("applications")
        .where("user_id", db_user.tasttlig_user_id)
        .andWhere("status", "Pending")
        .andWhere("type", "neighbourhood")
        .update("status", "APPROVED")
        .returning("*")
        .catch((reason) => {
          return { success: false, message: reason };
        });

        await db("neighbourhood")
        .where("user_id", db_user.tasttlig_user_id)
        .andWhere("status", "Pending")
        .update("status", "APPROVED")
        .returning("*")
        .catch((reason) => {
          return { success: false, message: reason };
        });



      return { success: true, message: status };
    } else {
      // Remove the role for this user
      await db("user_role_lookup")
        .where({
          user_id: db_user.tasttlig_user_id,
          role_code: "NHP",
        })
        .del();
      // STEP 3: Update applications table status
      await db("applications")
        .where("user_id", db_user.tasttlig_user_id)
        .andWhere("status", "Pending")
        .andWhere("type", "neighbourhood")
        .update("status", "REJECT")
        .returning("*")
        .catch((reason) => {
          return { success: false, message: reason };
        });

      //Update status is business details table
      await db("neighbourhood")
        .where("user_id", db_user.tasttlig_user_id)
        .update("status", "REJECTED")
        .returning("*")
        .catch((reason) => {
          return { success: false, message: reason };
        });
      return { success: true, message: status };
    }
  } catch (error) {
    return { success: false, message: error };
  }
};

module.exports = {
  getNeighbourhoodApplications,
  getNeighbourhoodApplicantDetails,
  approveOrDeclineNeighbourhoodApplication,
};
