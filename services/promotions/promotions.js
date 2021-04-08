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
            promotionDelete = await trx("products")
              .where("promotional_discount_id", "=", item)
              .andWhere("product_user_id", "=", user_id)
              .update(
                {promotional_discount_id:null,
                discounted_price:null}
                )
                .then(async () => { 
                  return await trx("promotions")
                .where({
                promotion_id: item,
                promotion_business_id: business_details_id.business_details_id,
                  })
                  .del()
                  .then(() => {
                    return { success: true };
                   }).catch((reason) => {
                    return { success: false, details: reason };
                  });
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
  
   
    

  const applyPromotionToProducts = async (promotion, products) => {
    try{
      for(let product of products) {
        // promotion percentage or discount
        // product price
        if(product.price > 0) {
          console.log("percentage")
          if(promotion.promotion_discount_percentage) {
            var promotional_discount_id = promotion.promotion_id
            var discounted_price = product.price - ((product.price * promotion.promotion_discount_percentage) / 100)
            const update_data = {
              "promotional_discount_id": promotional_discount_id,
              "discounted_price": discounted_price
            }
            // update in db
            await db.transaction(async (trx) => {
              const update_product = await trx("products")
              .where("product_id", "=", product.product_id)
              .update(update_data);
            });
          } else {
            console.log("price")
            var promotional_discount_id = promotion.promotion_id
            var discounted_price = product.price -  promotion.promotion_discount_price
            if(discounted_price < 0) {
              return {
                success: false,
                message: "Promotion price cannot be greater than the price of product"
              }
            }
            const update_data = {
              "promotional_discount_id": promotional_discount_id,
              "discounted_price": discounted_price
            }
            console.log(update_data)
            // update in db
            await db.transaction(async (trx) => {
              const update_product = await trx("products")
              .where("product_id", "=", product.product_id)
              .update(update_data);
            });
          }
        } else {
            return {
              success: false,
              message: "Product ".concat(product.title).concat(" is already free. Cannot apply promotion on a free product")
            }
        }
      }
      return { success: true };
    } catch (error) {
      console.log(error)
      return { success: false, details: error };
    }
  }

module.exports = {
    getPromotionsByUser,
    createNewPromotion,
    deletePromotionsOfUser,
    applyPromotionToProducts
  };