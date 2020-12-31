"use strict";

// Libraries
const router = require("express").Router();
const menu_item_service = require("../../services/menu_items/menu_items");
const authentication_service = require("../../services/authentication/authenticate_user");
const user_profile_service = require("../../services/profile/user_profile");

// GET all menu items
router.get("/", async (req, res) => {
  try {
    const current_page = req.query.page || 1;
    const keyword = req.query.keyword || "";
    const status_operator = "=";
    const menu_item_status = "ACTIVE";

    const filters = {
      nationalities: req.query.nationalities,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      radius: req.query.radius,
      latitude: req.query.latitude,
      longitude: req.query.longitude,
    };

    const response = await menu_item_service.getAllMenuItems(
      status_operator,
      menu_item_status,
      keyword,
      current_page,
      filters
    );

    return res.send(response);
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});

// GET menu item by ID
router.get("/:id", async (req, res) => {
  if (!req.params.id) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }

  try {
    const response = await menu_item_service.getMenuItem(req.params.id);

    return res.send(response);
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});

// GET business name for menu items
router.get("/business/:business_name", async (req, res) => {
  try {
    const current_page = req.query.page || 1;
    const keyword = req.query.keyword || "";
    const status_operator = "=";
    const menu_item_status = "ACTIVE";

    const user = await authentication_service.findUserByBusinessName(
      req.params.business_name
    );

    if (!user.success) {
      res.send({
        success: false,
        message: "Error.",
        response: "Invalid business name.",
      });
    }

    const menu_items_response = await menu_item_service.getAllUserMenuItems(
      status_operator,
      menu_item_status,
      keyword,
      current_page,
      user.user.tasttlig_user_id
    );

    const db_menu_items = menu_items_response.details;

    return res.send({
      success: true,
      owner_user: user.user,
      menu_items: db_menu_items,
    });
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});

// GET menu item owner
router.get("/owner/:owner_id", async (req, res) => {
  try {
    const current_page = req.query.page || 1;
    const keyword = req.query.keyword || "";
    const status_operator = "=";
    const menu_item_status = "ACTIVE";

    const user = await user_profile_service.getUserById(req.params.owner_id);

    if (!user.success) {
      res.send({
        success: false,
        message: "Error.",
        response: "Invalid business name.",
      });
    }

    const menu_items_response = await menu_item_service.getAllUserMenuItems(
      status_operator,
      menu_item_status,
      keyword,
      current_page,
      req.params.owner_id
    );

    const db_menu_items = menu_items_response.details;

    return res.send({
      success: true,
      owner_user: user.user,
      menu_items: db_menu_items,
    });
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});

// GET nationalities for menu items
router.get("/nationalities", async (req, res) => {
  try {
    const status_operator = "=";
    const menu_item_status = "ACTIVE";

    const response = await menu_item_service.getDistinctNationalities(
      status_operator,
      menu_item_status
    );

    return res.send(response);
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});

module.exports = router;
