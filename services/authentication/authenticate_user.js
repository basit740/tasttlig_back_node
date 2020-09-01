"use strict";

const db = require("../../db/db-config");
const jwt = require("jsonwebtoken");
const Mailer = require("../email/nodemailer").nodemailer_transporter;

const SITE_BASE = process.env.SITE_BASE;

const userRegister = async (user, sendEmail= true) => {
  try{
    return db.transaction(async trx => {
      let new_db_user = [];
      await trx("tasttlig_users")
        .where("email", user.email)
        .first()
        .then(value => {
          if (!value) {
            const userData = {
              first_name: user.first_name,
              last_name: user.last_name,
              email: user.email,
              password: user.password,
              phone_number: user.phone_number,
              role: "MEMBER",
              status: "ACTIVE",
              created_at_datetime: new Date(),
              updated_at_datetime: new Date()
            }
            if (user.is_participating_in_festival) {
              userData.is_participating_in_festival = user.is_participating_in_festival;
            }
            new_db_user = trx("tasttlig_users")
              .insert(userData)
              .returning("*");
          } else {
            new_db_user = trx("tasttlig_users")
              .where("tasttlig_user_id", value.tasttlig_user_id)
              .update({
                first_name: user.first_name,
                last_name: user.last_name,
                password: user.password,
                phone_number: user.phone_number,
                role: "MEMBER",
                status: "ACTIVE",
                created_at_datetime: new Date(),
                updated_at_datetime: new Date()
              })
              .returning("*");
          }
        });
      return await new_db_user
        .then(value1 => {
          if(sendEmail) {
            jwt.sign({
                user: value1[0].tasttlig_user_id
              },
              process.env.EMAIL_SECRET,
              {
                expiresIn: "28d"
              },
              // Async email verification email
              async (err, emailToken) => {
                const urlVerifyEmail = `${SITE_BASE}/user/verify/${emailToken}`;
                await Mailer.sendMail({
                  from: process.env.SES_DEFAULT_FROM,
                  to: user.email,
                  bcc: process.env.TASTTLIG_ADMIN_EMAIL,
                  subject: "[Tasttlig] Welcome to Tasttlig!",
                  template: 'signup',
                  context: {
                    first_name: user.first_name,
                    last_name: user.last_name,
                    urlVerifyEmail: urlVerifyEmail
                  }
                });
              });
          }
          return {success: true, data: value1[0]};
        })
    });
  }catch (error) {
    return {success: false, data: error.message};
  }
}

const verifyAccount = async user_id => {
  return await db("tasttlig_users")
    .where("tasttlig_user_id", user_id)
    .update("is_email_verified", true)
    .returning("*")
    .then(value => {
      return {success: true, message: "ok", user_id: value[0].tasttlig_user_id};
    })
    .catch(reason => {
      return {success: false, data: reason};
    });
}

const getUserLogin = async email => {
  return await db("tasttlig_users")
    .where("email", email)
    .first()
    .then(value => {
      if (!value) {
        return { success: false, message: "User not found." };
      }
      return { success: true, user: value };
    }).catch(reason => {
      return { success: false, data: reason };
    });
}

const getUserLogOut = async user_id => {
  return await db("refresh_tokens")
    .del()
    .where("user_id", user_id)
    .then(value => {
      if (value === user_id) {
        return {
          success: true,
          message: "User logged out, refresh token deleted."
        };
      }
      return { success: false, data: "Refresh Token Not Found" };
    }).catch(reason => {
      return { success: false, data: reason };
    });
}

const checkEmail = async email => {
  return await db("tasttlig_users")
    .where("email", email)
    .first()
    .then(value => {
      if(!value){
        return {
          success: false,
          message: "ok",
          response: `There is no account for ${email}.`
        }
      }
      jwt.sign(
        { email },
        process.env.EMAIL_SECRET,
        {
          expiresIn: "15m"
        },
        // Async reset password email
        async (err, emailToken) => {
          try {
            const url = `${SITE_BASE}/forgot-password/${emailToken}/${email}`;
            await Mailer.sendMail({
              from: process.env.SES_DEFAULT_FROM,
              to: email,
              subject: "[Tasttlig] Reset your password",
              template: 'password_reset_request',
              context: {
                url: url
              }
            });
            return {
              success: true,
              message: "ok",
              response: `Your update password email has been sent to ${email}.`
            };
          } catch (err) {
            return {
              success: false,
              message: "error",
              response:"Error in sending email"
            }
          }
        }
      );
    }).catch(reason => {
      return {
        success: false,
        message: "error",
        response: reason
      }
    });
}

const updatePassword = async (email, password) => {
  return await db("tasttlig_users")
    .where("email", email)
    .update("password", password)
    .returning("*")
    .then(value => {
      jwt.sign(
        {user: value[0].tasttlig_user_id},
        process.env.EMAIL_SECRET,
        {
          expiresIn: "15m"
        },
        // Async password change confirmation email
        async () => {
          await Mailer.sendMail({
            from: process.env.SES_DEFAULT_FROM,
            to: email,
            subject: "[Tasttlig] Password changed",
            template: 'password_reset_success'
          })
            .then(value1 => {
              return {success: true, message: "ok", data: value[0]};
            })
            .catch(reason => {
              return {success: false, message: reason};
            });
        }
      );
    }).catch(reason => {
      return {success: false, message: reason};
    });
}

module.exports = {
  userRegister,
  verifyAccount,
  getUserLogin,
  getUserLogOut,
  checkEmail,
  updatePassword
}