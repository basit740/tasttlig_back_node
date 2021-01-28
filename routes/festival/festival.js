"use strict";

// Libraries
const router = require("express").Router();
const token_service = require("../../services/authentication/token");
const festival_service = require("../../services/festival/festival");
const user_profile_service = require("../../services/profile/user_profile");

// GET all festivals
router.get("/festival/all", async (req, res) => {
  try {
    const current_page = req.query.page || 1;
    const keyword = req.query.keyword || "";

    const filters = {
      nationalities: req.query.nationalities,
      startDate: req.query.startDate,
      startTime: new Date(req.query.startTime).getTime(),
      cityLocation: req.query.cityLocation,
      radius: req.query.radius,
      latitude: req.query.latitude,
      longitude: req.query.longitude,
    };

    const response = await festival_service.getAllFestivals(
      current_page,
      keyword,
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

// GET festival list
router.get("/festival-list", async (req, res) => {
  try {
    const response = await festival_service.getFestivalList();
    console.log(response);
    return res.send(response);
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});

// POST festival
router.post(
  "/festival/add",
  token_service.authenticateToken,
  async (req, res) => {
    const {
      images,
      festival_name,
      festival_type,
      festival_price,
      festival_city,
      festival_start_date,
      festival_end_date,
      festival_start_time,
      festival_end_time,
      festival_description,
    } = req.body;

    try {
      if (
        !images ||
        !festival_name ||
        !festival_type ||
        !festival_price ||
        !festival_city ||
        !festival_start_date ||
        !festival_end_date ||
        !festival_start_time ||
        !festival_end_time ||
        !festival_description
      ) {
        return res.status(403).json({
          success: false,
          message: "Required parameters are not available in request.",
        });
      }

      try {
        const user_details_from_db = await user_profile_service.getUserById(
          req.user.id
        );

        if (!user_details_from_db.success) {
          return res.status(403).json({
            success: false,
            message: user_details_from_db.message,
          });
        }

        const festival_details = {
          festival_user_admin_id: [req.user.id],
          festival_name,
          festival_type,
          festival_price,
          festival_city,
          festival_start_date: festival_start_date.substring(0, 10),
          festival_end_date: festival_end_date.substring(0, 10),
          festival_start_time,
          festival_end_time,
          festival_description,
          festival_created_at_datetime: new Date(),
          festival_updated_at_datetime: new Date(),
        };

        const response = await festival_service.createNewFestival(
          festival_details,
          images
        );

        return res.send(response);
      } catch (error) {
        res.send({
          success: false,
          message: "Error.",
          response: error,
        });
      }
    } catch (error) {
      res.send({
        success: false,
        message: "Error.",
        response: error,
      });
    }
  }
);

// POST host to festival
router.post(
  "/host-festival",
  token_service.authenticateToken,
  async (req, res) => {
    const { festival_id, festival_restaurant_host_id } = req.body;

    try {
      const user_details_from_db = await user_profile_service.getUserById(
        req.user.id
      );

      if (!user_details_from_db.success) {
        return res.status(403).json({
          success: false,
          message: user_details_from_db.message,
        });
      }

      const response = await festival_service.hostToFestival(
        festival_id,
        festival_restaurant_host_id
      );

      return res.send(response);
    } catch (error) {
      res.send({
        success: false,
        message: "Error.",
        response: error,
      });
    }
  }
);

// POST sponsor to festival
router.post(
  "/sponsor-festival",
  token_service.authenticateToken,
  async (req, res) => {
    const { festival_id, festival_business_sponsor_id } = req.body;

    try {
      const user_details_from_db = await user_profile_service.getUserById(
        req.user.id
      );

      if (!user_details_from_db.success) {
        return res.status(403).json({
          success: false,
          message: user_details_from_db.message,
        });
      }

      const response = await festival_service.sponsorToFestival(
        festival_id,
        festival_business_sponsor_id
      );

      return res.send(response);
    } catch (error) {
      res.send({
        success: false,
        message: "Error.",
        response: error,
      });
    }
  }
);

module.exports = router;
