"use strict";

// Libraries
const {db} = require("../../db/db-config");
const jwt = require("jsonwebtoken");
const {raw} = require("objection");
const Mailer = require("../email/nodemailer").nodemailer_transporter;
const path = require('path');
const {generateRandomString} = require("../../functions/functions");
const auth_server_service = require("../../services/authentication/auth_server_service");
const User = require("../../models/users");
const Access = require("../../models/app_access");
const bcrypt = require("bcrypt");
const business_service = require("../../services/passport/businessPassport");
const user_profile_service = require("../../services/profile/user_profile");
const {getMaxListeners} = require("process");
const {Users} = require("../../models");

// Environment variables
const SITE_BASE = process.env.SITE_BASE;
const ADMIN_EMAIL = process.env.TASTTLIG_ADMIN_EMAIL;

// Save user register information to Tasttlig users table helper function
const userRegister = async (new_user, sendEmail = true, trx = null) => {
  try {
    if (trx === null) {
      trx = db;
    }

    const userData = {
      password_digest: new_user.password,
      first_name: new_user.first_name,
      last_name: new_user.last_name,
      email: new_user.email,
      phone_number: new_user.phone_number,
      source: new_user.source,
      status: "ACTIVE",
      created_at_datetime: new Date(),
      updated_at_datetime: new Date(),
      user_city: new_user.city,
      user_state: new_user.state,
      user_country: new_user.country,
      user_zip_postal_code: new_user.postal_code,
      street_name: new_user.street_name,
      street_number: new_user.street_number,
      apartment_no: new_user.unit_number,
    };

    if (new_user.is_participating_in_festival) {
      userData.is_participating_in_festival =
        new_user.is_participating_in_festival;
    }

    let new_db_user = trx("tasttlig_users").insert(userData).returning("*");

    return await new_db_user.then(async (value1) => {
      const {tasttlig_user_id, first_name, last_name} = value1[0];

      // Get role code of new role to be added
      trx("roles")
        .select()
        .where({
          role: "GUEST",
        })
        .then(async (value) => {
          // Insert new role for this user
          await trx("user_role_lookup").insert({
            user_id: tasttlig_user_id,
            role_code: value[0].role_code,
          });
        });

      // Send sign up email confirmation to the user
      if (sendEmail) {
        jwt.sign(
          {
            user: tasttlig_user_id,
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
              subject: "Verify Your Account!",
              template: "signup",
              context: {
                urlVerifyEmail,
                first_name,
                last_name
              },
            });
          }
        );
      }

      return {success: true, data: value1[0]};
    });
  } catch (error) {
    console.log(error);
    const message = error.code === "23505"
      ? "User with email already exists"
      : error.message
    return {success: false, data: message};
  }
};

var d = new Date();
var year = d.getFullYear();
var month = d.getMonth();
var day = d.getDate();
// Verify user account helper function
const verifyAccount = async (user_id) => {
  await Users.transaction(async trx => {
    const user = await Users.query(trx).findById(user_id);

    if (!user) {
      throw {status: 404, message: 'User not found'};
    }

    await user.$query(trx).update({
      is_email_verified: true,
      email_verified_date_time: new Date(),
      passport_expiry_date: new Date(year + 5, month, day),
    });

    await sendGuestWelcomeEmail(user);

    return user
  });

  return {success: true, message: "Email is verified.", user_id};
};

const sendGuestWelcomeEmail = async (user) => {
  await Mailer.sendMail({
    from: process.env.SES_DEFAULT_FROM,
    to: user.email,
    bcc: ADMIN_EMAIL,
    subject: "Welcome to Tasttlig!",
    template: "guest_welcome",
    context: {
      first_name: user.first_name
    },
  });
}

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

      const {tasttlig_user_id, first_name} = value;

      const email_token = jwt.sign(
        {user_id: tasttlig_user_id, first_name},
        process.env.EMAIL_SECRET,
        {
          expiresIn: "28d",
        }
      );

      try {
        const url = `${SITE_BASE}/forgot-password/${email_token}/${email}`;

        console.log(email_token)

        await Mailer.sendMail({
          from: process.env.SES_DEFAULT_FROM,
          to: email,
          subject: "[Tasttlig] Reset your password",
          template: "password_reset_request",
          context: {
            url,
            first_name
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
  const {user, first_name} = encrypted;
  const success = await User.query()
    .findById(user)
    .patch({password_digest: password});

  if (success) {
    await auth_server_service.authRemove(email);
    await Mailer.sendMail({
      from: process.env.SES_DEFAULT_FROM,
      to: email,
      subject: "[Tasttlig] Password changed",
      template: "password_reset_success",
      context: {
        first_name,
        siteBase: SITE_BASE
      }
    }).then(() => {
      return {success: true, message: "Success."};
    }).catch((reason) => {
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
    .withGraphFetched("[access]")
    .page(page, 20)
    .where(
      raw(
        "first_name || ' ' ||  last_name || ' ' ||  email || ' ' || phone_number"
      ),
      "like",
      `%${searchText}%`
    );
};

const userAndBusinessRegister = async (data) => {

  const {
    first_name,
    last_name,
    email,
    password_digest,
    phone_number,
    passport_type,
    source,
    user_business_logo,
    user_business_name,
    user_business_street_number,
    user_business_street_name,
    user_business_unit,
    user_business_country,
    user_business_city,
    user_business_province,
    user_business_postal_code,
    user_business_registered,
    user_business_phone_number,
    is_business,
    user_business_retail,
    user_business_type,
    start_date,
    businessFoodType,
    verificationCode,
    promoCode,
    businessId,
    festivalId
  } = data;

  if (!email || !password_digest || !source) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }

  const user = {
    first_name,
    last_name,
    email,
    password: password_digest,
    phone_number,
    passport_type,
    source,
  };

  const businessInfo = {
    user_business_logo,
    user_business_name,
    user_business_street_number,
    user_business_street_name,
    user_business_unit,
    user_business_country,
    user_business_city,
    user_business_province,
    user_business_postal_code,
    user_business_registered,
    user_business_phone_number,
    is_business,
    user_business_retail,
    user_business_type,
    start_date,
    user_business_food_type: businessFoodType,
    verification_code: verificationCode,
    promo_code: promoCode,
    business_id: businessId,
    festival_id: festivalId,
  }

  const hostDto = {
    is_business: is_business,
    email: email,
  };

  try {

    db.transaction(async trx => {
      const user_response = await userRegister(user, trx);
      businessInfo.user_id = user_response.data.tasttlig_user_id;
      const business_response = await business_service.postBusinessPassportDetails(businessInfo, trx);

      const saveHost = await user_profile_service.saveHostApplication(hostDto, user_response.data, trx);

      if (saveHost.success) {
        res.status(200).send(saveHost);
      } else {
        return {
          success: false,
          message: "error",
        };
      }

    })

  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: error.message,
    };
  }
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
  userAndBusinessRegister
};
