"use strict";

// Libraries
const router = require("express").Router();
const token_service = require("../../services/authentication/token");
const user_profile_service = require("../../services/profile/user_profile");
const authenticate_user_service = require("../../services/authentication/authenticate_user");
const point_system_service = require("../../services/profile/points_system");
const menu_item_service = require("../../services/menu_items/menu_items");

// GET user by ID
router.get("/user", token_service.authenticateToken, async (req, res) => {
  const response = await user_profile_service.getUserBySubscriptionId(
    req.user.id
  );

  if (!response.success) {
    return res.status(403).json({
      success: false,
      message: response.message,
    });
  }

  const points_total = await point_system_service.getUserPoints(
    response.user.tasttlig_user_id
  );

  let user = {
    id: response.user.tasttlig_user_id,
    first_name: response.user.first_name,
    last_name: response.user.last_name,
    email: response.user.email,
    phone_number: response.user.phone_number,
    role: response.user.role,
    profile_image_link: response.user.profile_image_link,
    banner_image_link: response.user.banner_image_link,
    bio: response.user.bio_text,
    profile_tag_line: response.user.profile_tag_line,
    address_line_1: response.user.user_address_line_1,
    address_line_2: response.user.user_address_line_2,
    city: response.user.user_city,
    postal_code: response.user.user_zip_postal_code,
    state: response.user.user_state,
    address_type: response.user.address_type,
    business_name: response.user.business_name,
    business_type: response.user.business_type,
    profile_status: response.user.profile_status,
    subscription_code: response.user.subscription_code,
    verified: response.user.is_email_verified,
    passport_id: response.user.passport_id,
    points: points_total.data[0].sum ? points_total.data[0].sum : 0,
  };

  res.status(200).json({
    success: true,
    user,
  });
});

const extractBusinessInfo = (user_details_from_db, requestBody) => {
  return {
    user_id: user_details_from_db.user.tasttlig_user_id,
    business_name: requestBody.business_name,
    business_type: requestBody.business_type,
    ethnicity_of_restaurant: requestBody.culture,
    business_address_1: requestBody.address_line_1,
    business_address_2: requestBody.address_line_2,
    city: requestBody.business_city,
    state: requestBody.state,
    postal_code: requestBody.postal_code,
    country: requestBody.country,
    phone_number: requestBody.phone_number,
    business_registration_number: requestBody.registration_number,
    instagram: requestBody.instagram,
    facebook: requestBody.facebook,
  };
};

const extractFile = (requestBody, key, text) => {
  return {
    document_type: text,
    issue_date: new Date(requestBody[`${key}_date_of_issue`]),
    expiry_date: new Date(requestBody[`${key}_date_of_expired`]),
    document_link: requestBody.food_handler_certificate,
    status: "Pending",
  };
};

// POST application from multi-step form
router.post("/user/host", async (req, res) => {
  try {
    const hostDto = req.body;
    const response = await user_profile_service.saveHostApplication(
      hostDto,
      req.user
    );

    if (response.success) {
      return res.send(response);
    }

    return res.status(500).send(response);
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: error,
    });
  }
});

router.get("/user/application/:token", async (req, res) => {
  if (!req.params.token) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }

  const response = await user_profile_service.handleAction(req.params.token);

  return res.send(response);
});

router.put("/user/update-account/:id", async (req, res) => {
  try {
    const user = {
      id: req.params.id,
      profile_image_link: req.body.profile_image_link,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      phone_number: req.body.phone_number,
      profile_tag_line: req.body.profile_tag_line,
      bio_text: req.body.bio_text,
      banner_image_link: req.body.banner_image_link,
    };

    const response = await user_profile_service.updateUserAccount(user);

    if (response.success) {
      res.status(200).send(response);
    } else {
      return res.status(401).json({
        success: false,
        message: "Email already exists.",
      });
    }
  } catch (error) {
    console.log("Update", error);
  }
});

router.put("/user/update-profile/:id", async (req, res) => {
  try {
    const user = {
      id: req.params.id,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      phone_number: req.body.phone_number,
      address_line_1: req.body.address_line_1,
      address_line_2: req.body.address_line_2,
      city: req.body.city,
      state: req.body.state,
      postal_code: req.body.postal_code,
      country: "Canada",
      address_type: req.body.address_type,
      business_name: req.body.business_name,
      business_type: req.body.business_type,
      profile_status: req.body.profile_status,
    };

    const response = await user_profile_service.updateUserProfile(user);

    if (response.success) {
      res.status(200).send(response);
    } else {
      return res.status(401).json({
        success: false,
        message: "Email already exists.",
      });
    }
  } catch (error) {
    console.log("Update", error);
  }
});

// // update user preferences
// router.put("/user/update-preferences/:id", async (req, res) => {
//   try {

//     const user = {
//       id: req.params.id,
//       user_preference: req.body.user_preference
//     }
//     const response = await user_profile_service.updateUserPreferences(user)

//     console.log("update preferences log")
//     if (response.success) {
//       res.status(200).send(response);
//     } else {
//       return res.status(401).json({
//         success: false,
//         message: "Failed to update preferences",
//       });
//     }

//   } catch (error) {
//     console.log("Update", error);
//   }
// });

// GET user by email
router.get("/user/check-email/:email", async (req, res) => {
  try {
    const result = await user_profile_service.getUserByEmail(req.params.email);

    if (result.success) {
      const {
        success,
        user: { tasttlig_user_id, email },
      } = result;

      return res.send({ success, user: { tasttlig_user_id, email } });
    } else {
      return res.send({ success: false });
    }
  } catch (error) {
    res.status(500).send({ success: false, message: error });
  }
});

// PUT menu item from user
router.put("/user/updateMenuItem", async (req, res) => {
  try {
    const db_user = await authenticate_user_service.findUserByEmail(
      req.body.email
    );

    if (!db_user.success) {
      return res.status(403).json({
        success: false,
        message: "User does not exist.",
      });
    }

    let menuItems = req.body;
    delete menuItems.email;
    menuItems = Object.values(menuItems);

    const response = await user_profile_service.saveMenuItems(
      db_user.user,
      menuItems
    );

    res.send(response);
  } catch (error) {
    res.status(500).send({ success: false, message: error });
  }
});

// POST menu items from user
router.post("/user/addMenuItems", async (req, res) => {
  try {
    const user_details_from_db = await authenticate_user_service.findUserByEmail(
      req.body.email
    );

    if (!user_details_from_db.success) {
      return res.status(403).json({
        success: false,
        message: "User does not exist.",
      });
    }

    let db_user = user_details_from_db.user;
    let menuItems = req.body.menu_list;

    const response = await user_profile_service.saveMenuItems(
      db_user,
      menuItems,
      false
    );

    res.send(response);
  } catch (error) {
    res.status(500).send({ success: false, message: error });
  }
});

// PUT assets from user
router.put("/user/updateAssets", async (req, res) => {
  try {
    const db_user = await authenticate_user_service.findUserByEmail(
      req.body.email
    );

    if (!db_user.success) {
      return res.status(403).json({
        success: false,
        message: "User does not exist.",
      });
    }

    let assets = req.body;
    delete assets.email;
    assets = Object.values(assets);

    const response = await user_profile_service.saveAssets(
      db_user.user,
      assets
    );

    res.send(response);
  } catch (error) {
    res.status(500).send({ success: false, message: error });
  }
});

// PUT services from user
router.put("/user/updateServices", async (req, res) => {
  try {
    const db_user = await authenticate_user_service.findUserByEmail(
      req.body.email
    );

    if (!db_user.success) {
      return res.status(403).json({
        success: false,
        message: "User does not exist.",
      });
    }

    let services = req.body;
    delete services.email;
    services = Object.values(services);

    const response = await user_profile_service.saveBusinessServices(
      db_user.user,
      services
    );

    res.send(response);
  } catch (error) {
    res.status(500).send({ success: false, message: error });
  }
});

// PUT entertainers from user
router.put("/user/updateEntertainersProduct", async (req, res) => {
  try {
    const db_user = await authenticate_user_service.findUserByEmail(
      req.body.email
    );

    if (!db_user.success) {
      return res.status(403).json({
        success: false,
        message: "User does not exist.",
      });
    }

    let sample_links = req.body;
    delete sample_links.email;
    sample_links = Object.values(sample_links);

    const response = await user_profile_service.saveSampleLinks(
      db_user.user,
      sample_links
    );

    res.send(response);
  } catch (error) {
    res.status(500).send({ success: false, message: error });
  }
});

// PUT venues from user
router.put("/user/updateVenuesProduct", async (req, res) => {
  try {
    const db_user = await authenticate_user_service.findUserByEmail(
      req.body.email
    );

    if (!db_user.success) {
      return res.status(403).json({
        success: false,
        message: "User does not exist.",
      });
    }

    const response = await user_profile_service.saveVenueInformation(
      db_user.user,
      req.body.venue_name,
      req.body.venue_description,
      req.body.venue_photos
    );

    res.send(response);
  } catch (error) {
    res.status(500).send({ success: false, message: error });
  }
});

// PUT documents from user
router.put("/user/updateDocuments", async (req, res) => {
  try {
    const db_user = await authenticate_user_service.findUserByEmail(
      req.body.email
    );

    if (!db_user.success) {
      return res.status(403).json({
        success: false,
        message: "User does not exist.",
      });
    }

    const response = await user_profile_service.saveDocuments(
      db_user.user,
      req.body
    );

    res.send(response);
  } catch (error) {
    res.status(500).send({ success: false, message: error });
  }
});

// PUT social proof from user
router.put("/user/updateSocialProof", async (req, res) => {
  try {
    const db_user = await authenticate_user_service.findUserByEmail(
      req.body.email
    );

    if (!db_user.success) {
      return res.status(403).json({
        success: false,
        message: "User does not exist.",
      });
    }

    const response = await user_profile_service.saveSocialProof(
      db_user.user,
      req.body
    );

    res.send(response);
  } catch (error) {
    res.status(500).send({ success: false, message: error });
  }
});

// PUT payment information from user
router.put("/user/updatePaymentInfo", async (req, res) => {
  try {
    const db_user = await authenticate_user_service.findUserByEmail(
      req.body.email
    );

    if (!db_user.success) {
      return res.status(403).json({
        success: false,
        message: "User does not exist.",
      });
    }

    const response = await user_profile_service.savePaymentInformation(
      db_user.user,
      req.body
    );

    res.send(response);
  } catch (error) {
    res.status(500).send({ success: false, message: error });
  }
});

// PUT residential information from user
router.put("/user/updateResidentialAddressInfo", async (req, res) => {
  try {
    const db_user = await authenticate_user_service.findUserByEmail(
      req.body.email
    );

    if (!db_user.success) {
      return res.status(403).json({
        success: false,
        message: "User does not exist.",
      });
    }

    let user = {
      ...db_user.user,
      id: db_user.user.tasttlig_user_id,
      address_line_1: req.body.residential_address_line_1,
      address_line_2: req.body.residential_address_line_2,
      city: req.body.residential_city,
      postal_code: req.body.residential_postal_code,
      state: req.body.residential_state,
    };

    const response = await user_profile_service.updateUserProfile(user);

    res.send(response);
  } catch (error) {
    res.status(500).send({ success: false, message: error });
  }
});

// GET user menu items
router.get(
  "/menu-item/user/all",
  token_service.authenticateToken,
  async (req, res) => {
    try {
      const current_page = req.query.page || 1;
      const keyword = req.query.keyword || "";
      const status_operator = "=";
      const menu_item_status = "ACTIVE";

      const user_details_from_db = await user_profile_service.getUserById(
        req.user.id
      );

      if (!user_details_from_db.success) {
        return res.status(403).json({
          success: false,
          message: user_details_from_db.message,
        });
      }

      let requestByAdmin = false;
      let db_user = user_details_from_db.user;
      let user_role_object = db_user.role;

      if (user_role_object.includes("ADMIN")) {
        requestByAdmin = true;
      }

      const response = await menu_item_service.getAllUserMenuItems(
        status_operator,
        menu_item_status,
        keyword,
        current_page,
        req.user.id,
        requestByAdmin
      );

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
