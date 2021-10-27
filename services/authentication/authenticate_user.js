"use strict";

// Libraries
const {db} = require("../../db/db-config");
const jwt = require("jsonwebtoken");
const {raw} = require("objection");
const Mailer = require("../email/nodemailer").nodemailer_transporter;
const {generateRandomString} = require("../../functions/functions");
const auth_server_service = require("../../services/authentication/auth_server_service");
const User = require("../../models/User");
const Access = require("../../models/AppAccess");
const bcrypt = require("bcrypt");

// Environment variables
const SITE_BASE = process.env.SITE_BASE;
const ADMIN_EMAIL = process.env.TASTTLIG_ADMIN_EMAIL;

// Save user register information to Tasttlig users table helper function
// Save user register information to Tasttlig users table helper function
const userRegister = async (new_user, sendEmail = true) => {
  try {
    return db.transaction(async (trx) => {
      let new_db_user = [];

      const userData = {
        password_digest: new_user.password,
        first_name: new_user.first_name,
        last_name: new_user.last_name,
        email: new_user.email,
        phone_number: new_user.phone_number,
        source: new_user.source,
        status: "ACTIVE",
        // passport_id: user.passport_id,
        // passport_type: new_user.passport_type,
        created_at_datetime: new Date(),
        updated_at_datetime: new Date(),
      };

      const targetAccess = (await Access.query().select("id")).map((e) => e.id);
      //await targetUser.$relatedQuery("access").relate(targetAccess);

      if (new_user.is_participating_in_festival) {
        userData.is_participating_in_festival =
          new_user.is_participating_in_festival;
      }

      new_db_user = trx("tasttlig_users").insert(userData).returning("*");

      return await new_db_user.then(async (value1) => {
        // Get role code of new role to be added
        db("roles")
          .select()
          .where({
            role: "GUEST",
          })
          .then(async (value) => {
            // Insert new role in auth server
            const {success, user} = await auth_server_service.authAddRole(
              value1[0].auth_user_id,
              value[0].role_code
            );

            // Insert new role for this user
            await db("user_role_lookup").insert({
              user_id: value1[0].tasttlig_user_id,
              role_code: value[0].role_code,
            });
          });

        // Insert new Access for this user
        const targetUser = await User.query().findById(
          value1[0].tasttlig_user_id
        );

        //basic guest subscription
        const subDetails = await db("subscriptions")
          .where({
            subscription_code: "G_BASIC",
            //status: "ACTIVE",
          })
          .first()
          .then((value) => {
            if (!value) {
              return {success: false, message: "No plan found."};
            }

            return {success: true, item: value};
          })
          .catch((error) => {
            return {success: false, message: error};
          });
        if (subDetails.success) {
          let subscription_end_datetime = null;

          if (subDetails.item.validity_in_months) {
            subscription_end_datetime = new Date(
              new Date().setMonth(
                new Date().getMonth() +
                Number(subDetails.item.validity_in_months)
              )
            );
          } else {
            subscription_end_datetime = subDetails.item.date_of_expiry;
          }

          await trx("user_subscriptions").insert({
            subscription_code: subDetails.item.subscription_code,
            user_id: value1[0].tasttlig_user_id,
            subscription_start_datetime: new Date(),
            subscription_end_datetime: subscription_end_datetime,
            cash_payment_received: subDetails.item.price,
            user_subscription_status: "ACTIVE",
          });
        }

        // Send sign up email confirmation to the user
        if (sendEmail) {
          jwt.sign(
            {
              user: value1[0].tasttlig_user_id,
            },
            process.env.EMAIL_SECRET,
            {
              expiresIn: "28d",
            },
            async (err, emailToken) => {
              const urlVerifyEmail = `${SITE_BASE}/user/verify/${emailToken}`;
              console.log("urlVerifyEmail", urlVerifyEmail);

              await Mailer.sendMail({
                from: process.env.SES_DEFAULT_FROM,
                to: new_user.email,
                bcc: ADMIN_EMAIL,
                subject: "[Tasttlig] Welcome to Tasttlig!",
                template: "signup",
                context: {
                  passport_id: new_db_user._single.insert.passport_id,
                  urlVerifyEmail,
                },
              });
            }
          );
        }

        return {success: true, data: value1[0]};
      });
    });
  } catch (error) {
    return {success: false, data: error.message};
  }
};

var d = new Date();
var year = d.getFullYear();
var month = d.getMonth();
var day = d.getDate();
// Verify user account helper function
const verifyAccount = async (user_id) => {
  return await db("tasttlig_users")
    .where("tasttlig_user_id", user_id)
    .update({
      is_email_verified: true,
      email_verified_date_time: new Date(),
      passport_expiry_date: new Date(year + 5, month, day),
    })
    .returning("*")
    .then((value) => {
      return {
        success: true,
        message: "Email is verified.",
        user_id: value[0].tasttlig_user_id,
      };
    })
    .catch((reason) => {
      return {success: false, data: reason};
    });
};

// Login user helper function
const getUserLogin = async (body) => {
  if (body.email) {
    return await db
      .select("tasttlig_users.*", db.raw("ARRAY_AGG(roles.role) as role"))
      .from("tasttlig_users")
      .leftJoin(
        "user_role_lookup",
        "tasttlig_users.tasttlig_user_id",
        "user_role_lookup.user_id"
      )
      .leftJoin("roles", "user_role_lookup.role_code", "roles.role_code")
      .groupBy("tasttlig_users.tasttlig_user_id")
      .having("tasttlig_users.email", "=", body.email)
      .first()
      .then((value) => {
        if (!value) {
          return {success: false, message: "User not found."};
        }

        return {success: true, user: value};
      })
      .catch((reason) => {
        return {success: false, data: reason};
      });
  } else if (body.passport_id) {
    return await db
      .select("tasttlig_users.*", db.raw("ARRAY_AGG(roles.role) as role"))
      .from("tasttlig_users")
      .leftJoin(
        "user_role_lookup",
        "tasttlig_users.tasttlig_user_id",
        "user_role_lookup.user_id"
      )
      .leftJoin("roles", "user_role_lookup.role_code", "roles.role_code")
      .groupBy("tasttlig_users.tasttlig_user_id")
      .having("tasttlig_users.passport_id", "=", body.passport_id)
      .first()
      .then((value) => {
        if (!value) {
          return {success: false, message: "User not found."};
        }

        return {success: true, user: value};
      })
      .catch((reason) => {
        return {success: false, data: reason};
      });
  }
};

// Logout user helper function
const getUserLogOut = async (user_id) => {
  return await db("refresh_tokens")
    .del()
    .where("user_id", user_id)
    .then((value) => {
      if (value === user_id) {
        return {
          success: true,
          message: "User logged out, refresh token deleted.",
        };
      }

      return {success: false, data: "Refresh token not found."};
    })
    .catch((reason) => {
      return {success: false, data: reason};
    });
};

// Password reset request from user helper function
const checkEmail = async (email) => {
  return await db("tasttlig_users")
    .where({
      email,
      status: "ACTIVE",
    })
    .first()
    .then(async (value) => {
      if (!value) {
        return {
          success: false,
          message: "Error.",
          response: `There is no account for ${email}.`,
        };
      }

      const email_token = jwt.sign(
        {user: value.tasttlig_user_id},
        process.env.EMAIL_SECRET,
        {
          expiresIn: "28d",
        }
      );

      try {
        const url = `${SITE_BASE}/forgot-password/${email_token}/${email}`;

        await Mailer.sendMail({
          from: process.env.SES_DEFAULT_FROM,
          to: email,
          subject: "[Tasttlig] Reset your password",
          template: "password_reset_request",
          context: {
            url,
          },
        });

        return {
          success: true,
          message: "Success.",
          response: `Your update password email has been sent to ${email}.`,
        };
      } catch (error) {
        return {
          success: false,
          message: "Error.",
          response: "Error in sending email.",
        };
      }
    })
    .catch((reason) => {
      return {
        success: false,
        message: "Error.",
        response: reason,
      };
    });
};

const updatePassword = async (email, password) => {
  const salt = bcrypt.genSaltSync(10);
  const password_digest = bcrypt.hashSync(password, salt);

  return User.query()
    .where("email", email)
    .patch({password_digest});
}

// Update password from user helper function
const updatePasswordFromToken = async (email, password, token) => {
  const encrypted = jwt.verify(token, process.env.EMAIL_SECRET);
  const user_id = encrypted.user;
  const success = await User.query()
    .findById(user_id)
    .patch({password_digest: password});

  if (success) {
    await auth_server_service.authRemove(email);
    await Mailer.sendMail({
      from: process.env.SES_DEFAULT_FROM,
      to: email,
      subject: "[Tasttlig] Password changed",
      template: "password_reset_success",
    })
      .then(() => {
        return {success: true, message: "Success."};
      })
      .catch((reason) => {
        return {success: false, message: reason};
      });
  } else {
    return {success: false, message: "JWT error."};
  }
};

// Save visitor account information to Tasttlig users table helper function
const createDummyUser = async (email) => {
  try {
    return await db("tasttlig_users")
      .insert({
        password: generateRandomString(8),
        first_name: "NA",
        last_name: "NA",
        email,
        phone_number: "NA",
        status: "DUMMY",
        passport_id: user.passport_id,
        auth_user_id: user.id,
        created_at_datetime: new Date(),
        updated_at_datetime: new Date(),
      })
      .returning("*")
      .then(async (value) => {
        // Get role code of new role to be added
        let role_code = await db("roles")
          .select()
          .where({
            role: "VISITOR",
          })
          .then((value) => {
            return value[0].role_code;
          });

        // Insert new role in auth server
        auth_server_service.authAddRole(user.id, role_code).then(() => {
          // Insert new role for this user
          db("user_role_lookup").insert({
            user_id: value[0].tasttlig_user_id,
            role_code,
          });
        });

        return {success: true, user: value[0]};
      })
      .catch((reason) => {
        return {success: false, data: reason};
      });
  } catch (error) {
    return {success: false, data: error.message};
  }
};

/* Email to new user from multi-step form with login details and password reset
link helper function */
const sendNewUserEmail = async (new_user) => {
  const email = new_user.email;
  const {email_token} = await auth_server_service.authPasswordResetRequest(
    email
  );

  try {
    const url = `${SITE_BASE}/forgot-password/${email_token}/${email}`;

    await Mailer.sendMail({
      from: process.env.SES_DEFAULT_FROM,
      to: email,
      subject: "[Tasttlig] Thank you for your application",
      template: "new_application_user_account",
      context: {
        first_name: new_user.first_name,
        last_name: new_user.last_name,
        email,
        password_digest: new_user.password,
        url,
      },
    });

    return {
      success: true,
      message: "Success.",
      response: `Your update password email has been sent to ${email}.`,
    };
  } catch (error) {
    return {
      success: false,
      message: "Error.",
      response: "Error in sending email.",
    };
  }
};

/* Save user information from multi-step form to Tasttlig users table helper function */
const createBecomeFoodProviderUser = async (become_food_provider_user) => {
  try {
    return await db("tasttlig_users")
      .insert({
        first_name: become_food_provider_user.first_name,
        last_name: become_food_provider_user.last_name,
        password_digest: become_food_provider_user.password,
        email: become_food_provider_user.email,
        phone_number: become_food_provider_user.phone_number,
        status: "ACTIVE",
        passport_id: user.passport_id,
        auth_user_id: user.id,
        created_by_admin: become_food_provider_user.created_by_admin,
        created_at_datetime: new Date(),
        updated_at_datetime: new Date(),
      })
      .returning("*")
      .then(async (value) => {
        // Get role code of new role to be added
        let role_code = await db("roles")
          .select()
          .where({
            role: "GUEST",
          })
          .then((value) => {
            return value[0].role_code;
          });

        // Insert new role in auth server
        auth_server_service.authAddRole(user.id, role_code).then(() => {
          // Insert new role for this user
          db("user_role_lookup")
            .insert({
              user_id: value[0].tasttlig_user_id,
              role_code,
            })
            .then(async () => {
              await sendNewUserEmail(become_food_provider_user);
            });
        });

        return {success: true, user: value[0]};
      })
      .catch((reason) => {
        return {success: false, data: reason};
      });
  } catch (error) {
    // Duplicate key
    if (error.code === 23505) {
      return createBecomeFoodProviderUser(become_food_provider_user);
    }

    return {success: false, data: error.message};
  }
};

// Find user by email helper function
const findUserByEmail = async (email) => {
  return await db
    .select(
      "tasttlig_users.*",
      "business_details.*",
      db.raw("ARRAY_AGG(roles.role) as role")
    )
    .from("tasttlig_users")
    .leftJoin(
      "user_role_lookup",
      "tasttlig_users.tasttlig_user_id",
      "user_role_lookup.user_id"
    )
    .leftJoin("roles", "user_role_lookup.role_code", "roles.role_code")
    .leftJoin(
      "business_details",
      "tasttlig_users.tasttlig_user_id",
      "business_details.business_details_user_id"
    )
    .groupBy("tasttlig_users.tasttlig_user_id")
    .groupBy("business_details.business_details_id")
    .having("tasttlig_users.email", "=", email)
    .first()
    .then((value) => {
      if (!value) {
        return {
          success: false,
          message: "Error.",
          response: `There is no account for ${email}.`,
        };
      }

      return {success: true, user: value};
    })
    .catch((reason) => {
      return {success: false, data: reason};
    });
};

// Find user by business name helper function
const findUserByBusinessName = async (business_name) => {
  return await db
    .select(
      "tasttlig_users.*",
      "business_details.*",
      db.raw("ARRAY_AGG(roles.role) as role")
    )
    .from("tasttlig_users")
    .leftJoin(
      "user_role_lookup",
      "tasttlig_users.tasttlig_user_id",
      "user_role_lookup.user_id"
    )
    .leftJoin("roles", "user_role_lookup.role_code", "roles.role_code")
    .leftJoin(
      "business_details",
      "tasttlig_users.tasttlig_user_id",
      "business_details.business_details_user_id"
    )
    .groupBy("tasttlig_users.tasttlig_user_id")
    .groupBy("business_details.business_details_id")
    .having("business_details.business_name", "=", business_name)
    .first()
    .then((value) => {
      if (!value) {
        return {
          success: false,
          message: "Error.",
          response: `There is no account for ${business_name}.`,
        };
      }

      return {success: true, user: value};
    })
    .catch((reason) => {
      return {success: false, data: reason};
    });
};

// Get business details from user helper function
const getUserByBusinessDetails = async (user_id) => {
  return await db
    .select("business_details.*")
    .from("business_details")
    .groupBy("business_details.business_details_id")
    .having("business_details.business_details_user_id", "=", user_id)
    .first()
    .then((value) => {
      if (!value) {
        return {
          success: false,
          message: "Error.",
          response: "Business details not found for this user.",
        };
      }

      return {success: true, business_details: value};
    })
    .catch((reason) => {
      return {success: false, data: reason};
    });
};

// Get user login information from auth server helper function
const userMigrationFromAuthServer = async (new_user) => {
  try {
    const userData = {
      first_name: "",
      last_name: "",
      email: new_user.email,
      phone_number: "",
      status: "ACTIVE",
      passport_id: new_user.passport_id,
      auth_user_id: new_user.auth_user_id,
      created_at_datetime: new_user.created_at_datetime,
      updated_at_datetime: new_user.updated_at_datetime,
    };

    const db_user = await db("tasttlig_users").insert(userData).returning("*");

    await db("roles")
      .select()
      .where({
        role: "MEMBER",
      })
      .then(async (value) => {
        // Insert new role in auth server
        const {success, user} = await auth_server_service.authAddRole(
          new_user.auth_user_id,
          value[0].role_code
        );

        // Insert new role for this user
        await db("user_role_lookup").insert({
          user_id: db_user[0].tasttlig_user_id,
          role_code: value[0].role_code,
        });
      });

    // Insert new roles for this user
    new_user.roles.map(async (role) => {
      await db("user_role_lookup").insert({
        user_id: db_user[0].tasttlig_user_id,
        role_code: role.role_code,
      });
    });
  } catch (error) {
    console.log(error);
  }
};

const getAllUsers = async (page, searchText) => {
  return User.query()
    .withGraphFetched("[roles, access]")
    .page(page, 100)
    .where(
      raw(
        "first_name || ' ' ||  last_name || ' ' ||  email || ' ' || phone_number"
      ),
      "like",
      `%${searchText}%`
    );
};

module.exports = {
  userRegister,
  verifyAccount,
  getUserLogin,
  getUserLogOut,
  checkEmail,
  updatePassword,
  updatePasswordFromToken,
  createDummyUser,
  createBecomeFoodProviderUser,
  findUserByEmail,
  findUserByBusinessName,
  getUserByBusinessDetails,
  userMigrationFromAuthServer,
  getAllUsers,
};
