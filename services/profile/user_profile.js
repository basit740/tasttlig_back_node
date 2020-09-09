"use strict";

const {db} = require("../../db/db-config");
const jwt = require("jsonwebtoken");
const Mailer = require("../email/nodemailer").nodemailer_transporter;
const role_manager = require("./user_roles_manager");

const SITE_BASE = process.env.SITE_BASE;
const ADMIN_EMAIL = process.env.TASTTLIG_ADMIN_EMAIL;
const EMAIL_SECRET = process.env.EMAIL_SECRET;

const getUserById = async id => {
  return await db("tasttlig_users")
    .where("tasttlig_user_id", id)
    .first()
    .then(value => {
      if (!value) {
        return { success: false, message: "No user found." };
      }
      return { success: true, user: value };
    })
    .catch(error => {
      return { success: false, message: error };
    });
};

const getUserBySubscriptionId = async id => {
  return await db("tasttlig_users")
    .where("tasttlig_user_id", id)
    .first()
    .leftJoin(
      "user_subscriptions",
      "tasttlig_users.tasttlig_user_id",
      "user_subscriptions.user_id"
    )
    .then(value => {
      if (!value) {
        return { success: false, message: "No user found." };
      }
      return { success: true, user: value };
    })
    .catch(error => {
      return { success: false, message: error };
    });
};

const upgradeUser = async (db_user, upgrade_details) => {
  try {
    const document_response = await db("documents")
      .insert({
        user_id: db_user.tasttlig_user_id,
        document_type: upgrade_details.document_type,
        document_link: upgrade_details.document_link,
        issue_date: new Date(upgrade_details.issue_date),
        expiry_date: new Date(upgrade_details.expiry_date),
        status: "PENDING"
      })
      .returning("*")
      .then(value => {
        return { success: true, details: value[0] };
      })
      .catch(reason => {
        return { success: false, details: reason };
      });
    if (!document_response.success) {
      return document_response;
    }
    let user_role_object = role_manager.createRoleObject(db_user.role);
    user_role_object = role_manager.addRole(user_role_object, "HOST_PENDING");
    await db("tasttlig_users")
      .where("tasttlig_user_id", db_user.tasttlig_user_id)
      .update({
        role: role_manager.createRoleString(user_role_object),
        is_participating_in_festival:
          upgrade_details.is_participating_in_festival
      });

    const document_details = document_response.details;
    const document_approve_token = jwt.sign(
      {
        document_id: document_details.document_id,
        status: "APPROVED"
      },
      EMAIL_SECRET
    );
    const document_reject_token = jwt.sign(
      {
        document_id: document_details.document_id,
        status: "REJECT"
      },
      EMAIL_SECRET
    );

    const document_approve_url = `${SITE_BASE}/user/upgrade/action/${document_approve_token}`;
    const document_reject_url = `${SITE_BASE}/user/upgrade/action/${document_reject_token}`;

    // Email to user on submitting the request to upgrade
    await Mailer.sendMail({
      from: process.env.SES_DEFAULT_FROM,
      to: db_user.email,
      subject: `[Tasttlig] Thank you for your application`,
      template: "user_upgrade_request",
      context: {
        first_name: db_user.first_name,
        last_name: db_user.last_name
      }
    });

    //Send Email to admin for document approval
    await Mailer.sendMail({
      from: process.env.SES_DEFAULT_FROM,
      to: ADMIN_EMAIL,
      subject: "[Tasttlig] Document Verification",
      template: "document_admin_approval_decline",
      context: {
        first_name: db_user.first_name,
        last_name: db_user.last_name,
        email: db_user.email,
        upgrade_type: "HOST",
        document_type: upgrade_details.document_type,
        document_link: document_details.document_link,
        date_of_issue: document_details.issue_date,
        date_of_expiry: document_details.expiry_date,
        approve_link: document_approve_url,
        reject_link: document_reject_url
      }
    });
    return { success: true, message: "success" };
  } catch (err) {
    return { success: false, message: err };
  }
};

const upgradeUserResponse = async token => {
  try {
    const decrypted_token = jwt.verify(token, EMAIL_SECRET);
    const document_id = decrypted_token.document_id;
    const status = decrypted_token.status;

    const db_document = await db("documents")
      .where("document_id", document_id)
      .update("status", status)
      .returning("*")
      .catch(reason => {
        return { success: false, message: reason };
      });

    const document_user_id = db_document[0].user_id;
    const db_user_row = await getUserById(document_user_id);
    if (!db_user_row.success) {
      return { success: false, message: db_user_row.message };
    }
    const db_user = db_user_row.user;
    if (status === "APPROVED") {
      let user_role_object = role_manager.createRoleObject(db_user.role);
      user_role_object = role_manager.removeRole(
        user_role_object,
        "HOST_PENDING"
      );
      user_role_object = role_manager.addRole(user_role_object, "HOST");
      await db("tasttlig_users")
        .where("tasttlig_user_id", db_user.tasttlig_user_id)
        .update("role", role_manager.createRoleString(user_role_object));

      //Update all Experiences to Active state
      await db("experiences")
        .where({
          experience_creator_user_id: db_user.tasttlig_user_id,
          status: "INACTIVE"
        })
        .update("status", "ACTIVE");

      //Update all Food Samples to Active state if the user agreed to participate in festival
      if (db_user.is_participating_in_festival) {
        await db("food_samples")
          .where({
            food_sample_creater_user_id: db_user.tasttlig_user_id,
            status: "INACTIVE"
          })
          .update("status", "ACTIVE");
      }

      // Async experience accepted email
      await Mailer.sendMail({
        from: process.env.SES_DEFAULT_FROM,
        to: db_user.email,
        subject: `[Tasttlig] Your request for upgradation to Host is accepted`,
        template: "user_upgrade_approve",
        context: {
          first_name: db_user.first_name,
          last_name: db_user.last_name
        }
      });
    } else {
      let user_role_object = role_manager.createRoleObject(db_user.role);
      user_role_object = role_manager.removeRole(
        user_role_object,
        "HOST_PENDING"
      );

      await db("tasttlig_users")
        .where("tasttlig_user_id", db_user.tasttlig_user_id)
        .update("role", role_manager.createRoleString(user_role_object));

      await Mailer.sendMail({
        from: process.env.SES_DEFAULT_FROM,
        to: db_user.email,
        subject: `[Tasttlig] Your request for upgradation to Host is rejected`,
        template: "user_upgrade_reject",
        context: {
          first_name: db_user.first_name,
          last_name: db_user.last_name
        }
      });
    }
    return { success: true, message: status };
  } catch (err) {
    return { success: false, message: err };
  }
};

const getUserByEmail = async email => {
  return await db("tasttlig_users")
    .where("email", email)
    .first()
    .then(value => {
      if (!value) {
        return { success: false, message: "No user found." };
      }
      return { success: true, user: value };
    })
    .catch(error => {
      return { success: false, message: error };
    });
};

const updateUserAccount = async user => {
  try {
    return await db("tasttlig_users")
      .where("tasttlig_user_id", user.id)
      .first()
      .update({
        first_name: user.first_name,
        last_name: user.last_name,
        password: user.password,
        phone_number: user.phone_number,
        profile_image_link: user.profile_image_link,
        profile_tag_line: user.profile_tag_line,
        bio_text: user.bio_text,
        banner_image_link: user.banner_image_link
      })
      .returning("*")
      .then(value => {
        return { success: true, details: value[0] };
      })
      .catch(reason => {
        return { success: false, details: reason };
      });
  } catch (err) {
    return { success: false, message: err };
  }
};

const updateUserProfile = async user => {
  try {
    return await db("tasttlig_users")
      .where("tasttlig_user_id", user.id)
      .first()
      .update({
        user_address_line_1: user.address_line_1,
        user_address_line_2: user.address_line_2,
        user_city: user.city,
        user_postal_code: user.postal_code,
        user_state: user.state,
        address_type: user.address_type,
        business_name: user.business_name,
        business_type: user.business_type,
        profile_status: user.profile_status
      })
      .returning("*")
      .then(value => {
        return { success: true, details: value[0] };
      })
      .catch(reason => {
        return { success: false, details: reason };
      });
  } catch (err) {
    return { success: false, message: err };
  }
};

const getUserByEmailWithSubscription = async passportIdOrEmail => {
  return await db("tasttlig_users")
    .where("email", passportIdOrEmail)
    .orWhere({passport_id: passportIdOrEmail})
    .first()
    .leftJoin(
      "user_subscriptions",
      "tasttlig_users.tasttlig_user_id",
      "user_subscriptions.user_id"
    )
    .where("user_subscriptions.subscription_end_datetime", ">", new Date())
    .then(value => {
      if (!value) {
        return { success: false, message: "No user found." };
      }
      return { success: true, user: value };
    })
    .catch(error => {
      return { success: false, message: error };
    });
};

const getUserByPassportId = async passport_id => {
  return await db("tasttlig_users")
    .where("passport_id", passport_id)
    .first()
    .then(value => {
      if (!value) {
        return { success: false, message: "No user found." };
      }
      return { success: true, user: value };
    })
    .catch(error => {
      return { success: false, message: error };
    });
}

module.exports = {
  getUserById,
  getUserBySubscriptionId,
  upgradeUser,
  upgradeUserResponse,
  getUserByEmail,
  updateUserAccount,
  updateUserProfile,
  getUserByEmailWithSubscription,
  getUserByPassportId
};
