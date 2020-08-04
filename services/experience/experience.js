"use strict";

const db = require("../../db/db-config");
const Mailer = require("../email/nodemailer").nodemailer_transporter;

const ADMIN_EMAIL = process.env.TASTTLIG_ADMIN_EMAIL;

const createNewExperience = async (db_user, experience_details) => {
  try{
    let status = "INACTIVE";
    if(db_user.role == "HOST"){
      status = "ACTIVE";
    }
    const db_experience = await db("experiences")
      .insert({
        experience_creator_user_id: db_user.tasttlig_user_id,
        title: experience_details.title,
        price: experience_details.price,
        category: experience_details.category,
        style: experience_details.style,
        start_date: experience_details.start_date,
        end_date: experience_details.end_date,
        start_time: experience_details.start_time,
        end_time: experience_details.end_time,
        capacity: experience_details.capacity,
        dress_code: experience_details.dress_code,
        description: experience_details.description,
        status: status,
        address: experience_details.address,
        city: experience_details.city,
        state: experience_details.state,
        country: experience_details.country,
        postal_code: experience_details.postal_code
      })
      .returning("*");
    if(!db_experience){
      return {success: false, details:"Inserting new experience failed"};
    }
    await db("experience_images")
      .insert({
        experience_id: db_experience[0].experience_id,
        image_url: experience_details.image_url
      });

    // Email to user on submitting the request to upgrade
    await Mailer.sendMail({
      to: db_user.email,
      bcc: ADMIN_EMAIL,
      subject: `[Tasttlig] New Experience Created`,
      template: 'new_experience',
      context: {
        first_name: db_user.first_name,
        last_name: db_user.last_name,
        title: experience_details.title,
        status: status
      }
    });
    return {success: true, details:"success"};
  } catch (err) {
    return {success: false, details:err.message};
  }
}

const getAllUserExperience = async (db_user) => {
  return await db
    .select("experiences.*", db.raw('ARRAY_AGG(experience_images.image_url) as image_urls'))
    .from("experiences")
    .leftJoin("experience_images", "experiences.experience_id", "experience_images.experience_id")
    .groupBy("experiences.experience_id")
    .having("experience_creator_user_id", "=", db_user.tasttlig_user_id)
    .having("experiences.status", "!=", "DELETED")
    .then(value => {
      return {success: true, details:value};
    })
    .catch(reason => {
      return {success: false, details:reason};
    });
}

const deleteExperience = async (id, experience_id) => {
  return await db("experiences")
    .where({
      experience_id: experience_id,
      experience_creator_user_id: id
    })
    .update({status: "DELETED"})
    .then(() => {
      return {success: true};
    }).catch(reason => {
      return {success: false, details:reason};
    });

}

module.exports = {
  createNewExperience,
  getAllUserExperience,
  deleteExperience
}