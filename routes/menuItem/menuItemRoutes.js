"use strict";

// Libraries
const menuItemRouter = require("express").Router();
const auth = require("../auth/authFunctions");
const MenuItem = require("../../db/queries/menu_item/menu_item");
const { authenticateToken } = auth;

// GET all menu items
menuItemRouter.get("/menu-items", async (req, res) => {
  const menuItems = await MenuItem.getAllMenuItem();
  res.json(menuItems);
});

// GET all menu items based on advertiser ID
menuItemRouter.get("/menu-items/user", authenticateToken, async (req, res) => {
  const menuItems = await MenuItem.getUserMenuItem(req.user.id);
  res.json(menuItems);
});

// POST menu item
menuItemRouter.post("/menu-items", authenticateToken, async (req, res) => {
  const menuItem = {
    menu_item_img_url: req.body.menu_item_img_url,
    name: req.body.name,
    price: req.body.price,
    quantity: req.body.quantity,
    vegetarian: req.body.vegetarian,
    vegan: req.body.vegan,
    gluten_free: req.body.gluten_free,
    halal: req.body.halal,
    spice_level: req.body.spice_level,
    description: req.body.description,
    tray: req.body.tray,
    napkin: req.body.napkin,
    table: req.body.table,
    table_cloth: req.body.table_cloth,
    decoration: req.body.decoration,
    vending: req.body.vending,
    clean_up: req.body.clean_up,
    event_planning: req.body.event_planning,
    event_design: req.body.event_design,
    event_production: req.body.event_production,
    discount: req.body.discount,
    menu_item_code: req.body.menu_item_code,
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    phone_number: req.body.phone_number,
    food_handler_certificate: req.body.food_handler_certificate,
    date_of_issue: req.body.date_of_issue,
    expiry_date: req.body.expiry_date,
    verified: req.body.verified,
    profile_img_url: req.body.profile_img_url,
    business_street_address: req.body.business_street_address,
    business_city: req.body.business_city,
    business_province_territory: req.body.business_province_territory,
    business_postal_code: req.body.business_postal_code,
    facebook: req.body.facebook,
    twitter: req.body.twitter,
    instagram: req.body.instagram,
    youtube: req.body.youtube,
    linkedin: req.body.linkedin,
    website: req.body.website,
    bio: req.body.bio
  };

  try {
    const menuItems = await MenuItem.createMenuItem(menuItem, req.user.id);
    res.json(menuItems);
  } catch (err) {
    res.json(err);
  }
});

// PUT menu items from advertiser for quantity
menuItemRouter.put("/menu-items/quantity/:id", async (req, res) => {
  const menuItem = {
    quantity: req.body.quantity
  };

  try {
    const menuItems = await MenuItem.updateMenuItemQuantity(
      menuItem,
      req.params.id
    );
    res.json(menuItems);
  } catch (err) {
    console.log("Update Menu Item Quantity", err);
  }
});

// PUT menu items feedback from advertiser public or private (global)
menuItemRouter.put(
  "/menu-items/feedback-public-global/:id",
  async (req, res) => {
    const menuItem = {
      feedback_public_global: req.body.feedback_public_global,
      feedback_public_local: req.body.feedback_public_local
    };

    try {
      const menuItems = await MenuItem.updateMenuItemFeedbackPublicGlobal(
        menuItem,
        req.params.id
      );
      res.json(menuItems);
    } catch (err) {
      console.log("Update Menu Item Feedback Public (Global)", err);
    }
  }
);

// PUT menu items feedback from advertiser public or private (local)
menuItemRouter.put(
  "/menu-items/feedback-public-local/:id",
  async (req, res) => {
    const menuItem = {
      feedback_public_local: req.body.feedback_public_local
    };

    try {
      const menuItems = await MenuItem.updateMenuItemFeedbackPublicLocal(
        menuItem,
        req.params.id
      );
      res.json(menuItems);
    } catch (err) {
      console.log("Update Menu Item Feedback Public (Local)", err);
    }
  }
);

// DELETE menu items from admin
menuItemRouter.delete("/menu-items/:id", async (req, res) => {
  try {
    const returning = await MenuItem.deleteMenuItem(req.params.id);
    res.send({
      success: true,
      message: "ok",
      response: returning
    });
  } catch (err) {
    res.send({
      success: false,
      message: "error",
      response: err
    });
  }
});

module.exports = menuItemRouter;
