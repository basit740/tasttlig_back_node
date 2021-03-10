"use strict";

// Libraries
const router = require("express").Router();
const token_service = require("../../services/authentication/token");
const user_profile_service = require("../../services/profile/user_profile");
const authenticate_user_service = require("../../services/authentication/authenticate_user");
const point_system_service = require("../../services/profile/points_system");
const menu_item_service = require("../../services/menu_items/menu_items");
const authentication_service = require("../../services/authentication/authenticate_user");

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

  console.log("check user obj >>>> yerrrrr >>>>", response.user);

  let user = {
    id: response.user.tasttlig_user_id,
    first_name: response.user.first_name,
    last_name: response.user.last_name,
    email: response.user.email,
    phone_number: response.user.phone_number,
    age: response.user.age,
    role: response.user.role,
    profile_image_link: response.user.profile_image_link,
    banner_image_link: response.user.banner_image_link,
    bio: response.user.bio_text,
    profile_tag_line: response.user.profile_tag_line,
    address_line_1: response.user.user_address_line_1,
    address_line_2: response.user.user_address_line_2,
    street_number: response.user.street_number,
    street_name: response.user.street_name,
    occupation: response.user.occupation,
    city: response.user.user_city,
    country: response.user.user_country,
    postal_code: response.user.user_zip_postal_code,
    state: response.user.user_state,
    address_type: response.user.address_type,
    business_name: response.user.business_name,
    business_type: response.user.business_type,
    business_phone_number: response.user.business_phone_number,
    business_street_number: response.user.business_street_number,
    business_street_name: response.user.business_street_name,
    business_unit: response.user.business_unit,
    business_registered: response.user.business_registered,
    retail_business: response.user.retail_business,
    food_business_type: response.user.food_business_type,
    food_handlers_certificate: response.user.food_handlers_certificate,
    business_registered_location: response.user.business_registered_location,
    business_city: response.user.city,
    business_state: response.user.state,
    business_country: response.user.country,
    business_zip_postal_code: response.user.zip_postal_code,
    business_details_id: response.user.business_details_id,
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
router.post("/user/host", token_service.authenticateToken, async (req, res) => {
  console.log(req.body);
  console.log(req.user);
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
    console.log(error);
    return res.status(403).json({
      success: false,
      message: error,
    });
  }
});
router.post("/user/vendor", async (req, res) => {
  //console.log(req.body, "request body");
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
    console.log(error);
    return res.status(403).json({
      success: false,
      message: error,
    });
  }
});

router.post("/user/sponsor", async (req, res) => {
  //console.log(req.body, "request body");
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
    console.log(error);
    return res.status(403).json({
      success: false,
      message: error,
    });
  }
});

// POST application from multi-step form
router.post(
  "/complete-profile/preference/:id",
  token_service.authenticateToken,
  async (req, res) => {
    console.log("here");
    console.log(req.body);
    console.log(req.params);
    const {
      preferred_country_cuisine,
      food_preferences,
      food_allergies,
    } = req.body;
    try {
      if (!food_preferences || !food_allergies || !preferred_country_cuisine) {
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

        const preference_details = {
          food_preferences,
          food_allergies,
          preferred_country_cuisine,
        };

        const response = await user_profile_service.createPreferences(
          preference_details,
          req.params["id"]
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
      tasttlig_user_id: req.params.id,
      first_name: req.body.firstName,
      last_name: req.body.lastName,
      phone_number: req.body.phoneNumber,
      street_number: req.body.streetNumber,
      street_name: req.body.streetName,
      apartment_no: req.body.unitNumber,
      user_city: req.body.city,
      user_state: req.body.region,
      user_zip_postal_code: req.body.postalCode,
      user_country: req.body.country,
      occupation: req.body.occupation,
      // address_type: req.body.address_type,
      // business_name: req.body.business_name,
      // business_type: req.body.business_type,
      // profile_status: req.body.profile_status,
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

router.put("/user/update-business-profile/:id", async (req, res) => {
  try {
    const user = {
      tasttlig_user_id: req.params.id,

      business_name: req.body.businessName,
      business_phone_number: req.body.businessPhoneNumber,
      business_street_number: req.body.businessStreetNumber,
      business_street_name: req.body.businessStreetName,
      business_unit: req.body.businessUnit,
      business_city: req.body.businessCity,
      business_state: req.body.businessState,
      business_country: req.body.businessCountry,
      business_zip_postal_code: req.body.businessPostalCode,
      business_registered: req.body.businessRegistered,
      retail_business: req.body.businessRetail,
      business_type: req.body.businessType,
      food_business_type: req.body.foodBusinessType,
      food_handlers_certificate: req.body.foodHandlersCertificate,
      business_registered_location: req.body.businessRegisteredLocation,
    };

    const response = await user_profile_service.updateUserBusinessProfile(user);

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

// get nationalities for user

router.get("/user/nationalities", async (req, res) => {
  try {
    const keyword = req.query.keyword || "";
    const response = await user_profile_service.getNationalities(keyword);
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

// // update user info for passport
//
router.put(
  "/user/user-info/:id",
  token_service.authenticateToken,
  async (req, res) => {
    console.log("here");
    console.log(req.body);

    const {
      user_age,
      user_occupation,
      user_marital_status,
      user_country,
      user_city,
      user_zip_code,
      user_street_name,
      user_street_number,
      user_apartment_number,
      user_gender,
    } = req.body;
    console.log(user_age);
    try {
      if (
        !user_age ||
        !user_occupation ||
        !user_marital_status ||
        // !user_country ||
        !user_city ||
        !user_zip_code
        //!user_gender||
        //!user_street_name ||
        //!user_gender
      ) {
        return res.status(403).json({
          success: false,
          message: "Required parameters are not available in request.",
        });
      }

      // console.log(req)

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

        const user_info = {
          user_gender,
          user_age,
          user_occupation,
          user_marital_status,
          user_country,
          user_city,
          user_zip_code,
          user_street_name,
          user_street_number,
          user_apartment_number,
        };

        user_info["id"] = req.user.id;

        console.log("body from front-end:", user_info);
        const response = await user_profile_service.createUserInfo(user_info);
        console.log("response from preferences:", response);
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

const passport_service = require("../../services/passport/businessPassport");

router.post(
  "/business-passport",
  token_service.authenticateToken,
  async (req, res) => {
    try {
      const response = await passport_service.postBusinessPassportDetails(
        req.body
      );

      console.log("res", response.success);
      console.log("body", req.body);
      if (response.success && req.body.is_sponsor) {
        saveUserApplicationToSponsor(req, res);
      } else {
        console.log("return", response);
        return res.send(response);
      }
    } catch (error) {
      res.send({
        success: false,
        message: "Error.",
        response: error.message,
      });
    }
  }
);

// router.put(
//   "/business-passport",
//   token_service.authenticateToken,
//   async (req, res) => {
//     try {
//       const response = await passport_service.putBusinessPassportDetails(
//         req.body
//       );

//       console.log("res", response.success);
//       console.log("body", req.body);
//       if (response.success && req.body.is_sponsor) {
//         saveUserApplicationToSponsor(req, res);
//       } else {
//         console.log("return", response);
//         return res.send(response);
//       }
//     } catch (error) {
//       res.send({
//         success: false,
//         message: "Error.",
//         response: error.message,
//       });
//     }
//   }
// );

const saveUserApplicationToSponsor = async (req, res) => {
  console.log("inside d funct", req.user);
  // save sponsor application
  const hostDto = {
    is_sponsor: req.body.is_sponsor,
    email: req.user.email,
  };
  console.log("hostdto", hostDto);
  const saveHost = await user_profile_service.saveHostApplication(
    hostDto,
    req.user
  );
  console.log("savehost", saveHost);

  //save sponsor for user
  if (saveHost.success) {
    try {
      const db_user = await authenticate_user_service.findUserByEmail(
        req.user.email
      );
      console.log("db_user", db_user);

      if (!db_user.success) {
        return res.status(403).json({
          success: false,
          message: "error",
        });
      }

      const business_details = await authentication_service.getUserByBusinessDetails(
        req.user.id
      );
      console.log("business_details", business_details);
      if (!business_details.success) {
        return res.status(403).json({
          success: false,
          message: business_details.message,
        });
      }

      const sponsorData = {
        sponsor_business_id:
          business_details.business_details.business_details_id,
      };
      console.log("sponsor data", sponsorData);
      const saveSponsorUser = await user_profile_service.saveSponsorForUser(
        sponsorData,
        db_user.user.tasttlig_user_id
      ); //end

      console.log("saveSponsorUser", saveSponsorUser);
      if (!saveSponsorUser.success) {
        return res.status(403).json({
          success: false,
          message: "error",
        });
      }

      console.log("final", saveSponsorUser.success);
      return res.send(saveSponsorUser);
    } catch (error) {
      res.send({
        success: false,
        message: "Error.",
        response: error.message,
      });
    }
    //catch
  }
};
module.exports = router;
