"use strict";

// Libraries
const { db } = require("../../db/db-config");
const Orders = require("../../models/orders");
const Experiences = require("../../models/Experiences");
const point_system_service = require("../profile/points_system");
const Mailer = require("../email/nodemailer").nodemailer_transporter;
const moment = require("moment");
const _ = require("lodash");

// Environment variables
const ADMIN_EMAIL = process.env.TASTTLIG_ADMIN_EMAIL;

// Get order details helper function
const getOrderDetails = async (order_details) => {
  if (
    order_details.item_type === "plan" ||
    order_details.item_type === "subscription"
  ) {
    return await db("subscriptions")
      .where({
        subscription_code: order_details.item_id,
        status: "ACTIVE",
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
  } else if (order_details.item_type === "food_sample") {
    return await db("food_samples")
      .where({
        food_sample_id: order_details.item_id,
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
  } else if (order_details.item_type === "experience") {
    return await db("experiences")
      .where({
        experience_id: order_details.item_id,
        status: "ACTIVE",
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
  } else if (order_details.item_type === "festival") {
    return await db("festivals")
    .where({
      festival_id: order_details.item_id
    })
    .first()
    .then((value) => {
      if (!value) {
        return { success: false, message: "No festival found" };
      }
      return { success: true, item: value };
    })
    .catch ((error) => {
      return { success: false, message: error};
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
const createOrder = async (order_details, db_order_details) => {
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
      });

      const membership_plan_name = _.startCase(order_details.item_id);

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

      return { success: true, details: "Success." };
    } catch (error) {
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
  } else if (order_details.item_type === "experience") {
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

        await trx("experience_guests").insert({
          experience_id: db_order_details.item.experience_id,
          guest_user_id: order_details.user_id,
          status: "CONFIRMED",
          created_at_datetime: new Date(),
          updated_at_datetime: new Date(),
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
          title: db_order_details.item.title,
          passport_id: order_details.user_passport_id,
          items: [
            {
              title: db_order_details.item.title,
              time:
                moment(
                  moment(
                    new Date(db_order_details.item.start_date)
                      .toISOString()
                      .split("T")[0] +
                      "T" +
                      db_order_details.item.start_time +
                      ".000Z"
                  ).add(new Date().getTimezoneOffset(), "m")
                ).format("MMM Do") +
                " " +
                moment(
                  moment(
                    new Date(db_order_details.item.start_date)
                      .toISOString()
                      .split("T")[0] +
                      "T" +
                      db_order_details.item.start_time +
                      ".000Z"
                  ).add(new Date().getTimezoneOffset(), "m")
                ).format("hh:mm a") +
                " - " +
                moment(
                  moment(
                    new Date(db_order_details.item.start_date)
                      .toISOString()
                      .split("T")[0] +
                      "T" +
                      db_order_details.item.end_time +
                      ".000Z"
                  ).add(new Date().getTimezoneOffset(), "m")
                ).format("hh:mm a"),
              address:
                db_order_details.item.address +
                ", " +
                db_order_details.item.city +
                ", " +
                db_order_details.item.state,
              quantity: 1,
            },
          ],
        },
      });

      return { success: true, details: "Success." };
    } catch (error) {
      return { success: false, details: error.message };
    }
  } else if (order_details.item_type === "festival") {
    try {
      await db.transaction(async (trx) => {
        const total_amount_before_tax = parseFloat(db_order_details.item.festival_price);
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
      // Email to user on successful purchase
      await Mailer.sendMail({
        from: process.env.SES_DEFAULT_FROM,
        to: order_details.user_email,
        bcc: ADMIN_EMAIL,
        subject: "[Tasttlig] Purchase Successful",
        template: "experience/new_experience_purchase",
        context: {
          title: db_order_details.item.festival_name,
          passport_id: order_details.user_passport_id,
          items: [
            {
              title: db_order_details.item.festival_name,
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
                ).format("MMM Do") +
                " " +
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
              address:
                db_order_details.item.festival_city,
              quantity: 1,
            },
          ],
        },
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
    // const db_orders = await db("orders")
    //   .leftJoin(
    //     "order_items",
    //     "orders.order_id",
    //     "order_items.order_id"
    //   )
    //   .leftJoin(
    //     "payments",
    //     "orders.order_id",
    //     "payments.order_id"
    //   )
    //   .where({
    //     order_by_user_id: user_id
    //   })
    //   .returning("*");
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

module.exports = {
  getOrderDetails,
  createOrder,
  getCartOrderDetails,
  createCartOrder,
  getAllUserOrders,
};
