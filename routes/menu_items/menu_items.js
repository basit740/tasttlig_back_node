"use strict";

const router = require('express').Router();
const menu_item_service = require("../../services/menu_items/menu_items")

router.get("/", async (req, res) => {
  try {
    const current_page = req.query.page || 1;
    const keyword = req.query.keyword || ""
    const status_operator = "=";
    const menu_item_status = "ACTIVE";

    const filters = {
      nationalities: req.query.nationalities,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      radius: req.query.radius,
      latitude: req.query.latitude,
      longitude: req.query.longitude
    }

    const response = await menu_item_service.getAllMenuItems(
      status_operator,
      menu_item_status,
      keyword,
      current_page,
      filters)

    return res.send(response);
  } catch (err) {
    res.send({
      success: false,
      message: "error",
      response: err.message
    });
  }
});

router.get("/:id",
  async (req, res) => {
    if (!req.params.id) {
      return res.status(403).json({
        success: false,
        message: "Required parameters are not available in request."
      });
    }
    try {
      const response = await menu_item_service.getMenuItem(req.params.id);
      return res.send(response);
    } catch (err) {
      res.send({
        success: false,
        message: "error",
        response: err.message
      });
    }
  })

router.get("/nationalities", async (req, res) => {
  try {
    const status_operator = "=";
    const menu_item_status = "ACTIVE";

    const response = await menu_item_service.getDistinctNationalities(
      status_operator,
      menu_item_status);

    return res.send(response);
  } catch (e) {
    res.send({
      success: false,
      message: "error",
      response: e.message
    });
  }
});

module.exports = router;