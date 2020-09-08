"use strict";

const router = require("express").Router();
const bcrypt = require("bcrypt");
const token_service = require("../../services/authentication/token");
const user_profile_service = require("../../services/profile/user_profile");
const user_role_manager = require("../../services/profile/user_roles_manager");
const apply_host_request = require("../../middleware/validator/apply_host_request").apply_host_request;

// GET user by ID
router.get("/user", token_service.authenticateToken, async (req, res) => {
  const response = await user_profile_service.getUserById(req.user.id);
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
    verified: response.user.is_email_verified
  };
  res.status(200).json({
    success: true,
    user: user
  });
});

router.post(
  "/user/upgrade",
  token_service.authenticateToken,
  async (req, res) => {
    if (
      !req.body.upgrade_type ||
      !req.body.document_type ||
      !req.body.document_link ||
      !req.body.issue_date ||
      !req.body.expiry_date
    ) {
      return res.status(403).json({
        success: false,
        message: "Required Parameters are not available in request"
      });
    }
    try {
      const user_details_from_db = await user_profile_service.getUserById(
        req.user.id
      );
      if (!user_details_from_db.success) {
        return res.status(403).json({
          success: false,
          message: user_details_from_db.message
        });
      }
      const db_user = user_details_from_db.user;
      const upgrade_details = {
        upgrade_type: req.body.upgrade_type,
        document_type: req.body.document_type,
        document_link: req.body.document_link,
        issue_date: req.body.issue_date,
        expiry_date: req.body.expiry_date,
        is_participating_in_festival: req.body.is_participating_in_festival
      };
      const response = await user_profile_service.upgradeUser(
        db_user,
        upgrade_details
      );
      return res.send(response);
    } catch (err) {
      res.send({
        success: false,
        message: "error",
        response: err
      });
    }
  }
);

const extractBusinessInfo = (requestBody) => {
  return {
    'user_id': requestBody.id,
    'business_name': requestBody.business_name,
    'business_type': requestBody.business_type,
    'ethnicity_of_restaurant': requestBody.culture,
    'business_address_1': requestBody.address_line_1,
    'business_address_2': requestBody.address_line_2,
    'city': requestBody.business_city,
    'state': requestBody.state,
    'postal_code': requestBody.postal_code,
    'country': requestBody.country,
    'business_registration_number': requestBody.registration_number,
    'instagram': requestBody.instagram,
    'facebook': requestBody.facebook,
  }
}

const extractFoodHandlerCertificate = (requestBody) => {
  return {
    document_type: 'Food Handler Certificate',
    issue_date: new Date(requestBody.date_of_issue),
    expiry_date: new Date(requestBody.expiry_date),
    document_link: requestBody.food_handler_certificate,
    status: "Pending"
  }
}

// /usr/host route handles when a user apply to be a host.
// whom been applied to be host has to input their business info,
// documents, bank info. we handle each request in different services.
router.post(
  "/user/host",
  token_service.authenticateToken,
  apply_host_request,
  async (req, res) => {
    const user_details_from_db = await user_profile_service.getUserById(
      req.user.id
    );
    if (!user_details_from_db.success) {
      return res.status(403).json({
        success: false,
        message: user_details_from_db.message
      });
    }

    // first, get all the data for business
    const business_info = extractBusinessInfo(req.body)
    await user_profile_service.insertBusinessForUser(business_info)

    // second, get all the data for documents.
    // food handler certificate is always required
    const food_handler_certificate = extractFoodHandlerCertificate(req.body)

    await user_profile_service.insertDocument(user_details_from_db, food_handler_certificate)

    // insurance is not always required, but if the user input their insurance
    if (req.body.insurance_file) {
      const insurance = {
        document_type: 'Insurance',
        document_link: req.body.insurance_file,
        status: 'Pending'
      }
      await user_profile_service.insertDocument(user_details_from_db, insurance)
    } else {
      const insurance = null
    }
    // same thing for health safety certificate
    if (req.body.health_safety_certificate) {
      const health_safety_certificate = {
        document_type: 'Health and Safety Certificate',
        document_link: req.body.health_safety_certificate,
        status: 'Pending'
      }
      await user_profile_service.insertDocument(user_details_from_db, health_safety_certificate)
    } else {
      const health_safety_certificate = null
    }

    // third, we need to handle bank information
    switch (req.body.banking) {
      case "Bank":
        const banking_info = {
          user_id: user_details_from_db.user.tasttlig_user_id,
          bank_number: req.body.bank_number,
          account_number: req.body.account_number,
          institution_number: req.body.institution_number,
          void_cheque: req.body.void_cheque
        }
        await user_profile_service.insertBankingInfo(banking_info, 'payment_bank')
        break;
      case "Online":
        const online_transfer_info = {
          user_id: user_details_from_db.user.tasttlig_user_id,
          transfer_email: req.body.online_email,
        }
        await user_profile_service.insertBankingInfo(online_transfer_info, 'payment_online_tranfer')
        break;
      case "PayPal":
        const paypal_info = {
          user_id: user_details_from_db.user.tasttlig_user_id,
          paypal_email: req.body.paypal_email,
        }
        await user_profile_service.insertBankingInfo(paypal_info, 'payment_paypal')
        break;
      case "Stripe":
        const stripe_info = {
          user_id: user_details_from_db.user.tasttlig_user_id,
          stripe_account: req.body.stripe_account,
        }
        await user_profile_service.insertBankingInfo(stripe_info, 'payment_stripe')
        break
    }

    // STEP 4, link to external website
    const external_websites_review = [
      'yelp',
      'google',
      'tripadvisor',
      'instagram',
      'youtube',
    ]
    let reviews = []
    for (let i = 0; i < external_websites_review.length; i++) {
      let website = external_websites_review[i]
      if (req.body[website + '_review']){
        let review = {
          user_id: user_details_from_db.user.tasttlig_user_id,
          platform: website,
          link: req.body[website + '_review'],
        }
        reviews.push(review)
      }
    }

    if (req.body.media_recognition) {
      reviews.push({
        user_id: user_details_from_db.user.tasttlig_user_id,
        platform: 'media recognition',
        link: req.body.media_recognition
      })
    }

    if (req.body.personal_review) {
      reviews.push({
        user_id: user_details_from_db.user.tasttlig_user_id,
        platform: 'personal',
        text: req.body.personal_review
      })
    }

    await user_profile_service.insertExternalReviewLink(reviews)

    // Final STEP, hosting information
    const application_info = {
      user_id: user_details_from_db.user.tasttlig_user_id,
      video_link: req.body.host_selection_video,
      youtube_link: req.body.youtube_link,
      reason: req.body.host_selection,
      created_at: new Date(),
      status: "Pending"
    }
    await user_profile_service.insertHostingInformation(application_info)


  }
);


router.post("/user/upgrade/action/:token", async (req, res) => {
  if (!req.params.token) {
    return res.status(403).json({
      success: false,
      message: "Required Parameters are not available in request"
    });
  }
  const response = await user_profile_service.upgradeUserResponse(
    req.params.token
  );
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
      banner_image_link: req.body.banner_image_link
    };

    const response = await user_profile_service.updateUserAccount(user);

    if (response.success) {
      res.status(200).send(response);
    } else {
      return res.status(401).json({
        success: false,
        message: "Email already exists."
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
      profile_status: req.body.profile_status
    };

    const response = await user_profile_service.updateUserProfile(user);

    if (response.success) {
      res.status(200).send(response);
    } else {
      return res.status(401).json({
        success: false,
        message: "Email already exists."
      });
    }
  } catch (err) {
    console.log("Update", err);
  }
});

module.exports = router;
