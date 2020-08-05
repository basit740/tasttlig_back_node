"use strict";

const db = require("../../db/db-config");
const Mailer = require("../email/nodemailer").nodemailer_transporter;
const user_role_manager = require("../profile/user_roles_manager");

const ADMIN_EMAIL = process.env.TASTTLIG_ADMIN_EMAIL;

const createNewFoodSample = async (db_user, food_sample_details) => {
  try{
    food_sample_details.status = "INACTIVE";
    let user_role_object = user_role_manager.createRoleObject(db_user.role)
    if(user_role_object.includes("HOST")){
      food_sample_details.status = "ACTIVE";
    }
    const db_food_sample = await db("food_samples")
      .insert({
        food_sample_owner_user_id: db_user.tasttlig_user_id,
        title: food_sample_details.title,
        start_date: food_sample_details.start_date,
        end_date: food_sample_details.end_date,
        start_time: food_sample_details.start_time,
        end_time: food_sample_details.end_time,
        description: food_sample_details.description,
        address: food_sample_details.address,
        city: food_sample_details.city,
        state: food_sample_details.state,
        country: food_sample_details.country,
        postal_code: food_sample_details.postal_code
      })
      .returning("*");
    if(!db_food_sample){
      return {success: false, details:"Inserting new Food Sample failed"};
    }
    await db("food_sample_images")
      .insert({
        food_sample_id: db_food_sample[0].food_sample_id,
        image_url: food_sample_details.image_url[0]
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

module.exports = {
  createNewFoodSample
}