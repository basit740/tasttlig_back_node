"use strict";

const {db} = require("../../db/db-config");
const Mailer = require("../email/nodemailer").nodemailer_transporter;
const user_role_manager = require("../profile/user_roles_manager");
const jwt = require("jsonwebtoken");

const ADMIN_EMAIL = process.env.TASTTLIG_ADMIN_EMAIL;
const SITE_BASE = process.env.SITE_BASE;

const createNewExperience = async (
  db_user,
  experience_details,
  experience_images,
  createdByAdmin) => {
  try{
    await db.transaction(async trx => {
      experience_details.status = "INACTIVE";
      let user_role_object = user_role_manager.createRoleObject(db_user.role);
      if(user_role_object.includes("HOST")){
        experience_details.status = "ACTIVE";
      }
      const db_experience = await trx("experiences")
        .insert(experience_details)
        .returning("*");
      if(!db_experience){
        return {success: false, details:"Inserting new experience failed"};
      }
      const images = experience_images.map(experience_image => ({
        experience_id: db_experience[0].experience_id,
        image_url: experience_image
      }));
      await trx("experience_images")
        .insert(images);
      if (createdByAdmin){
        // Email to confirm the new experience by hosts
        jwt.sign(
          {
            "id": db_experience[0].experience_id,
            "user_id": db_experience[0].experience_creator_user_id
          },
          process.env.EMAIL_SECRET,
          {
            expiresIn: "3d"
          },
          async (err, emailToken) => {
            try {
              const url = `${SITE_BASE}/review-experience/${db_experience[0].experience_id}/${emailToken}`;
              await Mailer.sendMail({
                from: process.env.SES_DEFAULT_FROM,
                to: db_user.email,
                subject: `[Tasttlig] Review Experience "${experience_details.title}"`,
                template: "review_experience",
                context: {
                  title: experience_details.title,
                  url_review_experience: url
                }
              });
            } catch (err) {
              return {
                success: false,
                details:err.message
              }
            }
          }
        );
      } else {
        // Email to user on submitting the request to upgrade
        await Mailer.sendMail({
          from: process.env.SES_DEFAULT_FROM,
          to: db_user.email,
          bcc: ADMIN_EMAIL,
          subject: `[Tasttlig] New Experience Created`,
          template: 'new_experience',
          context: {
            first_name: db_user.first_name,
            last_name: db_user.last_name,
            title: experience_details.title,
            status: experience_details.status
          }
        });
      }
    });
    return {success: true, details:"success"};
  } catch (err) {
    return {success: false, details:err.message};
  }
}

const getAllExperience = async (operator, status) => {
  return await db
    .select(
      "experiences.*",
      "tasttlig_users.phone_number",
      "tasttlig_users.email",
      db.raw("ARRAY_AGG(experience_images.image_url) as image_urls")
    )
    .from("experiences")
    .leftJoin(
      "experience_images",
      "experiences.experience_id",
      "experience_images.experience_id"
    ).leftJoin(
      "tasttlig_users",
      "experiences.experience_creator_user_id",
      "tasttlig_users.tasttlig_user_id"
    )
    .groupBy("experiences.experience_id")
    .groupBy("tasttlig_users.phone_number")
    .groupBy("tasttlig_users.email")
    .having("experiences.status", operator, status)
    .then(value => {
      return { success: true, details: value };
    })
    .catch(reason => {
      return { success: false, details: reason };
    });
};

const getAllUserExperience = async (user_id, operator, status, requestByAdmin) => {
  let query = db
    .select("experiences.*", db.raw('ARRAY_AGG(experience_images.image_url) as image_urls'))
    .from("experiences")
    .leftJoin("experience_images", "experiences.experience_id", "experience_images.experience_id")
    .groupBy("experiences.experience_id");
  
  if(!requestByAdmin){
    query =  query
      .having("experience_creator_user_id", "=", user_id)
      .having("experiences.status", operator, status)
  } else {
    query =  query
      .having("experiences.status", operator, status)
  }
  return await query
    .then(value => {
      return {success: true, details:value};
    })
    .catch(reason => {
      return {success: false, details:reason};
    });
}

const updateReviewExperience = async (
  experience_id,
  experience_creator_user_id,
  experience_update_data
) => {
  return await db("experiences")
    .where({
      experience_id: experience_id,
      experience_creator_user_id: experience_creator_user_id
    })
    .update(experience_update_data)
    .returning("*")
    .then(value => {
      if (experience_update_data.status === "ACTIVE") {
        Mailer.sendMail({
          from: process.env.SES_DEFAULT_FROM,
          to: ADMIN_EMAIL,
          subject: `[Tasttlig] Experience "${value[0].title}" has been accepted`,
          template: "accept_experience",
          context: {
            title: value[0].title,
            review_experience_reason: experience_update_data.review_experience_reason
          }
        });
      } else {
        Mailer.sendMail({
          from: process.env.SES_DEFAULT_FROM,
          to: ADMIN_EMAIL,
          subject: `[Tasttlig] Experience "${value[0].title}" has been rejected`,
          template: "reject_experience",
          context: {
            title: value[0].title,
            review_experience_reason: experience_update_data.review_experience_reason
          }
        });
      }
    })
    .then(() => {
      return { success: true };
    })
    .catch(reason => {
      return { success: false, details: reason };
    });
};

const updateExperience = async (
  db_user,
  experience_id,
  experience_update_data,
  updatedByAdmin) => {
  if(!experience_update_data.status){
    let user_role_object = user_role_manager.createRoleObject(db_user.role);
    if(user_role_object.includes("HOST") && !updatedByAdmin){
      experience_update_data.status = "ACTIVE";
    } else {
      experience_update_data.status = "INACTIVE";
    }
  }
  return await db("experiences")
    .where(builder => {
      if(updatedByAdmin){
        return builder.where({
          experience_id: experience_id
        })
      } else {
        return builder.where({
          experience_id: experience_id,
          experience_creator_user_id: db_user.tasttlig_user_id
        })
      }
    })
    .update(experience_update_data)
    .then(() => {
      return {success: true};
    }).catch(reason => {
      return {success: false, details:reason};
    });
}

const deleteExperience = async (user_id, experience_id) => {
  return await db("experiences")
    .where({
      experience_id: experience_id,
      experience_creator_user_id: user_id
    })
    .del()
    .then(() => {
      return {success: true};
    }).catch(reason => {
      return {success: false, details:reason};
    });
}

const getExperience = async(experience_id) => {
  return await db
    .select("experiences.*", db.raw('ARRAY_AGG(experience_images.image_url) as image_urls'))
    .from("experiences")
    .leftJoin("experience_images", "experiences.experience_id", "experience_images.experience_id")
    .groupBy("experiences.experience_id")
    .having("experiences.experience_id", "=", experience_id)
    .then(value => {
      return {success: true, details:value};
    })
    .catch(reason => {
      return {success: false, details:reason};
    });
}

module.exports = {
  createNewExperience,
  getAllExperience,
  getAllUserExperience,
  deleteExperience,
  updateReviewExperience,
  updateExperience,
  getExperience
}