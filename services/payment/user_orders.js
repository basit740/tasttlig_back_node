"use strict";

// Libraries
const { db } = require("../../db/db-config");
const Orders = require("../../models/orders");
const Experiences = require("../../models/experiences");
const point_system_service = require("../profile/points_system");
const festival_service = require("../../services/festival/festival");
const Mailer = require("../email/nodemailer").nodemailer_transporter;
const moment = require("moment");
const _ = require("lodash");

// Environment variables
const ADMIN_EMAIL = process.env.TASTTLIG_ADMIN_EMAIL;

// Get vendor package details

const getVendorSubscriptionDetails = async () => {
  return await await db("subscriptions")
    .select("subscription_name", "price")
    .where("subscription_name", "LIKE", "vendor%");
};

// Get order details helper function
const getOrderDetails = async (order_details) => {
  const sponsorshipPackagesAdapter = () => {
    if (
      order_details.item_type === "package" &&
      order_details.item_id === "all"
    )
      return true;
    else return false;
  };

  const sponsorshipPackagePaymentAdapter = () => {
    if (
      order_details.item_type === "package" &&
      order_details.item_id !== "all"
    )
      return true;
    else return false;
  };

  if (
    order_details.item_type === "plan" ||
    order_details.item_type === "subscription" ||
    sponsorshipPackagePaymentAdapter()
  ) {
    return await db("subscriptions")
      .where({
        subscription_code: order_details.item_id,
        //status: "ACTIVE",
      })
      .first()
      .then((value) => {
        if (!value) {
          return { success: false, message: "No plan found." };
        }

        return { success: true, item: value };
      })
      .catch((error) => {
        return { success: false, message: error };
      });
  }
  // get all active subscriptions by item_type
  else if (sponsorshipPackagesAdapter()) {
    return await db("subscriptions")
      .where({
        subscription_type: order_details.item_type,
        status: "ACTIVE",
      })
      .then((value) => {
        if (!value) {
          return { success: false, message: "No plans found." };
        }

        return { success: true, item: value };
      })
      .catch((error) => {
        return { success: false, message: error };
      });
  } else if (order_details.item_type === "food_sample") {
    return await db("products")
      .where({
        product_id: order_details.item_id,
        status: "ACTIVE",
      })
      .first()
      .then((value) => {
        if (!value) {
          return { success: false, message: "No food sample found." };
        }

        return { success: true, item: value };
      })
      .catch((error) => {
        return { success: false, message: error };
      });
  } else if (order_details.item_type === "festival") {
    return await db("festivals")
      .where({
        festival_id: order_details.item_id,
      })
      .first()
      .then((value) => {
        if (!value) {
          return { success: false, message: "No festival found." };
        }

        return { success: true, item: value };
      })
      .catch((error) => {
        return { success: false, message: error };
      });
  } else if (order_details.item_type === "vendor") {
    return await db("business_details")
      .where({
        festival_id: order_details.item_id,
      })
      .first()
      .then((value) => {
        if (!value) {
          return { success: false, message: "No festival found." };
        }

        return { success: true, item: value };
      })
      .catch((error) => {
        return { success: false, message: error };
      });
  } else if (order_details.item_type === "product") {
    return await db("products")
      .where({
        product_id: order_details.item_id,
        status: "ACTIVE",
      })
      .first()
      .then((value) => {
        if (!value) {
          return { success: false, message: "No product found." };
        }

        return { success: true, item: value };
      })
      .catch((error) => {
        return { success: false, message: error };
      });
  } else if (order_details.item_type === "service") {
    return await db("services")
      .where({
        service_id: order_details.item_id,
        service_status: "ACTIVE",
      })
      .first()
      .then((value) => {
        if (!value) {
          return { success: false, message: "No service found." };
        }

        return { success: true, item: value };
      })
      .catch((error) => {
        return { success: false, message: error };
      });
  } else if (order_details.item_type === "experience") {
    return await db("experiences")
      .where({
        experience_id: order_details.item_id,
        experience_status: "ACTIVE",
      })
      .first()
      .then((value) => {
        if (!value) {
          return { success: false, message: "No experience found." };
        }

        return { success: true, item: value };
      })
      .catch((error) => {
        return { success: false, message: error };
      });
  } else if (order_details.item_type === "service") {
    return await db("services")
      .where({
        service_id: order_details.item_id,
        service_status: "ACTIVE",
      })
      .first()
      .then((value) => {
        if (!value) {
          return { success: false, message: "No experience found." };
        }

        return { success: true, item: value };
      })
      .catch((error) => {
        return { success: false, message: error };
      });
  }
  return { success: false, message: "Item type not supported." };
};

// Get shopping cart order details helper function
const getCartOrderDetails = async (cartItems) => {
  let experienceIdList = [];
  let CartItemDetails = [];

  cartItems.map((item) => {
    experienceIdList.push(item.itemId);
  });

  return await db
    .select("*")
    .from("experiences")
    .whereIn("experiences.experience_id", experienceIdList)
    .then((value) => {
      let totalPrice = 0;

      value.map((item) => {
        let itemPrice = 0;

        cartItems.map((cartItem) => {
          if (cartItem.itemId == item.experience_id) {
            CartItemDetails.push({
              title: item.title,
              time:
                moment(
                  moment(
                    new Date(item.start_date).toISOString().split("T")[0] +
                      "T" +
                      item.start_time +
                      ".000Z"
                  ).add(new Date().getTimezoneOffset(), "m")
                ).format("MMM Do") +
                " " +
                moment(
                  moment(
                    new Date(item.start_date).toISOString().split("T")[0] +
                      "T" +
                      item.start_time +
                      ".000Z"
                  ).add(new Date().getTimezoneOffset(), "m")
                ).format("hh:mm a") +
                " - " +
                moment(
                  moment(
                    new Date(item.start_date).toISOString().split("T")[0] +
                      "T" +
                      item.end_time +
                      ".000Z"
                  ).add(new Date().getTimezoneOffset(), "m")
                ).format("hh:mm a"),
              address: item.address + ", " + item.city + ", " + item.state,
              quantity: cartItem.quantity,
            });

            itemPrice = parseFloat(item.price) * parseFloat(cartItem.quantity);
          }
        });

        totalPrice = totalPrice + itemPrice;
      });

      return {
        success: true,
        details: { cartItemDetails: CartItemDetails, price: totalPrice },
      };
    })
    .catch((reason) => {
      return { success: false, details: reason };
    });
};

// Create order helper function
const createOrder = async (
  order_details,
  db_order_details,
  additionalEmail
) => {
  if (
    order_details.item_type === "plan" ||
    order_details.item_type === "subscription"
  ) {
    try {
      await db.transaction(async (trx) => {
        const total_amount_before_tax = parseFloat(db_order_details.item.price);
        const total_tax = Math.round(total_amount_before_tax * 13) / 100;
        const total_amount_after_tax = total_amount_before_tax + total_tax;
        const db_orders = await trx("orders")
          .insert({
            order_by_user_id: order_details.user_id,
            status: "SUCCESS",
            total_amount_before_tax,
            total_tax,
            total_amount_after_tax,
            order_datetime: new Date(),
          })
          .returning("*");

        if (!db_orders) {
          return { success: false, details: "Inserting new order failed." };
        }
        //console.log(db_orders);
        //console.log(db_order_details);

        await trx("order_items").insert({
          order_id: db_orders[0].order_id,
          item_id: order_details.item_id,
          item_type: order_details.item_type,
          quantity: 1,
          price_before_tax: total_amount_before_tax,
        });

        await trx("payments").insert({
          order_id: db_orders[0].order_id,
          payment_reference_number: order_details.payment_id,
          payment_type: "CARD",
          payment_vender: "STRIPE",
        });

        let subscription_end_datetime = null;

        if (db_order_details.item.validity_in_months) {
          subscription_end_datetime = new Date().setMonth(
            new Date().getMonth() + db_order_details.item.validity_in_months
          );
        } else {
          subscription_end_datetime = db_order_details.item.date_of_expiry;
        }

        await trx("user_subscriptions").insert({
          subscription_code: db_order_details.item.subscription_code,
          user_id: order_details.user_id,
          subscription_start_datetime: new Date(),
          subscription_end_datetime: subscription_end_datetime,
        });

        // await point_system_service.addUserPoints(
        //   order_details.user_id,
        //   total_amount_after_tax * 100
        // );

        // Get role code of new role to be added
        if (!db_order_details.item.subscription_name === "vendor_basic") {
          const new_role_code = await trx("roles")
            .select()
            .where({ role: db_order_details.item.subscription_name })
            .then((value) => {
              return value[0].role_code;
            });

          // Insert new role for this user
          await trx("user_role_lookup").insert({
            user_id: order_details.user_id,
            role_code: new_role_code,
          });
        }
      });

      const membership_plan_name = _.startCase(order_details.item_id);

      if (additionalEmail !== "") {
        await Mailer.sendMail({
          from: process.env.SES_DEFAULT_FROM,
          to: additionalEmail,
          bcc: ADMIN_EMAIL,
          subject: "[Tasttlig] Membership Plan Purchase",
          template: "membership_plan_purchase",
          context: {
            membership_plan_name,
          },
        });
      }

      // Email to user on submitting the request to upgrade
      await Mailer.sendMail({
        from: process.env.SES_DEFAULT_FROM,
        to: order_details.user_email,
        bcc: ADMIN_EMAIL,
        subject: "[Tasttlig] Membership Plan Purchase",
        template: "membership_plan_purchase",
        context: {
          membership_plan_name,
        },
      });
      console.log("success");
      return { success: true, details: "Success." };
    } catch (error) {
      return { success: false, details: error.message };
    }
  }
  //package db operations
  if (order_details.item_type === "package") {
    try {
      await db.transaction(async (trx) => {
        let total_amount_before_tax = parseFloat(db_order_details.item.price);
        if (order_details.vendor_festivals) {
          total_amount_before_tax =
            order_details.vendor_festivals.length * total_amount_before_tax;
        }
        let total_tax = Math.round(total_amount_before_tax * 13) / 100;
        let total_amount_after_tax = total_amount_before_tax + total_tax;
        const db_orders = await trx("orders")
          .insert({
            order_by_user_id: order_details.user_id,
            status: "SUCCESS",
            total_amount_before_tax,
            total_tax,
            total_amount_after_tax,
            order_datetime: new Date(),
          })
          .returning("*");

        if (!db_orders) {
          return { success: false, details: "Inserting new order failed." };
        }

        await trx("order_items").insert({
          order_id: db_orders[0].order_id,
          item_id: order_details.item_id,
          item_type: order_details.item_type,
          quantity: order_details.vendor_festivals
            ? order_details.vendor_festivals.length
            : 1,
          price_before_tax: total_amount_before_tax,
        });

        await trx("payments").insert({
          order_id: db_orders[0].order_id,
          payment_reference_number: order_details.payment_id,
          payment_type: "CARD",
          payment_vender: "STRIPE",
        });

        let subscription_end_datetime = null;

        if (db_order_details.item.validity_in_months) {
          subscription_end_datetime = new Date(
            new Date().setMonth(
              new Date().getMonth() +
                Number(db_order_details.item.validity_in_months)
            )
          );
        } else {
          subscription_end_datetime = db_order_details.item.date_of_expiry;
        }

        if (order_details.discount < 1) {
          for (let festival_id of db_order_details.subscribed_festivals) {
            console.log("festival for rejection:", festival_id);

            await db("user_subscriptions")
              .where("user_id", order_details.user_id)
              .andWhere("subscription_code", order_details.item_id)
              .update({
                suscribed_festivals: trx.raw(
                  "array_append(suscribed_festivals, ?)",
                  [festival_id]
                ),
              })
              .returning("*")
              .catch((reason) => {
                console.log("reason for rejection:", reason);
                return { success: false, message: reason };
              });

            await db("festivals")
              .where("festival_id", festival_id)
              .update({
                // instead of adding user to festival_vendor_id, add user to vendor_request_id
                // festival_vendor_id: trx.raw(
                //   "array_append(festival_vendor_id, ?)",
                //   [order_details.user_id]
                // ),
                vendor_request_id: trx.raw(
                  "array_append(vendor_request_id, ?)",
                  [order_details.user_id]
                ),
              })
              .returning("*")
              .catch((reason) => {
                console.log("reason for rejection:", reason);
                return { success: false, message: reason };
              });
          }
        } else {
          // get festival
          if (order_details.festival_slug) {
            const db_festival = await festival_service.getFestivalDetailsBySlug(
              order_details.festival_slug,
              {id: 1, role: ["ADMIN"]}
            );
            // set a month for subscription, placeholder for easier access to subscription duration
            order_details.subscription_end_datetime = new Date(
              new Date().setMonth(
                new Date().getMonth() +
                Number(db_order_details.item.validity_in_months)
              ));

            await trx("user_subscriptions").insert({
              subscription_code: db_order_details.item.subscription_code,
              user_id: order_details.user_id,
              subscription_start_datetime: new Date(),
              subscription_end_datetime: subscription_end_datetime,
              suscribed_festivals: [db_festival.details[0].festival_id],
              cash_payment_received: db_order_details.item.price,
              user_subscription_status: "ACTIVE",
              business_id: order_details.business_id,

            });
          }
          else {
            await trx("user_subscriptions").insert({
              subscription_code: db_order_details.item.subscription_code,
              user_id: order_details.user_id,
              subscription_start_datetime: new Date(),
              subscription_end_datetime: subscription_end_datetime,
              suscribed_festivals: db_order_details.subscribed_festivals,
              cash_payment_received: db_order_details.item.price,
              user_subscription_status: "ACTIVE",
            });
          }
  
         
          if (
            db_order_details.subscribed_festivals &&
            db_order_details.item.subscription_code === "V_MIN"
          ) {
            for (let festival_id of db_order_details.subscribed_festivals) {
              let db_festival;
              db_festival = await festival_service.getFestivalDetails(
                festival_id
              );
              console.log("festival for rejection from here:", festival_id);
              await db("festivals")
                .where("festival_id", festival_id)
                .update({
                  vendor_request_id: trx.raw(
                    "array_append(vendor_request_id, ?)",
                    [order_details.user_id]
                  ),
                })
                .returning("*")
                .catch((reason) => {
                  console.log("reason for rejection:", reason);
                  return { success: false, message: reason };
                });

              await trx("applications").insert({
                user_id: order_details.user_id,
                created_at: new Date(),
                updated_at: new Date(),
                receiver_id: db_festival.details[0].festival_host_admin_id[0],
                reason: "vendor application",
                type: "vendor",
                status: "Pending",
                festival_id: festival_id,
              });
            }
          } else if (
            db_order_details.subscribed_festivals &&
            db_order_details.item.subscription_code === "S_KMIN"
          ) {
            for (let festival_id of db_order_details.subscribed_festivals) {
              let db_festival;
              db_festival = await festival_service.getFestivalDetails(
                festival_id
              );
              console.log("festival for rejection from here:", festival_id);
              await db("festivals")
                .where("festival_id", festival_id)
                .update({
                  sponsor_request_id: trx.raw(
                    "array_append(sponsor_request_id, ?)",
                    [order_details.user_id]
                  ),
                })
                .returning("*")
                .catch((reason) => {
                  console.log("reason for rejection:", reason);
                  return { success: false, message: reason };
                });

              await trx("applications").insert({
                user_id: order_details.user_id,
                created_at: new Date(),
                updated_at: new Date(),
                receiver_id: db_festival.details[0].festival_host_admin_id[0],
                reason: "sponsor application",
                type: "sponsor",
                status: "Pending",
                festival_id: festival_id,
              });
            }
          }
        }
      });

      const package_plan_name = _.startCase(
        db_order_details.item.subscription_name
      );

      if (additionalEmail !== "") {
        await Mailer.sendMail({
          from: process.env.SES_DEFAULT_FROM,
          to: additionalEmail,
          bcc: ADMIN_EMAIL,
          subject: "[Tasttlig] Package Purchase",
          template: "package_purchase",
          context: {
            package_plan_name,
          },
        });
      }

      // Email to user on submitting the request to upgrade
      await Mailer.sendMail({
        from: process.env.SES_DEFAULT_FROM,
        to: order_details.user_email,
        bcc: ADMIN_EMAIL,
        subject: "[Tasttlig] Package Purchase",
        template: "package_purchase",
        context: {
          package_plan_name,
        },
      });

      return { success: true, details: "Success." };
    } catch (error) {
      console.log(error);
      return { success: false, details: error.message };
    }
  } else if (order_details.item_type === "food_sample") {
    try {
      await db.transaction(async (trx) => {
        const total_amount_before_tax = parseFloat(db_order_details.item.price);
        const total_tax = Math.round(total_amount_before_tax * 13) / 100;
        const total_amount_after_tax = total_amount_before_tax + total_tax;
        const db_orders = await trx("orders")
          .insert({
            order_by_user_id: order_details.user_id,
            status: "SUCCESS",
            total_amount_before_tax,
            total_tax,
            total_amount_after_tax,
            order_datetime: new Date(),
          })
          .returning("*");

        if (!db_orders) {
          return { success: false, details: "Inserting new order failed." };
        }

        await trx("order_items").insert({
          order_id: db_orders[0].order_id,
          item_id: order_details.item_id,
          item_type: order_details.item_type,
          quantity: 1,
          price_before_tax: total_amount_before_tax,
        });

        await trx("payments").insert({
          order_id: db_orders[0].order_id,
          payment_reference_number: order_details.payment_id,
          payment_type: "CARD",
          payment_vender: "STRIPE",
        });

        await point_system_service.addUserPoints(
          order_details.user_id,
          total_amount_after_tax * 100
        );
      });

      if (additionalEmail !== "") {
        await Mailer.sendMail({
          from: process.env.SES_DEFAULT_FROM,
          to: additionalEmail,
          bcc: ADMIN_EMAIL,
          subject: "[Tasttlig] Purchase Successful",
          template: "new_food_sample_purchase",
          context: {
            title: db_order_details.item.title,
          },
        });
      }

      // Email to user on successful purchase
      await Mailer.sendMail({
        from: process.env.SES_DEFAULT_FROM,
        to: order_details.user_email,
        bcc: ADMIN_EMAIL,
        subject: "[Tasttlig] Purchase Successful",
        template: "new_food_sample_purchase",
        context: {
          title: db_order_details.item.title,
        },
      });

      return { success: true, details: "Success." };
    } catch (error) {
      return { success: false, details: error.message };
    }
  } else if (order_details.item_type === "festival") {
    try {
      await db.transaction(async (trx) => {
        const total_amount_before_tax = parseFloat(
          db_order_details.item.festival_price
        );
        const total_tax = Math.round(total_amount_before_tax * 13) / 100;
        const total_amount_after_tax = total_amount_before_tax + total_tax;
        const db_orders = await trx("orders")
          .insert({
            order_by_user_id: order_details.user_id,
            status: "SUCCESS",
            total_amount_before_tax,
            total_tax,
            total_amount_after_tax,
            order_datetime: new Date(),
          })
          .returning("*");

        if (!db_orders) {
          return { success: false, details: "Inserting new order failed." };
        }

        await trx("order_items").insert({
          order_id: db_orders[0].order_id,
          item_id: order_details.item_id,
          item_type: order_details.item_type,
          quantity: 1,
          price_before_tax: total_amount_before_tax,
        });

        await trx("payments").insert({
          order_id: db_orders[0].order_id,
          payment_reference_number: order_details.payment_id,
          payment_type: "CARD",
          payment_vender: "STRIPE",
        });

        await point_system_service.addUserPoints(
          order_details.user_id,
          total_amount_after_tax * 100
        );

        const db_guest = await trx("festivals")
          .where({ festival_id: order_details.item_id })
          .update({
            festival_user_guest_id: trx.raw(
              "array_append(festival_user_guest_id, ?)",
              [order_details.user_id]
            ),
          })
          .returning("*");

        if (!db_guest) {
          return { success: false, details: "Inserting new host failed." };
        }

        let db_festival;
        db_festival = await festival_service.getFestivalDetails(
          order_details.item_id
        );
        if (!db_festival) {
          return { success: false, details: "Get festival detail failed." };
        }

        const db_passport = await trx("passport_details")
        .insert({
          passport_user_id: order_details.user_id,
          passport_festival_id: order_details.item_id,
          passport_id: db_festival.details[0].basic_passport_id,
          passport_type: "BASIC"
          })
          .returning("*");
  
        if (!db_passport) {
          return { success: false, details: "Inserting new passport failed." };
        }

      });

      if (additionalEmail !== "") {
        await Mailer.sendMail({
          from: process.env.SES_DEFAULT_FROM,
          to: additionalEmail,
          bcc: ADMIN_EMAIL,
          subject: "[Tasttlig] Festival Purchase Successful",
          template: "festival/attend_festival",
          context: {
            title: db_order_details.item.festival_name,
            items: [
              {
                title: db_order_details.item.festival_name,
                address: db_order_details.item.festival_city,
                day: moment(
                  moment(
                    new Date(db_order_details.item.festival_start_date)
                      .toISOString()
                      .split("T")[0] +
                      "T" +
                      db_order_details.item.festival_start_time +
                      ".000Z"
                  ).add(new Date().getTimezoneOffset(), "m")
                ).format("MMM Do YYYY"),
                time:
                  moment(
                    moment(
                      new Date(db_order_details.item.festival_start_date)
                        .toISOString()
                        .split("T")[0] +
                        "T" +
                        db_order_details.item.festival_start_time +
                        ".000Z"
                    ).add(new Date().getTimezoneOffset(), "m")
                  ).format("hh:mm a") +
                  " - " +
                  moment(
                    moment(
                      new Date(db_order_details.item.festival_start_date)
                        .toISOString()
                        .split("T")[0] +
                        "T" +
                        db_order_details.item.festival_end_time +
                        ".000Z"
                    ).add(new Date().getTimezoneOffset(), "m")
                  ).format("hh:mm a"),
                quantity: 1,
              },
            ],
          },
        });
      }

      // Email to user on successful purchase
      await Mailer.sendMail({
        from: process.env.SES_DEFAULT_FROM,
        to: order_details.user_email,
        bcc: ADMIN_EMAIL,
        subject: "[Tasttlig] Festival Purchase Successful",
        template: "festival/attend_festival",
        context: {
          title: db_order_details.item.festival_name,
          items: [
            {
              title: db_order_details.item.festival_name,
              address: db_order_details.item.festival_city,
              day: moment(
                moment(
                  new Date(db_order_details.item.festival_start_date)
                    .toISOString()
                    .split("T")[0] +
                    "T" +
                    db_order_details.item.festival_start_time +
                    ".000Z"
                ).add(new Date().getTimezoneOffset(), "m")
              ).format("MMM Do YYYY"),
              time:
                moment(
                  moment(
                    new Date(db_order_details.item.festival_start_date)
                      .toISOString()
                      .split("T")[0] +
                      "T" +
                      db_order_details.item.festival_start_time +
                      ".000Z"
                  ).add(new Date().getTimezoneOffset(), "m")
                ).format("hh:mm a") +
                " - " +
                moment(
                  moment(
                    new Date(db_order_details.item.festival_start_date)
                      .toISOString()
                      .split("T")[0] +
                      "T" +
                      db_order_details.item.festival_end_time +
                      ".000Z"
                  ).add(new Date().getTimezoneOffset(), "m")
                ).format("hh:mm a"),
              quantity: 1,
            },
          ],
        },
      });

      return { success: true, details: "Success." };
    } catch (error) {
      return { success: false, details: error.message };
    }
  } else if (order_details.item_type === "product") {
    try {
      await db.transaction(async (trx) => {
        const total_amount_before_tax = parseFloat(
          db_order_details.item.product_price
        );
        const total_tax = Math.round(total_amount_before_tax * 13) / 100;
        const total_amount_after_tax = total_amount_before_tax + total_tax;
        const db_orders = await trx("orders")
          .insert({
            order_by_user_id: order_details.user_id,
            status: "SUCCESS",
            total_amount_before_tax,
            total_tax,
            total_amount_after_tax,
            order_datetime: new Date(),
          })
          .returning("*");

        if (!db_orders) {
          return { success: false, details: "Inserting new order failed." };
        }

        await trx("order_items").insert({
          order_id: db_orders[0].order_id,
          item_id: order_details.item_id,
          item_type: order_details.item_type,
          quantity: 1,
          price_before_tax: total_amount_before_tax,
        });

        await trx("payments").insert({
          order_id: db_orders[0].order_id,
          payment_reference_number: order_details.payment_id,
          payment_type: "CARD",
          payment_vender: "STRIPE",
        });

        const db_guest = await trx("products")
          .where({ product_id: order_details.item_id })
          .update({
            product_user_guest_id: trx.raw(
              "array_append(product_user_guest_id, ?)",
              [order_details.user_id]
            ),
          })
          .returning("*");

        if (!db_guest) {
          return {
            success: false,
            details: "Inserting new product guest failed.",
          };
        }
      });

      return { success: true, details: "Success." };
    } catch (error) {
      return { success: false, details: error.message };
    }
  } else if (order_details.item_type === "service") {
    try {
      await db.transaction(async (trx) => {
        const total_amount_before_tax = parseFloat(
          db_order_details.item.service_price
        );
        const total_tax = Math.round(total_amount_before_tax * 13) / 100;
        const total_amount_after_tax = total_amount_before_tax + total_tax;
        const db_orders = await trx("orders")
          .insert({
            order_by_user_id: order_details.user_id,
            status: "SUCCESS",
            total_amount_before_tax,
            total_tax,
            total_amount_after_tax,
            order_datetime: new Date(),
          })
          .returning("*");

        if (!db_orders) {
          return { success: false, details: "Inserting new order failed." };
        }

        await trx("order_items").insert({
          order_id: db_orders[0].order_id,
          item_id: order_details.item_id,
          item_type: order_details.item_type,
          quantity: 1,
          price_before_tax: total_amount_before_tax,
        });

        await trx("payments").insert({
          order_id: db_orders[0].order_id,
          payment_reference_number: order_details.payment_id,
          payment_type: "CARD",
          payment_vender: "STRIPE",
        });

        const db_guest = await trx("services")
          .where({ service_id: order_details.item_id })
          .update({
            service_user_guest_id: trx.raw(
              "array_append(service_user_guest_id, ?)",
              [order_details.user_id]
            ),
          })
          .returning("*");

        if (!db_guest) {
          return {
            success: false,
            details: "Inserting new service guest failed.",
          };
        }
      });

      return { success: true, details: "Success." };
    } catch (error) {
      return { success: false, details: error.message };
    }
  } else if (order_details.item_type === "experience") {
    try {
      await db.transaction(async (trx) => {
        const total_amount_before_tax = parseFloat(
          db_order_details.item.experience_price
        );
        const total_tax = Math.round(total_amount_before_tax * 13) / 100;
        const total_amount_after_tax = total_amount_before_tax + total_tax;
        const db_orders = await trx("orders")
          .insert({
            order_by_user_id: order_details.user_id,
            status: "SUCCESS",
            total_amount_before_tax,
            total_tax,
            total_amount_after_tax,
            order_datetime: new Date(),
          })
          .returning("*");

        if (!db_orders) {
          return { success: false, details: "Inserting new order failed." };
        }

        await trx("order_items").insert({
          order_id: db_orders[0].order_id,
          item_id: order_details.item_id,
          item_type: order_details.item_type,
          quantity: 1,
          price_before_tax: total_amount_before_tax,
        });

        await trx("payments").insert({
          order_id: db_orders[0].order_id,
          payment_reference_number: order_details.payment_id,
          payment_type: "CARD",
          payment_vender: "STRIPE",
        });

        const db_guest = await trx("experiences")
          .where({ experience_id: order_details.item_id })
          .update({
            experience_user_guest_id: trx.raw(
              "array_append(experience_user_guest_id, ?)",
              [order_details.user_id]
            ),
          })
          .returning("*");

        if (!db_guest) {
          return {
            success: false,
            details: "Inserting new experience guest failed.",
          };
        }
      });

      return { success: true, details: "Success." };
    } catch (error) {
      return { success: false, details: error.message };
    }
  } else {
    return { success: false, details: "Invalid item type." };
  }
};

// Create shopping cart order helper function
const createFreeOrder = async (subscriptionResponse, userId) => {
  try {
    await db.transaction(async (trx) => {
      let subscription_end_datetime = null;

      if (subscriptionResponse.validity_in_months) {
        subscription_end_datetime = new Date(
          new Date().setMonth(
            new Date().getMonth() +
              Number(subscriptionResponse.validity_in_months)
          )
        );
      } else {
        subscription_end_datetime = subscriptionResponse.date_of_expiry;
      }

      /* //host also accesses guest basic
      await trx("user_subscriptions")
        .insert({
          subscription_code: "G_BASIC",
          user_id: userId,
          subscription_start_datetime: new Date(),
          subscription_end_datetime: subscription_end_datetime,
          // suscribed_festivals: db_order_details.subscribed_festivals,
          cash_payment_received: subscriptionResponse.price,
          user_subscription_status: "Pending",
        })
        .returning("*"); */

      const db_subscription_details = await trx("user_subscriptions")
        .insert({
          subscription_code: subscriptionResponse.subscription_code,
          user_id: userId,
          subscription_start_datetime: new Date(),
          subscription_end_datetime: subscription_end_datetime,
          // suscribed_festivals: db_order_details.subscribed_festivals,
          cash_payment_received: subscriptionResponse.price,
          user_subscription_status: "Pending",
        })
        .returning("*");

      if (!db_subscription_details) {
        return {
          success: false,
          details: "Inserting new subscription failed.",
        };
      }
    });
    // Email to user on successful purchase

    return { success: true, details: "Success." };
  } catch (error) {
    return { success: false, details: error.message };
  }
};

// Create shopping cart order helper function
const createCartOrder = async (order_details, db_order_details) => {
  try {
    await db.transaction(async (trx) => {
      const total_amount_before_tax = parseFloat(db_order_details.price);
      const total_tax = Math.round(total_amount_before_tax * 13) / 100;
      const total_amount_after_tax = total_amount_before_tax + total_tax;
      const db_orders = await trx("orders")
        .insert({
          order_by_user_id: order_details.user_id,
          status: "SUCCESS",
          total_amount_before_tax,
          total_tax,
          total_amount_after_tax,
          order_datetime: new Date(),
        })
        .returning("*");

      if (!db_orders) {
        return { success: false, details: "Inserting new order failed." };
      }

      const orderItems = order_details.cartItems.map((item) => ({
        order_id: db_orders[0].order_id,
        item_id: item.itemId,
        item_type: "experience",
        quantity: item.quantity,
        price_before_tax: item.price,
      }));

      await trx("order_items").insert(orderItems);

      await trx("payments").insert({
        order_id: db_orders[0].order_id,
        payment_reference_number: order_details.payment_id,
        payment_type: "CARD",
        payment_vender: "STRIPE",
      });

      await point_system_service.addUserPoints(
        order_details.user_id,
        total_amount_after_tax * 100
      );
    });

    // Email to user on successful purchase
    await Mailer.sendMail({
      from: process.env.SES_DEFAULT_FROM,
      to: order_details.user_email,
      bcc: ADMIN_EMAIL,
      subject: "[Tasttlig] Purchase Successful",
      template: "experience/new_experience_purchase",
      context: {
        passport_id: order_details.user_passport_id,
        items: db_order_details.cartItemDetails,
      },
    });

    return { success: true, details: "Success." };
  } catch (error) {
    return { success: false, details: error.message };
  }
};

// Get all user orders helper function
const getAllUserOrders = async (user_id) => {
  try {
    const db_orders = await Orders.query()
      .withGraphFetched("[order_items, payments]")
      .where("orders.order_by_user_id", user_id)
      .orderBy("orders.order_datetime", "desc");
    let experienceIdList = [];

    db_orders.map((db_order) => {
      db_order.order_items.map((order_item) => {
        if (
          order_item.item_type === "experience" &&
          !experienceIdList.includes(order_item.item_id)
        ) {
          experienceIdList.push(order_item.item_id);
        }
      });
    });

    const db_experiences = await Experiences.query()
      .withGraphFetched("experience_images")
      .whereIn("experiences.experience_id", experienceIdList);
    let orderDetails = [];

    db_orders.map((db_order) => {
      let updated_order_items = [];
      let db_order_items = db_order.order_items;

      db_order_items.map((order_item) => {
        let new_order_item = {};
        let db_experiences_for_check = db_experiences;

        db_experiences_for_check.map((experience) => {
          if (order_item.item_id == experience.experience_id) {
            new_order_item = {
              ...order_item,
              ...experience,
            };
          }
        });

        if (new_order_item === {}) {
          new_order_item = order_item;
        }

        updated_order_items.push(new_order_item);

        if (order_item.item_type !== "plan") {
          orderDetails.push({
            ...db_order,
            order_items: updated_order_items,
          });
        }
      });
    });

    if (!db_orders) {
      return { success: false, details: "No orders found." };
    }

    return { success: true, details: orderDetails };
  } catch (error) {
    return { success: false, details: error.message };
  }
};

const getUserOrders = async (user_id) => {
  return await db
    .select("orders.*", "order_items.item_type", "order_items.quantity")
    .from("orders")
    .leftJoin("order_items", "orders.order_id", "order_items.order_id")
    .groupBy("orders.order_id")
    .groupBy("order_items.order_id")
    .having("order_by_user_id", "=", Number(user_id))
    .then((value) => {
      console.log(value);
      return { success: true, details: value };
    })
    .catch((reason) => {
      console.log(reason);
      return { success: false, details: reason };
    });
};

module.exports = {
  getOrderDetails,
  createOrder,
  getCartOrderDetails,
  createCartOrder,
  getAllUserOrders,
  getVendorSubscriptionDetails,
  getUserOrders,
  createFreeOrder,
};
