"use strict";

const {db} = require("../../db/db-config");

const deleteInactiveItems = async () => {
  try {
    await db.transaction(async trx => {
      // Delete food samples for rejected inactive applications
      let oldFoodSamples = trx.select("*")
        .from("applications")
        .leftJoin(
          "tasttlig_users",
          "applications.user_id",
          "tasttlig_users.tasttlig_user_id"
        )
        .leftJoin(
          "food_samples",
          "tasttlig_users.tasttlig_user_id",
          "food_samples.food_sample_creater_user_id"
        )
        .leftJoin(
          "food_sample_images",
          "food_samples.food_sample_id",
          "food_sample_images.food_sample_id"
        )
        .where("status", "REJECTED").where("status", "")
    });
  }catch (error) {
    return {success: false, details:error.message};
  }
}


module.exports = {
  deleteInactiveItems
}