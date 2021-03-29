"use strict";

// Libraries
const { db } = require("../../db/db-config");

const getAllUserOrders = async (user_id) => {
  let query = db
    .select(
      "orders.*",
      "order_items.*",
      "products.title",
      "services.service_name",
      "f1.festival_name AS product_festival",
      "f2.festival_name AS service_festival"
    )
    .from("order_items")
    .leftJoin("orders", "order_items.order_id", "orders.order_id")
    .leftJoin(
      "products",
      db.raw("CAST(order_items.item_id AS INT)"),
      "products.product_id"
    )
    .leftJoin(
      "services",
      db.raw("CAST(order_items.item_id AS INT)"),
      "services.service_id"
    )
    .leftJoin(
      "festivals AS f1",
      "products.festival_selected[1]",
      "f1.festival_id"
    )
    .leftJoin(
      "festivals AS f2",
      "services.festivals_selected[1]",
      "f2.festival_id"
    )
    .groupBy(
      "orders.*",
      "order_items.*",
      "orders.order_id",
      "order_items.order_id",
      "order_items.order_item_id",
      "products.product_id",
      "products.title",
      "products.festival_selected[1]",
      "services.service_id",
      "services.service_name",
      "services.festivals_selected[1]",
      "f1.festival_name",
      "f2.festival_name",
      "f1.festival_id",
      "f2.festival_id"
    )
    .where("orders.order_by_user_id", "=", user_id)
    .andWhere(function () {
      this.where("order_items.item_type", "product").orWhere(
        "order_items.item_type",
        "service"
      ).orWhere(
        "order_items.item_type",
        "festival"
      );;
      //.orWhere("order_items.subscription_code", "S_C3")
    });

  return await query
    .then((value) => {
      console.log(value);
      return { success: true, details: value };
    })
    .catch((reason) => {
      console.log(reason);
      return { success: false, details: reason };
    });
};
const getAllCurrentOrders = async (user_id) => {
  let query = db
    .select(
      "orders.*",
      "order_items.*",
      "products.title",
      "services.service_name",
      "f1.festival_name AS product_festival",
      "f2.festival_name AS service_festival"
    )
    .from("order_items")
    .leftJoin("orders", "order_items.order_id", "orders.order_id")
    .leftJoin(
      "products",
      db.raw("CAST(order_items.item_id AS INT)"),
      "products.product_id"
    )
    .leftJoin(
      "services",
      db.raw("CAST(order_items.item_id AS INT)"),
      "services.service_id"
    )
    .leftJoin(
      "festivals AS f1",
      "products.festival_selected[1]",
      "f1.festival_id"
    )
    .leftJoin(
      "festivals AS f2",
      "services.festivals_selected[1]",
      "f2.festival_id"
    )
    .groupBy(
      "orders.*",
      "order_items.*",
      "orders.order_id",
      "order_items.order_id",
      "order_items.order_item_id",
      "products.product_id",
      "products.title",
      "products.festival_selected[1]",
      "services.service_id",
      "services.service_name",
      "services.festivals_selected[1]",
      "f1.festival_name",
      "f2.festival_name",
      "f1.festival_id",
      "f2.festival_id"
    )
    .andWhere(function () {
      this.where("products.product_user_id", user_id).orWhere(
        "services.service_user_id",
        user_id
      );
    })
    //.where("products.product_user_id", "=", user_id)
    //.orWhere("services.service_user_id", "=", user_id )
    .andWhere(function () {
      this.where("order_items.item_type", "product").orWhere(
        "order_items.item_type",
        "service"
      );
      //.orWhere("order_items.subscription_code", "S_C3")
    });

  return await query
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
  getAllUserOrders,
  getAllCurrentOrders,
};
