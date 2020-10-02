"use strict";

const {db} = require("../../db/db-config");

// Delete food samples and menu for rejected inactive applications
const deleteInactiveItems = async () => {
  try {
    console.log("Deleting Expired Script Started");
    const expiryDate = new Date(new Date().setDate(new Date().getDate() - 3));
    await db.transaction(async trx => {
      let oldApplicationUserIdsQuery = trx.select("user_id")
        .from("applications")
        .where("status", "DECLINED")
        .where("updated_at", "<", expiryDate);
      
      let foodSampleIds = trx.select("food_sample_id")
        .from("food_samples")
        .whereIn("food_sample_creater_user_id", oldApplicationUserIdsQuery);
      
      // Delete food sample images of expired applications
      let foodSampleImagesDeleteCount = await trx("food_sample_images")
        .whereIn("food_sample_id", foodSampleIds)
        .del()
        .then(deleteCount => {
          return deleteCount;
        });
      
      // Delete food samples of expired applications
      let foodSamplesDeleteCount = await trx("food_samples")
        .whereIn("food_sample_id", foodSampleIds)
        .del()
        .then(deleteCount => {
          return deleteCount;
        });
      
      // Delete menu items of expired applications
      let menuItemsDeleteCount = await trx("menu_items")
        .whereIn("menu_item_creator_user_id", oldApplicationUserIdsQuery)
        .del()
        .then(deleteCount => {
          return deleteCount;
        });
      
      console.log("Script executed Successfully");
      console.log("Food samples deleted: " + foodSamplesDeleteCount);
      console.log("Food sample images deleted: " + foodSampleImagesDeleteCount);
      console.log("Menu items deleted: " + menuItemsDeleteCount);
    });
    return true;
  }catch (error) {
    console.log("Error in Script: " + error.message);
    return false;
  }
}


module.exports = {
  deleteInactiveItems
}