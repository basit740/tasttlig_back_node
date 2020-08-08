"use strict";

const db = require("../../db/db-config");
const Mailer = require("../email/nodemailer").nodemailer_transporter;
const user_role_manager = require("../profile/user_roles_manager");

const ADMIN_EMAIL = process.env.TASTTLIG_ADMIN_EMAIL;

const createNewFoodSample = async (db_user, food_sample_details, food_sample_images) => {
  try{
    await db.transaction(async trx => {
      food_sample_details.status = "INACTIVE";
      let user_role_object = user_role_manager.createRoleObject(db_user.role)
      if(user_role_object.includes("HOST") && db_user.is_participating_in_festival){
        food_sample_details.status = "ACTIVE";
      }
      const db_food_sample = await trx("food_samples")
        .insert(food_sample_details)
        .returning("*");
      if(!db_food_sample){
        return {success: false, details:"Inserting new Food Sample failed"};
      }
      const images = food_sample_images.map(food_sample_image => ({
        food_sample_id: db_food_sample[0].food_sample_id,
        image_url: food_sample_image
      }));
      await trx("food_sample_images")
        .insert(images);
    });

    // Email to user on submitting the request to upgrade
    await Mailer.sendMail({
      to: db_user.email,
      bcc: ADMIN_EMAIL,
      subject: `[Tasttlig] New Food Sample Created`,
      template: 'new_sample',
      context: {
        first_name: db_user.first_name,
        last_name: db_user.last_name,
        title: food_sample_details.title,
        status: food_sample_details.status
      }
    });
    return {success: true, details:"success"};
  } catch (err) {
    return {success: false, details:err.message};
  }
}

const getAllUserFoodSamples = async (user_id, operator, status) => {
  return await db
    .select("food_samples.*", db.raw('ARRAY_AGG(food_sample_images.image_url) as image_urls'))
    .from("food_samples")
    .leftJoin("food_sample_images", "food_samples.food_sample_id", "food_sample_images.food_sample_id")
    .groupBy("food_samples.food_sample_id")
    .having("food_sample_creater_user_id", "=", user_id)
    .having("food_samples.status", operator, status)
    .then(value => {
      return {success: true, details:value};
    })
    .catch(reason => {
      return {success: false, details:reason};
    });
}

const updateFoodSample = async (db_user, food_sample_id, food_sample_update_data) => {
  if(!food_sample_update_data.status){
    let user_role_object = user_role_manager.createRoleObject(db_user.role)
    if(user_role_object.includes("HOST") && db_user.is_participating_in_festival){
      food_sample_update_data.status = "ACTIVE";
    } else {
      food_sample_update_data.status = "INACTIVE";
    }
  }
  return await db("food_samples")
    .where({
      food_sample_id: food_sample_id,
      food_sample_creater_user_id: db_user.tasttlig_user_id
    })
    .update(food_sample_update_data)
    .then(() => {
      return {success: true};
    }).catch(reason => {
      return {success: false, details:reason};
    });
}

const deleteFoodSample = async (user_id, food_sample_id) => {
  return await db("food_samples")
    .where({
      food_sample_id: food_sample_id,
      food_sample_creater_user_id: user_id
    })
    .del()
    .then(() => {
      return {success: true};
    }).catch(reason => {
      return {success: false, details:reason};
    });
}

const getAllFoodSamples = async (operator, status) => {
  return await db
    .select(
      "food_samples.*",
      "tasttlig_users.first_name",
      "tasttlig_users.last_name",
      db.raw('ARRAY_AGG(food_sample_images.image_url) as image_urls'))
    .from("food_samples")
    .leftJoin("food_sample_images", "food_samples.food_sample_id", "food_sample_images.food_sample_id")
    .leftJoin("tasttlig_users", "food_samples.food_sample_creater_user_id" ,"tasttlig_users.tasttlig_user_id")
    .groupBy("food_samples.food_sample_id")
    .groupBy("tasttlig_users.first_name")
    .groupBy("tasttlig_users.last_name")
    .having("food_samples.status", operator, status)
    .then(value => {
      return {success: true, details:value};
    })
    .catch(reason => {
      return {success: false, details:reason};
    });
}

module.exports = {
  createNewFoodSample,
  getAllUserFoodSamples,
  updateFoodSample,
  deleteFoodSample,
  getAllFoodSamples
}