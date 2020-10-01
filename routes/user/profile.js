"use strict";

const router = require("express").Router();
const bcrypt = require("bcrypt");
const token_service = require("../../services/authentication/token");
const user_profile_service = require("../../services/profile/user_profile");
const authenticate_user_service = require("../../services/authentication/authenticate_user");
const user_role_manager = require("../../services/profile/user_roles_manager");
const {formatPhone} = require("../../functions/functions");

// GET user by ID
router.get("/user", token_service.authenticateToken, async (req, res) => {
  const response = await user_profile_service.getUserBySubscriptionId(
    req.user.id
  );
  if (!response.success) {
    return res.status(403).json({
      success: false,
      message: response.message
    });
  }

  let user = {
    id: response.user.tasttlig_user_id,
    first_name: response.user.first_name,
    last_name: response.user.last_name,
    email: response.user.email,
    phone_number: response.user.phone_number,
    role: user_role_manager.createRoleObject(response.user.role),
    profile_image_link: response.user.profile_image_link,
    banner_image_link: response.user.banner_image_link,
    bio: response.user.bio_text,
    profile_tag_line: response.user.profile_tag_line,
    address_line_1: response.user.user_address_line_1,
    address_line_2: response.user.user_address_line_2,
    city: response.user.user_city,
    postal_code: response.user.user_postal_code,
    state: response.user.user_state,
    address_type: response.user.address_type,
    business_name: response.user.business_name,
    business_type: response.user.business_type,
    profile_status: response.user.profile_status,
    subscription_code: response.user.subscription_code,
    verified: response.user.is_email_verified,
    passport_id: response.user.passport_id
  };
  res.status(200).json({
    success: true,
    user: user
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
    facebook: requestBody.facebook
  };
};

const extractFile = (requestBody, key, text) => {
  return {
    document_type: text,
    issue_date: new Date(requestBody[key + '_date_of_issue']),
    expiry_date: new Date(requestBody[key + '_date_of_expired']),
    document_link: requestBody.food_handler_certificate,
    status: "Pending"
  };
};

router.post(
  "/user/host",
  async (req, res) => {

    try {
      const hostDto = req.body;
      const response = await user_profile_service.saveHostApplication(hostDto, req.user);

      if(response.success) {
        return res.send(response);
      }

      return res.status(500).send(response);
    } catch (e) {
      return res.status(403).json({
        success: false,
        message: e
      });
    }
  });


// /usr/host route handles when a user apply to be a host.
// whom been applied to be host has to input their business info,
// documents, bank info. we handle each request in different services.
router.post(
  "/user/_host_",
  token_service.authenticateToken,
  async (req, res) => {

    try {
      let response = null;
      let db_user = await user_profile_service.getUserById(req.user.id);

      if (!db_user.success) {
        db_user = await user_profile_service.getUserByPassportIdOrEmail(
          req.body.email
        );
      }

      if (!db_user.success) {
        const become_food_provider_user = {
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          email: req.body.email,
          phone_number: req.body.phone_number
        }

        response = await authenticate_user_service.createBecomeFoodProviderUser(become_food_provider_user);
        res.send(response);
      } else {
        if (req.body.first_name !== db_user.user.first_name ||
          req.body.last_name !== db_user.user.last_name ||
          formatPhone(req.body.phone_number) !== db_user.user.phone
        ) {
          db_user.user.first_name = req.body.first_name
          db_user.user.last_name = req.body.last_name
          db_user.user.phone = formatPhone(req.body.phone_number)
          await user_profile_service.updateUserAccount(db_user.user);
        }
      }
      // Step 2, get all the data for business
      const business_info = extractBusinessInfo(db_user, req.body);
      response = await user_profile_service.insertBusinessForUser(business_info);

      if (!response.success) {
        return res.status(403).json({success: false, message: response.details});
      }

      // Step 3, get all the data for documents.
      // food handler certificate is always required
      const food_handler_certificate = extractFile(req.body, 'food_handler_certificate', 'Food Handler Certificate');
      response = await user_profile_service.insertDocument(
        db_user,
        food_handler_certificate
      );
      if (!response.success) {
        console.log(response)
        return res.status(403).json({success: false, message: response.details});
      }

      // insurance is not always required, but if the user input their insurance
      if (req.body.insurance) {
        const insurance = extractFile(req.body, 'insurance', 'Insurance');

        response = await user_profile_service.insertDocument(
          db_user,
          insurance
        );
        if (!response.success) {
          return res.status(403).json({success: false, message: response.details});
        }
      }

      // same thing for health safety certificate
      if (req.body.health_safety_certificate) {
        const health_safety_certificate =
          extractFile(req.body, 'health_safety_certificate', 'Health And Safety Certificate')
        response = await user_profile_service.insertDocument(
          db_user,
          health_safety_certificate
        );
        if (!response.success) {
          return res.status(403).json({success: false, message: response.details});
        }
      }

      // same thing for dine fine certificate
      if (req.body.dine_safe_certificate) {
        const dine_safe_certificate =
          extractFile(req.body, 'dine_safe_certificate', 'Dine Safe Certificate')
        response = await user_profile_service.insertDocument(
          db_user,
          dine_safe_certificate
        );
        if (!response.success) {
          return res.status(403).json({success: false, message: response.details});
        }
      }

      // Step 4, we need to handle bank information
      const banking_info = {
        user_id: db_user.user.tasttlig_user_id,
        bank_number: req.body.bank_number,
        account_number: req.body.account_number,
        institution_number: req.body.institution_number,
        void_cheque: req.body.void_cheque
      };

      response = await user_profile_service.insertBankingInfo(
        banking_info,
        "payment_bank"
      );
      if (!response.success) {
        return res.status(403).json({success: false, message: response.details});
      }

      // STEP 5, link to external website
      const external_websites_review = [
        "yelp",
        "google",
        "tripadvisor",
        "instagram",
        "youtube",
      ];
      let reviews = [];
      for (let i = 0; i < external_websites_review.length; i++) {
        let website = external_websites_review[i];
        if (req.body[website + "_review"]) {
          let review = {
            user_id: db_user.user.tasttlig_user_id,
            platform: website,
            link: req.body[website + "_review"]
          };
          reviews.push(review);
        }
      }

      if (req.body.media_recognition) {
        reviews.push({
          user_id: db_user.user.tasttlig_user_id,
          platform: "media recognition",
          link: req.body.media_recognition
        });
      }

      if (req.body.personal_review) {
        reviews.push({
          user_id: db_user.user.tasttlig_user_id,
          platform: "personal",
          text: req.body.personal_review
        });
      }

      response = await user_profile_service.insertExternalReviewLink(reviews);
      if (!response.success) {
        return res.status(403).json({success: false, message: response.details});
      }

      // STEP 6, hosting information, including why I want to host.
      const application_info = {
        user_id: db_user.user.tasttlig_user_id,
        video_link: req.body.host_selection_video,
        youtube_link: req.body.youtube_link,
        reason: req.body.host_selection,
        created_at: new Date(),
        updated_at: new Date(),
        status: "Pending"
      };

      response = await user_profile_service.insertHostingInformation(application_info);
      if (!response.success) {
        return res.status(403).json({success: false, message: response.details});
      }

      /* STEP 7, add up to 3 menu items, check to see if they are also going to 
      be in the festival */
      response = await user_profile_service.insertMenuItem(req.body.menu_list);

      // if (req.body.participating_in_festival) {
      //   response = await food_sample_service.createNewFoodSample(
      //     db_user,
      //     menu_item_details,
      //     req.body.images,
      //     createdByAdmin
      //   );
      // }

      if (!response.success) {
        return res.status(403).json({success: false, message: response.details});
      }

      // STEP 7, sending email to admin for approval
      const applier = {
        user_id: db_user.user.tasttlig_user_id,
        last_name: db_user.user.last_name,
        first_name: db_user.user.first_name,
        email: db_user.user.email,
      };
      let documents = [
        {
          document_type: "Food Handler Certificate",
          issue_date: req.body.food_handler_certificate_date_of_issue,
          expiry_date: req.body.food_handler_certificate_date_of_expired,
          document_link: req.body.food_handler_certificate,
        },
      ];

      if (req.body.insurance) {
        documents = documents.push({
          document_type: "Insurance",
          document_link: req.body.insurance,
          issue_date: req.body.insurance_date_of_issue,
          expiry_date: req.body.insurance_date_of_expired,
        });
      }

      // same thing for health safety certificate
      if (req.body.health_safety_certificate) {
        documents.push({
          document_type: "Health and Safety Certificate",
          document_link: req.body.health_safety_certificate,
          issue_date: req.body.health_safety_certificate_date_of_issue,
          expiry_date: req.body.health_safety_certificate_date_of_expired,
        });
      }

      // same thing for health safety certificate
      if (req.body.dine_safe_certificate) {
        documents.push({
          document_type: "Dine Safe Certificate",
          document_link: req.body.dine_safe_certificate,
          issue_date: req.body.dine_safe_certificate_date_of_issue,
          expiry_date: req.body.dine_safe_certificate_date_of_expired
        });
      }
      applier.documents = documents;
      await user_profile_service
        .sendAdminEmailForHosting(applier)
        .catch((e) => {
          res.status(403).json({success: false, message: e});
        });

      // STEP 8, sending email to user who apply hosting.
      await user_profile_service
        .sendApplierEmailForHosting(db_user)
        .catch((e) => {
          res.status(403).json({success: false, message: e});
        });
    } catch (e) {
      console.log(e)
      return res.status(403).json({success: false, message: e});
    }

    res.status(200).send({success: true});
  }
);

router.get("/user/application/:token", async (req, res) => {
  if (!req.params.token) {
    return res.status(403).json({
      success: false,
      message: "Required Parameters are not available in request",
    });
  }
  const response = await user_profile_service.handleAction(req.params.token);
  return res.send(response);
});

router.put("/user/update-account/:id", async (req, res) => {
  try {
    const pw = req.body.password;
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const password = bcrypt.hashSync(pw, salt);
    const user = {
      id: req.params.id,
      profile_image_link: req.body.profile_image_link,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      password,
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
  } catch (err) {
    console.log("Update", err);
  }
});

router.put("/user/update-profile/:id", async (req, res) => {
  try {
    const user = {
      id: req.params.id,
      address_line_1: req.body.address_line_1,
      address_line_2: req.body.address_line_2,
      city: req.body.city,
      postal_code: req.body.postal_code,
      state: req.body.state,
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
  } catch (err) {
    console.log("Update", err);
  }
});

module.exports = router;
