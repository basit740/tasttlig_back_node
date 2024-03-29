"use strict";

// Libraries
const router = require("express").Router();
const token_service = require("../../services/authentication/token");
const services_promotions = require("../../services/promotions/promotions");
const user_profile_service = require("../../services/profile/user_profile");
const authentication_service = require("../../services/authentication/authenticate_user");
const { generateRandomString } = require("../../functions/functions");

// POST services
router.post(
  "/promotions/add",
  token_service.authenticateToken,
  async (req, res) => {
    if (
      // !req.body.service_name ||
      // !req.body.service_nationality_id ||
      // !req.body.service_price ||
      !req.body.promotion_name ||
      !req.body.promotion_description ||
      (!req.body.promotion_discount_percentage &&
        !req.body.promotion_discount_price) ||
      !req.body.promotion_start_date ||
      !req.body.promotion_end_date
      //||
      //!req.body.service_festival_id ||
      // !req.body.service_creator_type
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

      let createdByAdmin = true;

      const business_details_from_db =
        await authentication_service.getUserByBusinessDetails(req.user.id);

      // if (
      //   user_details_from_db.user.role.includes("SPONSOR_PENDING") ||
      //   user_details_from_db.user.role.includes("SPONSOR")
      // ) {
      //   if (!business_details_from_db.success) {
      //     return res.status(403).json({
      //       success: false,
      //       message: business_details_from_db.message,
      //     });
      //   }

      //   createdByAdmin = false;
      // }

      let db_business_details = business_details_from_db.business_details;

      const promotion_information = {
        promotion_business_id: db_business_details.business_details_id,
        promotion_name: req.body.promotion_name,
        promotion_description: req.body.promotion_description,
        promotion_discount_percentage: req.body.promotion_discount_percentage,
        promotion_discount_price: req.body.promotion_discount_price,
        promotion_start_date_time: req.body.promotion_start_date,
        promotion_end_date_time: req.body.promotion_end_date,
        promotion_status: "ACTIVE",
      };
      const response = await services_promotions.createNewPromotion(
        user_details_from_db,
        promotion_information
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

//Get promotions from user
router.get("/promotions/user/:user_id", async (req, res) => {
  if (!req.params.user_id) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }
  try {
    const response = await services_promotions.getPromotionsByUser(
      req.params.user_id,
      req.query.keyword
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

router.delete("/promotions/delete/user/:user_id", async (req, res) => {
  if (!req.params.user_id) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }
  try {
    const response = await services_promotions.deletePromotionsOfUser(
      req.params.user_id,
      req.body.delete_items
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

router.put("/promotions/apply/product", async (req, res) => {
  // check if body is null, then no promotion/ products return error
  console.log(req.body);
  if (!req.body.promotion) {
    return res.status(200).json({
      success: false,
      message: "Please choose a promotion",
    });
  }
  if (!req.body.products || req.body.products.length == 0) {
    return res.status(200).json({
      success: false,
      message: "Please choose atleast one product",
    });
  }
  try {
    const response = await services_promotions.applyPromotionToProducts(
      req.body.promotion,
      req.body.products
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

router.put("/promotions/remove-from-product", async (req, res) => {
  // check if body is null, then no promotion/ products return error
  console.log(req.body);
  if (!req.body.products) {
    return res.status(200).json({
      success: false,
      message: "Please choose a promotion",
    });
  }
  if (!req.body.products || req.body.products.length == 0) {
    return res.status(200).json({
      success: false,
      message: "Please choose atleast one product",
    });
  }
  try {
    const response = await services_promotions.removePromotionFromProducts(
      req.body.products
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

router.put(
  "/promotion/update/:promotion_id",
  token_service.authenticateToken,
  async (req, res) => {
    if (!req.body) {
      return res.status(403).json({
        success: false,
        message: "Required parameters are not available in request.",
      });
    }

    try {
      // const user_details_from_db = await user_profile_service.getUserById(
      //   req.user.id
      // );

      // if (!user_details_from_db.success) {
      //   return res.status(403).json({
      //     success: false,
      //     message: user_details_from_db.message,
      //   });
      // }

      // let db_user = user_details_from_db.user;
      console.log(req.body);
      const response = await services_promotions.updatePromotion(req.body);
      console.log("update promo", response);
      return res.send(response);
    } catch (error) {
      res.send({
        success: false,
        message: "Error.",
        response: error.message,
      });
    }
  }
);

// fetch all deal promotion in database
router.get(
  "/promotion/deal/all",
  async (req, res) => {
    // if (!req.body) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Required parameters are not available in request.",
    //   });
    // }

    try {
      console.log(req.body);
      const response = await services_promotions.getAllDealPromotions(req.body);
      return res.send(response);
    } catch (error) {
      res.send({
        success: false,
        message: "Error.",
        response: error.message,
      });
    }
  }
);

module.exports = router;
