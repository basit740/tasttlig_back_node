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

const insertBusinessForUser = async (business_info) => {
  try {
    return await db('business_details')
      .insert(business_info)
      .returning("*")
      .then(value => {
        return { success: true, details: value[0] };
      })
      .catch(reason => {
        return { success: false, details: reason };
      });
  } catch (err) {
    return {success: false, message: err}
  }
}

const insertDocument = async (user, document) => {
  try {
    return await db('documents')
      .insert({user_id: user.user.tasttlig_user_id, ...document})
      .returning("*")
      .then(value => {
        return {success: true, details: value[0]}
      })
      .catch(reason => {
        return {success: false, details: reason}
      })
  } catch (err) {
    return {success: false, details: err}
  }
}

const insertBankingInfo = async (banking, tableName) => {
  try {
    return await db(tableName)
      .insert(banking)
      .returning("*")
      .then(value => {
        return {success: true, details: value[0]}
      })
      .catch(reason => {
        return {success: false, details: reason}
      })
  } catch (err) {
    return {success: false, details: err}
  }
}

const insertExternalReviewLink = async (review) => {
  try {
    return await db('external_review')
      .insert(review)
      .returning('*')
      .then(value => {
        return {success: true, details: value[0]}
      })
      .catch(reason => {
        return {success: false, details: reason}
      })
  } catch (err) {
    return {success: false, details: err}
  }
}

const insertHostingInformation = async (application_info) => {
  try {
    return await db('hosting_application')
      .insert(application_info)
      .returning('*')
      .then(value => {
        return {success: true, details: value[0]}
      })
      .catch(reason => {
        return {success: false, details: reason}
      })
  } catch (err) {
    return {success: false, details: err}
  }
}

const sendAdminEmailForHosting = async (user_info) => {
  const document_approve_token = jwt.sign(
    {
      user_id: user_info.user_id,
      status: "APPROVED"
    },
    EMAIL_SECRET
  );
  const document_reject_token = jwt.sign(
    {
      user_id: user_info.user_id,
      status: "REJECT"
    },
    EMAIL_SECRET
  );

  const application_approve_url = `${SITE_BASE}/user/application/${document_approve_token}`;
  const application_reject_url = `${SITE_BASE}/user/application/${document_reject_token}`;

  await Mailer.sendMail({
    from: process.env.SES_DEFAULT_FROM,
    to: ADMIN_EMAIL,
    subject: "[Tasttlig] Document Verification",
    template: "document_admin_approval_decline",
    context: {
      first_name: user_info.first_name,
      last_name: user_info.last_name,
      email: user_info.email,
      upgrade_type: "HOST",
      documents: user_info.documents,

      approve_link: application_approve_url,
      reject_link: application_reject_url,
    }
  })
}

const sendApplierEmailForHosting = async(db_user) => {
  // Email to user on submitting the request to upgrade
  await Mailer.sendMail({
    from: process.env.SES_DEFAULT_FROM,
    to: db_user.user.email,
    subject: `[Tasttlig] Thank you for your application`,
    template: "user_upgrade_request",
    context: {
      first_name: db_user.first_name,
      last_name: db_user.last_name
    }
  });
}

// handleAction is the function that when tasttlig admin click the approve link
const handleAction = async token => {
  try {
    const decrypted_token = jwt.verify(token, EMAIL_SECRET);
    const user_id = decrypted_token.user_id;
    const status = decrypted_token.status;

    // we have user_id and status,
    // first we find the user
    const db_user_row = await getUserById(user_id);
    if (!db_user_row.success) {
      return { success: false, message: db_user_row.message };
    }
    const db_user = db_user_row.user;

    // depends on status, we do different things:
    // if status is approved
    if (status === 'APPROVED') {
      // STEP 1: change the role column in tasttlig_user table
      let user_role_object = role_manager.createRoleObject(db_user.role);
      user_role_object = role_manager.removeRole(
        user_role_object,
        "HOST_PENDING"
      );
      user_role_object = role_manager.addRole(user_role_object, "HOST");
      await db("tasttlig_users")
        .where("tasttlig_user_id", db_user.tasttlig_user_id)
        .update("role", role_manager.createRoleString(user_role_object));

      // STEP 2: Update all Experiences to Active state
      await db("experiences")
        .where({
          experience_creator_user_id: db_user.tasttlig_user_id,
          status: "INACTIVE"
        })
        .update("status", "ACTIVE");

      // STEP 3: Update all Food Samples to Active state if the user agreed to participate in festival
      if (db_user.is_participating_in_festival) {
        await db("food_samples")
          .where({
            food_sample_creater_user_id: db_user.tasttlig_user_id,
            status: "INACTIVE"
          })
          .update("status", "ACTIVE");
      }

      // STEP 4: Update all documents belongs to this user which is in Pending state become APPROVE
      await db("documents")
        .where("user_id", db_user.tasttlig_user_id)
        .andWhere("status", 'Pending')
        .update("status", 'APPROVED')
        .returning("*")
        .catch(reason => {
          return { success: false, message: reason };
        });

      // STEP 5: Update Application table status
      await db("hosting_application")
        .where("user_id", db_user.tasttlig_user_id)
        .andWhere("status", 'Pending')
        .update("status", 'APPROVED')
        .returning("*")
        .catch(reason => {
          return { success: false, message: reason };
        });

      // STEP 6: email the user that their application is approved
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
      // status is Failed
      // STEP 1: remove the HOST_PENDING role
      let user_role_object = role_manager.createRoleObject(db_user.role);
      user_role_object = role_manager.removeRole(
        user_role_object,
        "HOST_PENDING"
      );

      await db("tasttlig_users")
        .where("tasttlig_user_id", db_user.tasttlig_user_id)
        .update("role", role_manager.createRoleString(user_role_object));

      // STEP 2: Update all documents belongs to this user which is in Pending state become REJECT
      await db("documents")
        .where("user_id", db_user.tasttlig_user_id)
        .andWhere("status", 'Pending')
        .update("status", 'REJECT')
        .returning("*")
        .catch(reason => {
          return { success: false, message: reason };
        });

      // STEP 3: Update Application table status
      await db("hosting_application")
        .where("user_id", db_user.tasttlig_user_id)
        .andWhere("status", 'Pending')
        .update("status", 'REJECT')
        .returning("*")
        .catch(reason => {
          return { success: false, message: reason };
        });

      // STEP 4: notify user their application is reject
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
      return { success: true, message: status };
    }
  } catch (e) {
    return { success: false, message: e };
  }
}

const getUserByEmailWithSubscription = async email => {
  return await db("tasttlig_users")
    .where("email", email)
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
  getUserByEmail,
  updateUserAccount,
  updateUserProfile,
  insertBusinessForUser,
  insertDocument,
  insertBankingInfo,
  insertExternalReviewLink,
  insertHostingInformation,
  getUserByEmailWithSubscription,
  getUserByPassportId,
  sendAdminEmailForHosting,
  sendApplierEmailForHosting,
  handleAction,
};
