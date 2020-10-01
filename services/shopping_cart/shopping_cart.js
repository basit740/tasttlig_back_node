"use strict";

const {db} = require("../../db/db-config");
const Mailer = require("../email/nodemailer").nodemailer_transporter;
const user_role_manager = require("../profile/user_roles_manager");
const jwt = require("jsonwebtoken");
const {setAddressCoordinates} = require("../geocoder");

const ADMIN_EMAIL = process.env.TASTTLIG_ADMIN_EMAIL;
const SITE_BASE = process.env.SITE_BASE;

const getCart = async(user_id) => {
  return await db("carts")
    .where("carts.user_id", user_id)
    .leftJoin(
      "cart_items",
      "carts.cart_id",
      "cart_items.cart_id"
    )
    .then(value => {
      return {success: true, nationalities: value};
    })
    .catch(err => {
      return {success: false, details: err};
    });
}

const createCart = async(user_id) => {
  return await db("carts")
    .insert({
      user_id: user_id,
      status: "SUCCESS",
      created_at: new Date(),
      updated_at: new Date()
    })
    .returning("*")
    .then(cart => {
      return {success: true, details: cart};
    })
    .catch(err => {
      return {success: false, details: err};
    });
}

const addCartItem = async(
  cart_id,
  item_type,
  item_id,
  quantity
) => {
  return await db("cart_items")
    .insert({
      cart_id: cart_id,
      status: "SUCCESS",
      item_type: item_type,
      item_id: item_id,
      quantity: quantity,
      created_at: new Date(),
      updated_at: new Date()
    })
    .then(() => {
      return {success: true};
    })
    .catch(err => {
      return {success: false, details: err};
    });
}

const updateCart = async (
  cart_id,
  item_type,
  item_id,
  quantity) => {
  return await db("cart_items")
    .where({
      cart_id: cart_id,
      experience_creator_user_id: db_user.tasttlig_user_id
    })
    .update(experience_update_data)
    .then(() => {
      return {success: true};
    }).catch(reason => {
      return {success: false, details:reason};
    });
}

module.exports = {
  getCart,
  createCart,
  addCartItem,
  updateCart
}