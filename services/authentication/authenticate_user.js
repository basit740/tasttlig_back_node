"use strict";

// Libraries
const { db } = require("../../db/db-config");
const jwt = require("jsonwebtoken");
const Mailer = require("../email/nodemailer").nodemailer_transporter;
const { generateRandomString } = require("../../functions/functions");
const auth_server_service = require("../../services/authentication/auth_server_service");

// Environment variables
const SITE_BASE = process.env.SITE_BASE;
const ADMIN_EMAIL = process.env.TASTTLIG_ADMIN_EMAIL;

// Save user register information to Tasttlig users table helper function
const userRegister = async (new_user, sendEmail = true) => {
  try {
    const { success, user } = await auth_server_service.authSignup(
      new_user.email,
      new_user.password
    );

    if (success) {
      return db.transaction(async (trx) => {
        let new_db_user = [];

        const userData = {
          first_name: new_user.first_name,
          last_name: new_user.last_name,
          email: new_user.email,
          phone_number: new_user.phone_number,
          source: new_user.source,
          status: "ACTIVE",
          passport_id: user.passport_id,
          auth_user_id: user.id,
          created_at_datetime: new Date(),
          updated_at_datetime: new Date(),
        };

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
              const { success, user } = await auth_server_service.authAddRole(
                value1[0].auth_user_id,
                value[0].role_code
              );

              // Insert new role for this user
              await db("user_role_lookup").insert({
                user_id: value1[0].tasttlig_user_id,
                role_code: value[0].role_code,
              });
            });

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

          return { success: true, data: value1[0] };
        });
      });
    } else {
      return { success: false, data: "Error from auth server." };
    }
  } catch (error) {
    return { success: false, data: error.message };
  }
};

// Verify user account helper function
const verifyAccount = async (user_id) => {
  return await db("tasttlig_users")
    .where("tasttlig_user_id", user_id)
    .update("is_email_verified", true)
    .returning("*")
    .then((value) => {
      return {
        success: true,
        message: "Email is verified.",
        user_id: value[0].tasttlig_user_id,
      };
    })
    .catch((reason) => {
      return { success: false, data: reason };
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
          return { success: false, message: "User not found." };
        }

        return { success: true, user: value };
      })
      .catch((reason) => {
        return { success: false, data: reason };
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
          return { success: false, message: "User not found." };
        }

        return { success: true, user: value };
      })
      .catch((reason) => {
        return { success: false, data: reason };
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

      return { success: false, data: "Refresh token not found." };
    })
    .catch((reason) => {
      return { success: false, data: reason };
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

      const {
        email_token,
      } = await auth_server_service.authPasswordResetRequest(email);

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

// Update password from user helper function
const updatePassword = async (email, password, token) => {
  const { success, user } = await auth_server_service.authPasswordReset(
    token,
    password
  );

  if (success) {
    await Mailer.sendMail({
      from: process.env.SES_DEFAULT_FROM,
      to: email,
      subject: "[Tasttlig] Password changed",
      template: "password_reset_success",
    })
      .then(() => {
        return { success: true, message: "Success." };
      })
      .catch((reason) => {
        return { success: false, message: reason };
      });
  } else {
    return { success: false, message: "JWT error." };
  }
};

// Save visitor account information to Tasttlig users table helper function
const createDummyUser = async (email) => {
  try {
    const { success, user } = await auth_server_service.authSignup(
      email,
      generateRandomString(8)
    );

    if (success) {
      return await db("tasttlig_users")
        .insert({
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

          return { success: true, user: value[0] };
        })
        .catch((reason) => {
          return { success: false, data: reason };
        });
    } else {
      return { success: false, data: "Error from auth server." };
    }
  } catch (error) {
    return { success: false, data: error.message };
  }
};

/* Email to new user from multi-step form with login details and password reset 
link helper function */
const sendNewUserEmail = async (new_user) => {
  const email = new_user.email;
  const { email_token } = await auth_server_service.authPasswordResetRequest(
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
        password: new_user.password,
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
    const { success, user } = await auth_server_service.authSignup(
      become_food_provider_user.email,
      become_food_provider_user.password
    );

    if (success) {
      return await db("tasttlig_users")
        .insert({
          first_name: become_food_provider_user.first_name,
          last_name: become_food_provider_user.last_name,
          email: become_food_provider_user.email,
          phone_number: become_food_provider_user.phone_number,
          status: "ACTIVE",
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
              role: "MEMBER",
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

          return { success: true, user: value[0] };
        })
        .catch((reason) => {
          return { success: false, data: reason };
        });
    } else {
      return { success: false, data: "Error from auth server." };
    }
  } catch (error) {
    // Duplicate key
    if (error.code === 23505) {
      return createBecomeFoodProviderUser(become_food_provider_user);
    }

    return { success: false, data: error.message };
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

      return { success: true, user: value };
    })
    .catch((reason) => {
      return { success: false, data: reason };
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

      return { success: true, user: value };
    })
    .catch((reason) => {
      return { success: false, data: reason };
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

      return { success: true, business_details: value };
    })
    .catch((reason) => {
      return { success: false, data: reason };
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
        const { success, user } = await auth_server_service.authAddRole(
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

module.exports = {
  userRegister,
  verifyAccount,
  getUserLogin,
  getUserLogOut,
  checkEmail,
  updatePassword,
  createDummyUser,
  createBecomeFoodProviderUser,
  findUserByEmail,
  findUserByBusinessName,
  getUserByBusinessDetails,
  userMigrationFromAuthServer,
};
