"use strict";

// Libraries
const { db } = require("../../db/db-config");
const jwt = require("jsonwebtoken");
const Mailer = require("../email/nodemailer").nodemailer_transporter;
const { formatPhone } = require("../../functions/functions");
const menu_items_service = require("../menu_items/menu_items");
const assets_service = require("../assets/assets");
const external_api_service = require("../../services/external_api_service");
const auth_server_service = require("../../services/authentication/auth_server_service");

// Environment variables
const SITE_BASE = process.env.SITE_BASE;
const ADMIN_EMAIL = process.env.TASTTLIG_ADMIN_EMAIL;
const EMAIL_SECRET = process.env.EMAIL_SECRET;

// Get user by ID helper function
const getUserById = async (id) => {
  return await db
    .select("tasttlig_users.*", db.raw("ARRAY_AGG(roles.role) as role"))
    .from("tasttlig_users")
    .leftJoin(
      "user_role_lookup",
      "tasttlig_users.tasttlig_user_id",
      "user_role_lookup.user_id"
    )
    .leftJoin("roles", "user_role_lookup.role_code", "roles.role_code")
    .groupBy("tasttlig_users.tasttlig_user_id")
    .having("tasttlig_users.tasttlig_user_id", "=", id)
    .first()
    .then((value) => {
      if (!value) {
        return { success: false, message: "No user found." };
      }

      return { success: true, user: value };
    })
    .catch((error) => {
      return { success: false, message: error };
    });
};

// Get user by subscription ID helper function
const getUserBySubscriptionId = async (id) => {
  return await db("tasttlig_users")
    .select(
      "tasttlig_users.*",
      "user_subscriptions.*",
      db.raw("ARRAY_AGG(roles.role) as role")
    )
    .first()
    .leftJoin(
      "user_subscriptions",
      "tasttlig_users.tasttlig_user_id",
      "user_subscriptions.user_id"
    )
    .leftJoin(
      "user_role_lookup",
      "tasttlig_users.tasttlig_user_id",
      "user_role_lookup.user_id"
    )
    .leftJoin("roles", "user_role_lookup.role_code", "roles.role_code")
    .groupBy("tasttlig_users.tasttlig_user_id")
    .groupBy("user_subscriptions.user_subscription_id")
    .having("tasttlig_users.tasttlig_user_id", "=", id)
    .then((value) => {
      if (!value) {
        return { success: false, message: "No user found." };
      }

      return { success: true, user: value };
    })
    .catch((error) => {
      return { success: false, message: error };
    });
};

// Update user account helper function
const updateUserAccount = async (user) => {
  try {
    return await db("tasttlig_users")
      .where("tasttlig_user_id", user.id)
      .first()
      .update({
        first_name: user.first_name,
        last_name: user.last_name,
        phone_number: user.phone_number,
        profile_image_link: user.profile_image_link,
        profile_tag_line: user.profile_tag_line,
        bio_text: user.bio_text,
        banner_image_link: user.banner_image_link,
      })
      .returning("*")
      .then((value) => {
        return { success: true, details: value[0] };
      })
      .catch((reason) => {
        return { success: false, details: reason };
      });
  } catch (error) {
    return { success: false, message: error };
  }
};

// Update user profile helper function
const updateUserProfile = async (user) => {
  try {
    return await db("tasttlig_users")
      .where("tasttlig_user_id", user.id)
      .first()
      .update({
        first_name: user.first_name,
        last_name: user.last_name,
        phone_number: user.phone_number,
        user_address_line_1: user.address_line_1,
        user_address_line_2: user.address_line_2,
        user_city: user.city,
        user_state: user.state,
        user_postal_code: user.postal_code,
        country: user.country,
        address_type: user.address_type,
        business_name: user.business_name,
        business_type: user.business_type,
        profile_status: user.profile_status,
      })
      .returning("*")
      .then((value) => {
        return { success: true, details: value[0] };
      })
      .catch((reason) => {
        return { success: false, details: reason };
      });
  } catch (error) {
    return { success: false, message: error };
  }
};

// Save sponsor information to sponsors table helper function
const saveSponsorForUser = async (sponsorDto, sponsor_user_id) => {
  return await db.transaction(async (trx) => {
    const sponsorInfo = {
      sponsor_user_id,
      sponsor_name: sponsorDto.business_name,
      sponsor_address_1: sponsorDto.address_line_1,
      sponsor_address_2: sponsorDto.address_line_2,
      sponsor_city: sponsorDto.business_city,
      sponsor_state: sponsorDto.state,
      sponsor_postal_code: sponsorDto.postal_code,
      sponsor_country: sponsorDto.country,
      sponsor_description: sponsorDto.description,
    };

    const checkForUpdate = await trx("sponsors")
      .select("sponsor_id")
      .where("sponsor_user_id", sponsor_user_id)
      .first()
      .returning("*");
    let response = [];

    if (checkForUpdate) {
      response = await trx("sponsors")
        .where("sponsor_id", checkForUpdate.sponsor_id)
        .update(sponsorInfo)
        .returning("*");
    } else {
      response = await trx("sponsors").insert(sponsorInfo).returning("*");
    }

    return { success: true, details: response[0] };
  });
};

// Save business information to business details table helper function
const saveBusinessForUser = async (hostDto, user_id) => {
  return await db.transaction(async (trx) => {
    const businessInfo = {
      user_id,
      business_category: hostDto.business_category,
      business_type: hostDto.service_provider,
      business_name: hostDto.business_name,
      ethnicity_of_restaurant: hostDto.culture,
      business_address_1: hostDto.address_line_1,
      business_address_2: hostDto.address_line_2,
      city: hostDto.business_city,
      state: hostDto.state,
      postal_code: hostDto.postal_code,
      country: hostDto.country,
      business_phone_number: hostDto.phone_number,
      business_registration_number: hostDto.registration_number,
      instagram: hostDto.instagram,
      facebook: hostDto.facebook,
      in_current_festival: hostDto.in_current_festival,
    };

    const checkForUpdate = await trx("business_details")
      .select("business_id")
      .where("user_id", user_id)
      .first()
      .returning("*");
    let response = [];

    if (checkForUpdate) {
      response = await trx("business_details")
        .where("business_id", checkForUpdate.business_id)
        .update(businessInfo)
        .returning("*");
    } else {
      response = await trx("business_details")
        .insert(businessInfo)
        .returning("*");
    }

    return { success: true, details: response[0] };
  });
};

// Save business services helper function
const saveBusinessServices = async (db_user, services) => {
  return await db.transaction(async (trx) => {
    const businessServices = services.map((serviceName) => ({
      user_id: db_user.tasttlig_user_id,
      name: serviceName,
    }));

    await trx("business_services")
      .where("user_id", db_user.tasttlig_user_id)
      .del();

    const response = await trx("business_services")
      .insert(businessServices)
      .returning("*");

    return { success: true, details: response[0] };
  });
};

// Save application information to applications table helper function
const saveApplicationInformation = async (hostDto, trx) => {
  let applications = [];
  let role_name = "";

  if (hostDto.is_host === "yes") {
    applications.push({
      user_id: hostDto.dbUser.user.tasttlig_user_id,
      video_link: hostDto.host_selection_video,
      youtube_link: hostDto.host_youtube_link,
      reason: hostDto.host_selection,
      resume: hostDto.host_selection_resume,
      created_at: new Date(),
      updated_at: new Date(),
      type: "host",
      status: "Pending",
    });
    role_name = "HOST_PENDING";
  }

  // if (hostDto.is_cook === "yes") {
  //   applications.push({
  //     user_id: hostDto.dbUser.user.tasttlig_user_id,
  //     video_link: hostDto.cook_selection_video,
  //     youtube_link: hostDto.cook_youtube_link,
  //     reason: hostDto.cook_selection,
  //     resume: hostDto.cook_selection_resume,
  //     created_at: new Date(),
  //     updated_at: new Date(),
  //     type: "cook",
  //     status: "Pending"
  //   })
  // }

  // Save sponsor application to applications table
  if (applications.length == 0 && hostDto.is_sponsor) {
    applications.push({
      user_id: hostDto.dbUser.user.tasttlig_user_id,
      reason: "",
      created_at: new Date(),
      updated_at: new Date(),
      type: "sponsor",
      status: "Pending",
    });
    role_name = "SPONSOR_PENDING";
  }

  if (applications.length == 0 && hostDto.is_host === "no") {
    applications.push({
      user_id: hostDto.dbUser.user.tasttlig_user_id,
      reason: "",
      created_at: new Date(),
      updated_at: new Date(),
      type: "restaurant",
      status: "Pending",
    });
    role_name = "RESTAURANT_PENDING";
  }

  // Get role code of new role to be added
  const new_role_code = await trx("roles")
    .select()
    .where({ role: role_name })
    .then((value) => {
      return value[0].role_code;
    });

  // Insert new role for this user
  await trx("user_role_lookup").insert({
    user_id: hostDto.dbUser.user.tasttlig_user_id,
    role_code: new_role_code,
  });

  return trx("applications")
    .insert(applications)
    .returning("*")
    .catch((reason) => {
      console.log(reason);
    });
};

// Save payment information helper function
const savePaymentInformation = async (db_user, banking_info) => {
  return await db.transaction(async (trx) => {
    let paymentInfo = {
      payment_type: banking_info.banking,
      user_id: db_user.tasttlig_user_id,
    };

    if (paymentInfo.payment_type === "Bank") {
      paymentInfo = {
        ...paymentInfo,
        bank_number: banking_info.bank_number,
        account_number: banking_info.account_number,
        institution_number: banking_info.institution_number,
        void_cheque: banking_info.void_cheque,
      };
    } else if (paymentInfo.payment_type === "Paypal") {
      paymentInfo = {
        ...paymentInfo,
        paypal_email: banking_info.paypal_email,
      };
    } else if (paymentInfo.payment_type === "Stripe") {
      paymentInfo = {
        ...paymentInfo,
        stripe_account_number: banking_info.stripe_account,
      };
    } else {
      paymentInfo = {
        ...paymentInfo,
        etransfer_email: banking_info.online_email,
      };
    }

    await trx("payment_info").where("user_id", db_user.tasttlig_user_id).del();

    return trx("payment_info").insert(paymentInfo).returning("*");
  });
};

// Save documents helper function
const saveDocuments = async (db_user, documents_obj) => {
  return await db.transaction(async (trx) => {
    const documents = [
      ["food_handler_certificate", "Food Handler Certificate"],
      ["insurance", "Insurance"],
      ["dine_safe_certificate", "Dine Safe Certificate"],
      ["health_safety_certificate", "Health and Safety Certificate"],
      ["government_id", "Government ID"],
    ]
      .filter(
        (doc) =>
          documents_obj[doc[0]] &&
          documents_obj[`${doc[0]}_date_of_issue`] &&
          documents_obj[`${doc[0]}_date_of_expired`]
      )
      .map((doc) => ({
        user_id: db_user.tasttlig_user_id,
        document_type: doc[1],
        issue_date: new Date(documents_obj[`${doc[0]}_date_of_issue`]),
        expiry_date: new Date(documents_obj[`${doc[0]}_date_of_expired`]),
        document_link: documents_obj[doc[0]],
        status: "Pending",
      }));

    await trx("documents").where("user_id", db_user.tasttlig_user_id).del();

    await trx("documents").insert(documents).returning("*");

    return documents;
  });
};

// Save social proof helper function
const saveSocialProof = async (db_user, social_proof) => {
  return await db.transaction(async (trx) => {
    const reviews = [
      "yelp",
      "google",
      "tripadvisor",
      "instagram",
      "youtube",
      "facebook",
    ]
      .filter((w) => social_proof[`${w}_review`])
      .map((w) => ({
        user_id: db_user.tasttlig_user_id,
        platform: w,
        link: social_proof[`${w}_review`],
      }));

    if (social_proof.media_recognition) {
      reviews.push({
        user_id: db_user.tasttlig_user_id,
        platform: "media recognition",
        link: social_proof.media_recognition,
      });
    }

    if (social_proof.personal_review) {
      reviews.push({
        user_id: db_user.tasttlig_user_id,
        platform: "personal",
        text: social_proof.personal_review,
      });
    }

    await trx("external_review")
      .where("user_id", db_user.tasttlig_user_id)
      .del();

    return trx("external_review").insert(reviews).returning("*");
  });
};

// Save menu items helper function
const saveMenuItems = async (db_user, menu_list, update = true) => {
  return await db.transaction(async (trx) => {
    if (update) {
      await db("menu_items")
        .select("menu_item_id")
        .where("menu_item_creator_user_id", db_user.tasttlig_user_id)
        .then(async (menu_item_ids) => {
          let menu_item_id_list = [];

          menu_item_ids.map((menu_item_id) => {
            menu_item_id_list.push(menu_item_id.menu_item_id);
          });

          await db("menu_item_images")
            .select("menu_item_id")
            .whereIn("menu_item_id", menu_item_id_list)
            .del()
            .then(async () => {
              await db("menu_items")
                .whereIn("menu_item_id", menu_item_id_list)
                .del();
            });
        })
        .catch((error) => {
          console.log(error);
        });
    }

    await Promise.all(
      menu_list.map(async (m) => {
        await menu_items_service.addNewMenuItem(db_user, m, m.menuImages, trx);
      })
    );

    return { success: true };
  });
};

// Save assets helper function
const saveAssets = async (db_user, assets) => {
  return await db.transaction(async (trx) => {
    await db("assets")
      .select("asset_id")
      .where("user_id", db_user.tasttlig_user_id)
      .then(async (asset_ids) => {
        let asset_id_list = [];

        asset_ids.map((asset_id) => {
          asset_id_list.push(asset_id.asset_id);
        });

        await db("asset_images")
          .whereIn("asset_id", asset_id_list)
          .del()
          .then(async () => {
            await db("assets").whereIn("menu_item_id", asset_id_list).del();
          });
      })
      .catch((error) => {
        console.log(error);
      });

    await Promise.all(
      assets.map(async (a) => {
        await assets_service.addAsset(db_user, a, a.images, trx);
      })
    );

    return { success: true };
  });
};

// Save entertainment helper function
const saveSampleLinks = async (db_user, sample_links) => {
  await db("entertainment")
    .whereIn("creator_user_id", db_user.tasttlig_user_id)
    .del();

  const sampleLinks = sample_links.map((sample_link) => ({
    user_id: db_user.tasttlig_user_id,
    media_link: sample_link,
  }));

  return db("entertainment").insert(sampleLinks).returning("*");
};

// Save venue information helper function
const saveVenueInformation = async (
  db_user,
  venue_name,
  venue_description,
  venue_photos
) => {
  return await db.transaction(async (trx) => {
    await db("venue")
      .select("venue_id")
      .where("creator_user_id", db_user.tasttlig_user_id)
      .then(async (venue_ids) => {
        let venue_id_list = [];

        venue_ids.map((venue_id) => {
          venue_id_list.push(venue_id.venue_id);
        });

        await db("venue_images")
          .whereIn("venue_id", venue_id_list)
          .del()
          .then(async () => {
            await db("assets").whereIn("venue_id", venue_id_list).del();
          });
      })
      .catch((error) => {
        console.log(error);
      });

    const response = await trx("venue")
      .insert({
        creator_user_id: db_user.tasttlig_user_id,
        name: venue_name,
        description: venue_description,
      })
      .returning("*");

    const photos = venue_photos.map((venue_photo) => ({
      venue_id: response[0].venue_id,
      image_url: venue_photo,
    }));

    return trx("venue_images").insert(photos).returning("*");
  });
};

// Send application approved or rejected email from admin helper function
const sendAdminEmailForHosting = async (user_info) => {
  const document_approve_token = jwt.sign(
    {
      user_id: user_info.user_id,
      status: "APPROVED",
    },
    EMAIL_SECRET
  );
  const document_reject_token = jwt.sign(
    {
      user_id: user_info.user_id,
      status: "REJECT",
    },
    EMAIL_SECRET
  );

  const application_approve_url = `${SITE_BASE}/user/application/${document_approve_token}`;
  const application_reject_url = `${SITE_BASE}/user/application/${document_reject_token}`;

  await Mailer.sendMail({
    from: process.env.SES_DEFAULT_FROM,
    to: ADMIN_EMAIL,
    subject: "[Tasttlig] Document Verification",
    template: "document_admin_approval_decline",
    context: {
      first_name: user_info.first_name,
      last_name: user_info.last_name,
      email: user_info.email,
      upgrade_type: "RESTAURANT",
      documents: user_info.documents,
      approve_link: application_approve_url,
      reject_link: application_reject_url,
    },
  });
};

// Send application confirmation email to user helper function
const sendApplierEmailForHosting = async (db_user) => {
  await Mailer.sendMail({
    from: process.env.SES_DEFAULT_FROM,
    to: db_user.user.email,
    subject: `[Tasttlig] Thank you for your application`,
    template: "user_upgrade_request",
    context: {
      first_name: db_user.user.first_name,
      last_name: db_user.user.last_name,
    },
  });
};

// Email to new user with login details and password reset link helper function
const sendNewUserEmail = async (new_user) => {
  const email = new_user.email;
  const { email_token } = await auth_server_service.authPasswordResetRequest(
    email
  );

  try {
    const url = `${SITE_BASE}/forgot-password/${email_token}/${email}`;

    await Mailer.sendMail({
      from: process.env.SES_DEFAULT_FROM,
      to: email,
      subject: "[Tasttlig] Thank you for your application",
      template: "new_application_user_account",
      context: {
        first_name: new_user.first_name,
        last_name: new_user.last_name,
        email,
        password: new_user.password,
        url,
      },
    });

    return {
      success: true,
      message: "Success.",
      response: `Your update password email has been sent to ${email}.`,
    };
  } catch (error) {
    return {
      success: false,
      message: "Error.",
      response: "Error in sending email.",
    };
  }
};

const upgradeUserResponse = async (token) => {
  try {
    const decrypted_token = jwt.verify(token, EMAIL_SECRET);
    const document_id = decrypted_token.document_id;
    const status = decrypted_token.status;

    const db_document = await db("documents")
      .where("document_id", document_id)
      .update("status", status)
      .returning("*")
      .catch((reason) => {
        return { success: false, message: reason };
      });

    const document_user_id = db_document[0].user_id;

    return approveOrDeclineHostApplication(document_user_id, status);
  } catch (error) {
    return { success: false, message: error };
  }
};

// handleAction is the function when admin clicks the approve link
const handleAction = async (token) => {
  try {
    const decrypted_token = jwt.verify(token, EMAIL_SECRET);
    const user_id = decrypted_token.user_id;
    const status = decrypted_token.status;

    return approveOrDeclineHostApplication(user_id, status);
  } catch (error) {
    return { success: false, message: error };
  }
};

const approveOrDeclineHostApplication = async (
  userId,
  status,
  declineReason
) => {
  try {
    const db_user_row = await getUserById(userId);

    if (!db_user_row.success) {
      return { success: false, message: db_user_row.message };
    }

    const db_user = db_user_row.user;

    // Get pending role which has been approved
    let role_pending = "";
    db_user.role.map((role) => {
      if (role.search("_PENDING") !== -1) {
        role_pending = role;
      }
    });

    // Depends on status, we do different things:
    // If status is approved
    if (status === "APPROVED") {
      // Get role code of old role to be removed
      const old_role_code = await db("roles")
        .select()
        .where({ role: role_pending })
        .then((value) => {
          return value[0].role_code;
        });

      // Remove the role for this user
      await db("user_role_lookup")
        .where({
          user_id: db_user.tasttlig_user_id,
          role_code: old_role_code,
        })
        .del();

      // Get role code of new role to be added
      let new_role = role_pending.split("_")[0];
      const new_role_code = await db("roles")
        .select()
        .where({ role: new_role })
        .then((value) => {
          return value[0].role_code;
        });

      // Insert new role for this user
      await db("user_role_lookup").insert({
        user_id: db_user.tasttlig_user_id,
        role_code: new_role_code,
      });

      // STEP 2: Update all Experiences to Active state
      await db("experiences")
        .where({
          experience_creator_user_id: db_user.tasttlig_user_id,
          status: "INACTIVE",
        })
        .update("status", "ACTIVE");

      // STEP 3: Update all Food Samples to Active state if the user agreed to participate in festival
      if (db_user.is_participating_in_festival) {
        await db("food_samples")
          .where({
            food_sample_creater_user_id: db_user.tasttlig_user_id,
            status: "INACTIVE",
          })
          .update("status", "ACTIVE");
      }

      // STEP 4: Update all documents belongs to this user which is in Pending state become APPROVED
      await db("documents")
        .where("user_id", db_user.tasttlig_user_id)
        .andWhere("status", "Pending")
        .update("status", "APPROVED")
        .returning("*")
        .catch((reason) => {
          return { success: false, message: reason };
        });

      // STEP 5: Update applications table status
      await db("applications")
        .where("user_id", db_user.tasttlig_user_id)
        .andWhere("status", "Pending")
        .update("status", "APPROVED")
        .returning("*")
        .catch((reason) => {
          return { success: false, message: reason };
        });

      let role_name_in_title_case =
        new_role.charAt(0).toUpperCase() + new_role.slice(1).toLowerCase();
      let active_item = "Food Samples";

      if (role_name_in_title_case === "Host") {
        active_item = "Experiences";
      }

      // STEP 6: Email the user that their application is approved
      await Mailer.sendMail({
        from: process.env.SES_DEFAULT_FROM,
        to: db_user.email,
        subject: `[Tasttlig] Your request for upgradation to ${role_name_in_title_case} is accepted`,
        template: "user_upgrade_approve",
        context: {
          first_name: db_user.first_name,
          last_name: db_user.last_name,
          role_name: role_name_in_title_case,
          active_item: active_item,
        },
      });

      return { success: true, message: status };
    } else {
      // Status is failed
      // STEP 1: remove the RESTAURANT_PENDING role
      // Get role code of the role to be removed
      let role_code = await db("roles")
        .select()
        .where({
          role: role_pending,
        })
        .then((value) => {
          return value[0].role_code;
        });

      // Remove the role for this user
      await db("user_role_lookup")
        .where({
          user_id: db_user.tasttlig_user_id,
          role_code: role_code,
        })
        .del();

      // STEP 2: Update all documents belongs to this user which is in Pending state become REJECT
      await db("documents")
        .where("user_id", db_user.tasttlig_user_id)
        .andWhere("status", "Pending")
        .update("status", "REJECT")
        .returning("*")
        .catch((reason) => {
          return { success: false, message: reason };
        });

      // STEP 3: Update applications table status
      await db("applications")
        .where("user_id", db_user.tasttlig_user_id)
        .andWhere("status", "Pending")
        .update("status", "REJECT")
        .returning("*")
        .catch((reason) => {
          return { success: false, message: reason };
        });

      let role_name_in_title_case =
        role_pending.split("_")[0].charAt(0).toUpperCase() +
        role_pending.split("_")[0].slice(1).toLowerCase();

      // STEP 4: Notify user their application is rejected
      await Mailer.sendMail({
        from: process.env.SES_DEFAULT_FROM,
        to: db_user.email,
        subject: `[Tasttlig] Your request for upgradation to ${role_name_in_title_case} is rejected`,
        template: "user_upgrade_reject",
        context: {
          first_name: db_user.first_name,
          last_name: db_user.last_name,
          declineReason,
        },
      });

      return { success: true, message: status };
    }
  } catch (error) {
    return { success: false, message: error };
  }
};

// Get user by email helper function
const getUserByEmail = async (email) => {
  return await db
    .select("tasttlig_users.*", db.raw("ARRAY_AGG(roles.role) as role"))
    .from("tasttlig_users")
    .leftJoin(
      "user_role_lookup",
      "tasttlig_users.tasttlig_user_id",
      "user_role_lookup.user_id"
    )
    .leftJoin("roles", "user_role_lookup.role_code", "roles.role_code")
    .groupBy("tasttlig_users.tasttlig_user_id")
    .having("tasttlig_users.email", "=", email)
    .first()
    .then((value) => {
      if (!value) {
        return { success: false, message: "No user found." };
      }

      return { success: true, user: value };
    })
    .catch((error) => {
      return { success: false, message: error };
    });
};

// Get user by email with subscription helper function
const getUserByEmailWithSubscription = async (email) => {
  return await db
    .select(
      "tasttlig_users.*",
      "user_subscriptions.*",
      db.raw("ARRAY_AGG(roles.role) as role")
    )
    .from("tasttlig_users")
    .leftJoin(
      "user_subscriptions",
      "tasttlig_users.tasttlig_user_id",
      "user_subscriptions.user_id"
    )
    .leftJoin(
      "user_role_lookup",
      "tasttlig_users.tasttlig_user_id",
      "user_role_lookup.user_id"
    )
    .leftJoin("roles", "user_role_lookup.role_code", "roles.role_code")
    .groupBy("tasttlig_users.tasttlig_user_id")
    .having("tasttlig_users.email", "=", email)
    .having("user_subscriptions.subscription_end_datetime", ">", new Date())
    .first()
    .then((value) => {
      if (!value) {
        return { success: false, message: "No user found." };
      }

      return { success: true, user: value };
    })
    .catch((error) => {
      return { success: false, message: error };
    });
};

// Get user by Passport ID helper function
const getUserByPassportId = async (passport_id) => {
  return await db
    .select("tasttlig_users.*", db.raw("ARRAY_AGG(roles.role) as role"))
    .from("tasttlig_users")
    .leftJoin(
      "user_role_lookup",
      "tasttlig_users.tasttlig_user_id",
      "user_role_lookup.user_id"
    )
    .leftJoin("roles", "user_role_lookup.role_code", "roles.role_code")
    .groupBy("tasttlig_users.tasttlig_user_id")
    .having("passport_id", "=", passport_id)
    .first()
    .then((value) => {
      if (!value) {
        return { success: false, message: "No user found." };
      }

      return { success: true, user: value };
    })
    .catch((error) => {
      return { success: false, message: error };
    });
};

// Get user by Passport ID or email helper function
const getUserByPassportIdOrEmail = async (passport_id_or_email) => {
  return await db
    .select("tasttlig_users.*", db.raw("ARRAY_AGG(roles.role) as role"))
    .from("tasttlig_users")
    .leftJoin(
      "user_role_lookup",
      "tasttlig_users.tasttlig_user_id",
      "user_role_lookup.user_id"
    )
    .leftJoin("roles", "user_role_lookup.role_code", "roles.role_code")
    .groupBy("tasttlig_users.tasttlig_user_id")
    .having("tasttlig_users.email", "=", passport_id_or_email)
    .orHaving("tasttlig_users.passport_id", "=", passport_id_or_email)
    .first()
    .then((value) => {
      if (!value) {
        return { success: false, message: "No user found." };
      }

      return { success: true, user: value };
    })
    .catch((error) => {
      return { success: false, message: error };
    });
};

// const setFoodSampleCoordinates = async (details) => {
//   try {
//     const address = [
//       details.address,
//       details.city,
//       details.state,
//       details.country,
//       details.postal_code
//     ].join(",");

//     const coordinates = (await geocoder.geocode(address))[0];

//     details.latitude = coordinates.latitude;
//     details.longitude = coordinates.longitude;
//     details.coordinates = gis.setSRID(gis.makePoint(coordinates.longitude, coordinates.latitude), 4326);
//   } catch (error) {
//     console.log(error);
//   }
// }

// Save application from multi-step form to applications table helper function
const saveHostApplication = async (hostDto, user) => {
  let dbUser = null;

  if (user) {
    dbUser = await getUserById(user.id);
  }

  if (dbUser == null || !dbUser.success) {
    dbUser = await getUserByPassportIdOrEmail(hostDto.email);
  }

  hostDto.dbUser = dbUser;

  return await db.transaction(async (trx) => {
    await saveApplicationInformation(hostDto, trx);

    if (hostDto.menu_list) {
      await saveSpecials(hostDto);
    }

    await sendApplierEmailForHosting(dbUser);

    return { success: true };
  });
};

const sendHostApplicationEmails = async (dbUser, documents) => {
  const applier = {
    user_id: dbUser.user.tasttlig_user_id,
    last_name: dbUser.user.last_name,
    first_name: dbUser.user.first_name,
    email: dbUser.user.email,
    documents: documents,
  };

  await sendAdminEmailForHosting(applier);

  await sendApplierEmailForHosting(dbUser);
};

const updateHostUser = async (hostDto) => {
  const dbUser = hostDto.dbUser;

  if (
    hostDto.first_name !== dbUser.user.first_name ||
    hostDto.last_name !== dbUser.user.last_name ||
    formatPhone(hostDto.phone_number) !== dbUser.user.phone
  ) {
    dbUser.user.first_name = hostDto.first_name;
    dbUser.user.last_name = hostDto.last_name;
    dbUser.user.phone = formatPhone(hostDto.phone_number);
    await updateUserAccount(dbUser.user);
  }
};

// Save Kodidi specials helper function
const saveSpecials = async (hostDto) => {
  const specials = hostDto.menu_list
    .filter((m) => m.special)
    .map((m) => ({
      special_id: m.special,
      special_description: m.menuDescription,
      special_img_url: m.menuImages[0],
      address: m.menuAddressLine1,
      city: m.menuCity,
      state: m.menuProvinceTerritory,
      postal_code: m.menuPostalCode,
    }));

  if (specials && specials.length) {
    await external_api_service.saveKodidiSpecials({
      email: hostDto.email,
      specials,
    });
  }
};

module.exports = {
  getUserById,
  getUserBySubscriptionId,
  upgradeUserResponse,
  updateUserAccount,
  updateUserProfile,
  getUserByEmail,
  getUserByEmailWithSubscription,
  getUserByPassportId,
  getUserByPassportIdOrEmail,
  sendAdminEmailForHosting,
  sendApplierEmailForHosting,
  sendNewUserEmail,
  handleAction,
  approveOrDeclineHostApplication,
  saveHostApplication,
  saveSponsorForUser,
  saveBusinessForUser,
  saveMenuItems,
  saveAssets,
  saveSampleLinks,
  saveVenueInformation,
  saveSpecials,
  saveDocuments,
  saveSocialProof,
  savePaymentInformation,
  saveBusinessServices,
};
