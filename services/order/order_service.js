"use strict";

// Libraries
const {db} = require("../../db/db-config");
const {retrieveOrderItem} = require("./order_item_retriever");
const Orders = require("../../models/orders")

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
      this.where("order_items.item_type", "product")
        .orWhere("order_items.item_type", "service")
        .orWhere("order_items.item_type", "festival");
      //.orWhere("order_items.subscription_code", "S_C3")
    });

  return await query
    .then((value) => {
      console.log(value);
      return {success: true, details: value};
    })
    .catch((reason) => {
      console.log(reason);
      return {success: false, details: reason};
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
    .leftJoin(
      "business_details",
      "business_details.business_details_id",
      "products.product_business_id"
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
      this.where("business_details.business_details_user_id", user_id).orWhere(
        "services.service_user_id",
        user_id
      );
    })
    //.where("business_details.business_details_user_id", "=", user_id)
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
      return {success: true, details: value};
    })
    .catch((reason) => {
      console.log(reason);
      return {success: false, details: reason};
    });
};

const createOrder = async (checkoutItems, user) => {
  const orderItems = [], details = [];

  for (const {itemType, itemId, quantity} of checkoutItems) {
    const item = await retrieveOrderItem(itemType, itemId);
    if (!item) {
      throw {status: 404, message: `Item of type ${itemType} with id ${itemId} was not found`};
    }
    details.push(`${quantity} X ${item.details}`);
    orderItems.push({
      item_id: itemId,
      item_type: itemType,
      quantity: parseInt(quantity),
      price_before_tax: parseFloat(item.amount) * parseInt(quantity)
    })
  }

  const {preTaxTotal, checkoutTotal, taxTotal} = calculateTotals(orderItems);
  return Orders.query().insertGraphAndFetch({
    email: user.email,
    name: `${user.first_name} ${user.last_name}`,
    order_by_user_id: user.id,
    status: Orders.Status.Incomplete,
    order_datetime: new Date(),
    total_amount_before_tax: preTaxTotal,
    total_tax: taxTotal,
    total_amount_after_tax: checkoutTotal,
    details: details.join(", "),
    order_items: orderItems
  });
}

const getOrderForPaymentIntent = async (intentId) => {
  return Orders.query().findOne({reference_id: intentId});
}

function calculateTotals(orderItems) {
  const preTaxTotal = orderItems.map(i => i.price_before_tax).reduce((a, b) => a + b)
  const taxTotal = calculateTax(preTaxTotal);
  const checkoutTotal = preTaxTotal + taxTotal;
  return {preTaxTotal, checkoutTotal, taxTotal};
}

function calculateTax(amount) {
  //TODO: apply tax logic here
  const taxRate = 0;
  return amount * taxRate;
}

module.exports = {
  getAllUserOrders,
  getAllCurrentOrders,
  createOrder,
  getOrderForPaymentIntent
};
