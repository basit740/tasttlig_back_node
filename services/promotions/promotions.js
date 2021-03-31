"use strict";

// Libraries
const { db } = require("../../db/db-config");
const Mailer = require("../email/nodemailer").nodemailer_transporter;


// Create service helper function
const createNewPromotion = async (
  user_details_from_db,
  promotion_information,
  ) => {
  try {
    await db.transaction(async (trx) => {
      const db_service = await trx("promotions")
        .insert(promotion_information)
        .returning("*");

      if (!db_service) {
        return { success: false, details: "Inserting new promotion failed." };
      }

    });

    return { success: true, details: "Success." };
  } catch (error) {
    console.log(error)
    return { success: false, details: error.message };
  }
};


//get promotions details and images by user id
const getPromotionsByUser = async (user_id) => {
    console.log(user_id)
    return await db
      .select("promotions.*")
      .from("promotions")
      .leftJoin(
        "business_details",
        "promotions.promotion_business_id",
        "business_details.business_details_id",
      )
      .groupBy("business_details.business_details_id")
      .groupBy("promotions.promotion_id")
      .having("business_details.business_details_user_id", "=", user_id)
    //   .first()
      .then((value) => {
        if (!value) {
          return { success: false, message: "No promotions found for this user" };
        }
  
        return { success: true, promotions_all: value };
      })
      .catch((error) => {
        return { success: false, message: error };
      });
  };

  const deletePromotionsOfUser = async (user_id, delete_items) => {
    try {
        var promotionDelete;
        for (let item of delete_items) {
          await db.transaction(async (trx) => {
            const business_details_id = await trx("business_details")
              .select("business_details_id")
              .where("business_details_user_id", "=", user_id)
              .first();
            promotionDelete = await trx("promotions")
              .where({
                promotion_id: item,
                promotion_business_id: business_details_id.business_details_id,
              })
              .del()
              .then(() => {
                return { success: true };
              })
              .catch((reason) => {
                return { success: false, details: reason };
              });
          });
        }
        return promotionDelete;
    } catch (error) {
        console.log(error.message)
      return { success: false, details: error };
    }
  };

module.exports = {
    getPromotionsByUser,
    createNewPromotion,
    deletePromotionsOfUser
  };