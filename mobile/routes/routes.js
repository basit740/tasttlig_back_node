"use strict";

// Libraries
const router = require("express").Router();
const token_service = require("../../services/authentication/token");
const user_profile_service = require("../../services/profile/user_profile");
const authenticate_user_service = require("../../services/authentication/authenticate_user");
const mobile_services = require("../services/services");

// POST service claim
router.post("/all-services-claim", async (req, res) => {
  if (!req.body.food_sample_claim_user || !req.body.food_sample_id) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }

  let db_user;
  let new_user = false;
  const claimed_total_quantity = req.body.claimed_total_quantity;

  db_user = await user_profile_service.getUserByPassportIdOrEmail(
    req.body.food_sample_claim_user
  );

  if (!db_user.success) {
    // Check if input is an email
    if (req.body.food_sample_claim_user.includes("@")) {
      db_user = await authenticate_user_service.createDummyUser(
        req.body.food_sample_claim_user
      );
      new_user = true;
    } else {
      res.send({
        success: false,
        message: "Entered Passport ID is invalid.",
      });
    }
  }

  db_user = db_user.user;

  try {
    if (!new_user) {
      const {
        canClaim,
        message,
        error,
      } = await mobile_services.userCanClaimService(
        db_user.email,
        req.body.food_sample_id
      );

      if (!canClaim) {
        return res.status(error ? 500 : 200).json({
          success: false,
          message,
          error,
        });
      }

      const user_details_from_db = await user_profile_service.getUserByEmailWithSubscription(
        db_user.email
      );

      if (!canClaim && !user_details_from_db.user.user_subscription_id) {
        return res.status(403).json({
          success: false,
          message:
            "Email not found for user subscription. Enter new email or buy a festival pass.",
        });
      }
    }
    const product_details_from_db = await mobile_services.findService(
      req.body.food_sample_id
    );

    if (!product_details_from_db.success) {
      return res.status(403).json({
        success: false,
        message: product_details_from_db.message,
      });
    }
    let db_all_products = product_details_from_db.details;
    const product_claim_details = {
      user_claim_email: db_user.email,
      claim_user_id: db_user.tasttlig_user_id,
      claimed_service_id: db_all_products.service_id,
      current_stamp_status: "Claimed",
      claimed_quantity: req.body.claimed_quantity,
      claim_viewable_id: req.body.claim_viewable_id,
      festival_name: req.body.foodsample_festival_name,
      reserved_on: new Date(),
      festival_id: req.body.festival_id,
    };
    const response = await mobile_services.createNewServiceClaim(
      db_user,
      db_all_products,
      claimed_total_quantity,
      product_claim_details
    );
    return res.send(response);
  } catch (error) {
    console.log("error", error);
    res.send({
      success: false,
      message:
        "Email not found for user subscription. Enter new email or buy a festival pass.",
      response: error,
    });
  }
});

router.get("/user/applications/:userId", async (req, res) => {
  try {
    const application = await mobile_services.getUserApplications(
      req.params.userId
    );

    return res.send(application);
  } catch (error) {
    console.log("err", error);
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

router.get("/user/attended-festival/:userId", async (req, res) => {
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
      dayOfWeek: req.query.dayOfWeek,
    };

    const response = await mobile_services.getAttendedFestivalsForUser(
      current_page,
      keyword,
      filters,
      req.params.userId
    );
    console.log("filter", filters);
    return res.send(response);
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});

router.get("/user/hosted-festival/:userId", async (req, res) => {
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
      dayOfWeek: req.query.dayOfWeek,
    };

    const response = await mobile_services.getHostedFestivalsForUser(
      current_page,
      keyword,
      filters,
      req.params.userId
    );
    console.log("filter", filters);
    return res.send(response);
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});

router.get("/business/revenue/:userId", async (req, res) => {
  try {
    const business_details_all = await user_profile_service.getBusinessDetailsByUserId(
      req.params.userId
    );
    if (!business_details_all.success) {
      return res.status(403).json({
        success: false,
        message: business_details_all.message,
      });
    }
    const product_revenue = await mobile_services.getBusinessProductRevenue(
      business_details_all.business_details_all.business_details_id
    );
    const service_revenue = await mobile_services.getBusinessServiceRevenue(
      business_details_all.business_details_all.business_details_id
    );
    const experience_revenue = await mobile_services.getBusinessExperienceRevenue(
      business_details_all.business_details_all.business_details_id
    );

    function sum(total, p) {
      return total + p;
    }

    const priceTotal = (item) => {
      return item.map((i) => Number(i.price_before_tax)).reduce(sum);
    };

    const product_revenue_total =
      product_revenue.revenue.length > 0
        ? priceTotal(product_revenue.revenue)
        : 0;
    const experience_revenue_total =
      experience_revenue.revenue.length > 0
        ? priceTotal(experience_revenue.revenue)
        : 0;
    const service_revenue_total =
      service_revenue.revenue.length > 0
        ? priceTotal(service_revenue.revenue)
        : 0;

    console.log("revenueprd", product_revenue_total);
    console.log("revenueexp", experience_revenue_total);
    console.log("revenuesrv", service_revenue_total);
    let revenue = {
      product: { product_revenue_total, product_revenue },
      service: { service_revenue_total, service_revenue },
      experience: { experience_revenue_total, experience_revenue },
      overall_revenue:
        product_revenue_total +
        service_revenue_total +
        experience_revenue_total,
      success: true,
    };
    return res.send(revenue);
  } catch (error) {
    console.log("err", error);
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

router.put("/mobile/product/update/", async (req, res) => {
  if (!req.body) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }

  try {
    const business_details_all = await user_profile_service.getBusinessDetailsByUserId(
      req.body.user_id
    );
    if (!business_details_all.success) {
      return res.status(403).json({
        success: false,
        message: business_details_all.message,
      });
    }

    let db_user = {
      user_id:
        business_details_all.business_details_all.business_details_user_id,
      business_id:
        business_details_all.business_details_all.business_details_id,
    };

    const response = await mobile_services.updateProduct(db_user, req.body);
    return res.send(response);
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});

router.put("/mobile/service/update/", async (req, res) => {
  if (!req.body) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }

  try {
    const business_details_all = await user_profile_service.getBusinessDetailsByUserId(
      req.body.user_id
    );
    if (!business_details_all.success) {
      return res.status(403).json({
        success: false,
        message: business_details_all.message,
      });
    }

    let db_user = {
      user_id:
        business_details_all.business_details_all.business_details_user_id,
      business_id:
        business_details_all.business_details_all.business_details_id,
    };

    const response = await mobile_services.updateService(db_user, req.body);
    return res.send(response);
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});

router.put("/mobile/experience/update/", async (req, res) => {
  if (!req.body) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }

  try {
    const business_details_all = await user_profile_service.getBusinessDetailsByUserId(
      req.body.user_id
    );
    if (!business_details_all.success) {
      return res.status(403).json({
        success: false,
        message: business_details_all.message,
      });
    }

    let db_user = {
      user_id:
        business_details_all.business_details_all.business_details_user_id,
      business_id:
        business_details_all.business_details_all.business_details_id,
    };

    const response = await mobile_services.updateExperience(db_user, req.body);
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
