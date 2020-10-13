"use strict";

const authenticate_user_service = require("../authentication/authenticate_user");

const {db} = require("../../db/db-config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Mailer = require("../email/nodemailer").nodemailer_transporter;
const role_manager = require("./user_roles_manager");
const {setAddressCoordinates} = require("../geocoder");
const {formatPhone, generateRandomString} = require("../../functions/functions");

const SITE_BASE = process.env.SITE_BASE;
const ADMIN_EMAIL = process.env.TASTTLIG_ADMIN_EMAIL;
const EMAIL_SECRET = process.env.EMAIL_SECRET;

const getUserById = async id => {
  return await db("tasttlig_users")
    .where("tasttlig_user_id", id)
    .first()
    .then(value => {
      if (!value) {
        return {success: false, message: "No user found."};
      }
      return {success: true, user: value};
    })
    .catch(error => {
      return {success: false, message: error};
    });
};

const getUserBySubscriptionId = async id => {
  return await db("tasttlig_users")
    .where("tasttlig_user_id", id)
    .first()
    .leftJoin(
      "user_subscriptions",
      "tasttlig_users.tasttlig_user_id",
      "user_subscriptions.user_id"
    )
    .then(value => {
      if (!value) {
        return {success: false, message: "No user found."};
      }
      return {success: true, user: value};
    })
    .catch(error => {
      return {success: false, message: error};
    });
};

const updateUserAccount = async user => {
  try {
    return await db("tasttlig_users")
      .where("tasttlig_user_id", user.id)
      .first()
      .update({
        first_name: user.first_name,
        last_name: user.last_name,
        password: user.password,
        phone_number: user.phone_number,
        profile_image_link: user.profile_image_link,
        profile_tag_line: user.profile_tag_line,
        bio_text: user.bio_text,
        banner_image_link: user.banner_image_link
      })
      .returning("*")
      .then(value => {
        return {success: true, details: value[0]};
      })
      .catch(reason => {
        return {success: false, details: reason};
      });
  } catch (err) {
    return {success: false, message: err};
  }
};

const updateUserProfile = async user => {
  try {
    return await db("tasttlig_users")
      .where("tasttlig_user_id", user.id)
      .first()
      .update({
        user_address_line_1: user.address_line_1,
        user_address_line_2: user.address_line_2,
        user_city: user.city,
        user_postal_code: user.postal_code,
        user_state: user.state,
        address_type: user.address_type,
        business_name: user.business_name,
        business_type: user.business_type,
        profile_status: user.profile_status
      })
      .returning("*")
      .then(value => {
        return {success: true, details: value[0]};
      })
      .catch(reason => {
        return {success: false, details: reason};
      });
  } catch (err) {
    return {success: false, message: err};
  }
};

const saveBusinessForUser = async (hostDto, trx) => {
  const businessInfo = {
    user_id: hostDto.dbUser.user.tasttlig_user_id,
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
    phone_number: hostDto.phone_number,
    business_registration_number: hostDto.registration_number,
    instagram: hostDto.instagram,
    facebook: hostDto.facebook
  };

  const response = await trx('business_details')
    .insert(businessInfo)
    .returning("*");

  return {success: true, details: response[0]};
}

const saveBusinessServices = async (hostDto, trx) => {
  const businessServices = hostDto.services.map(serviceName => ({
    user_id: hostDto.dbUser.user.tasttlig_user_id,
    name: serviceName
  }));

  const response = await trx('business_services')
    .insert(businessServices)
    .returning("*");

  return {success: true, details: response[0]};
}

const saveHostingInformation = async (hostDto, trx) => {
  const hostInfo = {
    user_id: hostDto.dbUser.user.tasttlig_user_id,
    video_link: hostDto.host_selection_video,
    youtube_link: hostDto.youtube_link,
    reason: hostDto.host_selection,
    created_at: new Date(),
    updated_at: new Date(),
    status: "Pending"
  };

  return trx('applications')
    .insert(hostInfo)
    .returning('*')
}

const savePaymentInformation = async (hostDto, trx) => {
  let paymentInfo = {
    payment_type: hostDto.banking,
    user_id: hostDto.dbUser.user.tasttlig_user_id
  };

  if (paymentInfo.payment_type === "Bank") {
    paymentInfo = {
      ...paymentInfo,
      bank_number: hostDto.bank_number,
      account_number: hostDto.account_number,
      institution_number: hostDto.institution_number,
      void_cheque: hostDto.void_cheque,
    }
  } else if (paymentInfo.payment_type === "Paypal") {
    paymentInfo = {
      ...paymentInfo,
      paypal_email: hostDto.paypal_email
    }
  } else if (paymentInfo.payment_type === "Stripe") {
    paymentInfo = {
      ...paymentInfo,
      stripe_account_number: hostDto.stripe_account
    }
  } else {
    paymentInfo = {
      ...paymentInfo,
      etransfer_email: hostDto.online_email
    }
  }

  return trx('payment_info')
    .insert(paymentInfo)
    .returning('*')
}

const saveDocuments = async (hostDto, trx) => {
  const documents = [['food_handler_certificate', 'Food Handler Certificate'],
    ['insurance', 'Insurance'],
    ['dine_safe_certificate', 'Dine Safe Certificate'],
    ['health_safety_certificate', 'Health and Safety Certificate'],
    ['government_id', 'Government ID']]
    .filter(doc => hostDto[doc[0]] && hostDto[doc[0] + '_date_of_issue'] && hostDto[doc[0] + '_date_of_expired'])
    .map(doc => ({
      user_id: hostDto.dbUser.user.tasttlig_user_id,
      document_type: doc[1],
      issue_date: new Date(hostDto[doc[0] + '_date_of_issue']),
      expiry_date: new Date(hostDto[doc[0] + '_date_of_expired']),
      document_link: hostDto[doc[0]],
      status: "Pending"
    }))

  await trx("documents")
    .insert(documents)
    .returning("*");

  return documents;
}

const saveSocialProof = async (hostDto, trx) => {
  const reviews = ["yelp",
    "google",
    "tripadvisor",
    "instagram",
    "youtube"
  ].filter(w => hostDto[`${w}_review`])
    .map(w => ({
      user_id: hostDto.dbUser.user.tasttlig_user_id,
      platform: w,
      link: hostDto[`${w}_review`]
    }))

  if (hostDto.media_recognition) {
    reviews.push({
      user_id: hostDto.dbUser.user.tasttlig_user_id,
      platform: "media recognition",
      link: hostDto.media_recognition
    });
  }

  if (hostDto.personal_review) {
    reviews.push({
      user_id: hostDto.dbUser.user.tasttlig_user_id,
      platform: "personal",
      text: hostDto.personal_review
    });
  }

  return trx("external_review")
    .insert(reviews)
    .returning("*");
}

const saveMenuItems = async (hostDto, trx) => {
  for (const m of hostDto.menu_list.map(m => ({
    images: m.menuImages,
    title: m.menuName,
    nationality_id: m.menuNationality,
    start_date: new Date(m.menuStartDate),
    end_date: new Date(m.menuEndDate),
    start_time: new Date(m.menuStartTime).toLocaleTimeString(),
    end_time: new Date(m.menuEndTime).toLocaleTimeString(),
    price: m.menuPrice,
    quantity: m.menuQuantity,
    spice_level: m.menuSpiceLevel,
    frequency: m.menuFrequency,
    food_sample_type: m.menuType,
    description: m.menuDescription,
    address: m.menuAddressLine1,
    city: m.menuCity,
    state: m.menuProvinceTerritory,
    postal_code: m.menuPostalCode,
    is_vegetarian: m.dietaryRestrictions.includes("vegetarian"),
    is_vegan: m.dietaryRestrictions.includes("vegan"),
    is_gluten_free: m.dietaryRestrictions.includes("glutenFree"),
    is_halal: m.dietaryRestrictions.includes("halal"),
    menu_item_creator_user_id: hostDto.dbUser.user.tasttlig_user_id
  }))) {
    const {images, ...menuItem} = m;

    await setAddressCoordinates(menuItem);

    const result = await trx("menu_items").insert(menuItem).returning("*");
    await trx("menu_item_images").insert(images.map(i => ({
      menu_item_id: result[0].menu_item_id,
      image_url: i
    })));
  }
}

const saveSampleLinks = async (hostDto, trx) => {
  const sampleLinks = hostDto.sample_links.map(l => ({
    user_id: hostDto.dbUser.user.tasttlig_user_id,
    media_link: l
  }));
  return trx("entertainment")
    .insert(sampleLinks)
    .returning("*");
}

const saveVenueInformation = async (hostDto, trx) => {
  const response = await trx("venue")
    .insert({
      user_id: hostDto.dbUser.user.tasttlig_user_id,
      name: hostDto.venue_name,
      description: hostDto.venue_description
    })
    .returning("*");

  const photos = hostDto.venue_photos.map(p => ({
    venue_id: response[0].venue_id,
    image_url: p
  }))

  return trx("venue_images")
    .insert(photos)
    .returning("*");
}

const sendAdminEmailForHosting = async (user_info) => {
  const document_approve_token = jwt.sign(
    {
      user_id: user_info.user_id,
      status: "APPROVED"
    },
    EMAIL_SECRET
  );
  const document_reject_token = jwt.sign(
    {
      user_id: user_info.user_id,
      status: "REJECT"
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
    }
  })
}

const sendApplierEmailForHosting = async (db_user) => {
  // Email to user on submitting the request to upgrade
  await Mailer.sendMail({
    from: process.env.SES_DEFAULT_FROM,
    to: db_user.user.email,
    subject: `[Tasttlig] Thank you for your application`,
    template: "user_upgrade_request",
    context: {
      first_name: db_user.first_name,
      last_name: db_user.last_name
    }
  });
}

const sendNewUserEmail = async (new_user) => {
  // Email to new user with login details and password reset link
  const email = new_user.email;
  jwt.sign(
    {email},
    process.env.EMAIL_SECRET,
    {
      expiresIn: "7d"
    },
    // Async reset password email
    async (err, emailToken) => {
      try {
        const url = `${SITE_BASE}/forgot-password/${emailToken}/${email}`;
        await Mailer.sendMail({
          from: process.env.SES_DEFAULT_FROM,
          to: email,
          subject: `[Tasttlig] Thank you for your application`,
          template: "new_application_user_account",
          context: {
            first_name: new_user.first_name,
            last_name: new_user.last_name,
            email: email,
            password: new_user.plain_password,
            url: url
          }
        });
        return {
          success: true,
          message: "ok"
        };
      } catch (err) {
        return {
          success: false,
          message: "error",
          response: "Error in sending email"
        }
      }
    }
  );
}

const upgradeUserResponse = async token => {
  try {
    const decrypted_token = jwt.verify(token, EMAIL_SECRET);
    const document_id = decrypted_token.document_id;
    const status = decrypted_token.status;

    const db_document = await db("documents")
      .where("document_id", document_id)
      .update("status", status)
      .returning("*")
      .catch(reason => {
        return {success: false, message: reason};
      });

    const document_user_id = db_document[0].user_id;
    return approveOrDeclineHostApplication(document_user_id, status)
  } catch (err) {
    return {success: false, message: err};
  }
};

// handleAction is the function that when tasttlig admin click the approve link
const handleAction = async token => {
  try {
    const decrypted_token = jwt.verify(token, EMAIL_SECRET);
    const user_id = decrypted_token.user_id;
    const status = decrypted_token.status;
    return approveOrDeclineHostApplication(user_id, status)
  } catch (err) {
    return {success: false, message: err};
  }
};

const approveOrDeclineHostApplication = async (userId, status, declineReason) => {
  try {
    const db_user_row = await getUserById(userId);

    if (!db_user_row.success) {
      return {success: false, message: db_user_row.message};
    }
    const db_user = db_user_row.user;

    // depends on status, we do different things:
    // if status is approved
    if (status === 'APPROVED') {
      // STEP 1: change the role column in tasttlig_user table
      let user_role_object = role_manager.createRoleObject(db_user.role);
      user_role_object = role_manager.removeRole(
        user_role_object,
        "RESTAURANT_PENDING"
      );
      user_role_object = role_manager.addRole(user_role_object, "RESTAURANT");
      await db("tasttlig_users")
        .where("tasttlig_user_id", db_user.tasttlig_user_id)
        .update("role", role_manager.createRoleString(user_role_object));

      // STEP 2: Update all Experiences to Active state
      await db("experiences")
        .where({
          experience_creator_user_id: db_user.tasttlig_user_id,
          status: "INACTIVE"
        })
        .update("status", "ACTIVE");

      // STEP 3: Update all Food Samples to Active state if the user agreed to participate in festival
      if (db_user.is_participating_in_festival) {
        await db("food_samples")
          .where({
            food_sample_creater_user_id: db_user.tasttlig_user_id,
            status: "INACTIVE"
          })
          .update("status", "ACTIVE");
      }

      // STEP 4: Update all documents belongs to this user which is in Pending state become APPROVE
      await db("documents")
        .where("user_id", db_user.tasttlig_user_id)
        .andWhere("status", 'Pending')
        .update("status", 'APPROVED')
        .returning("*")
        .catch(reason => {
          return {success: false, message: reason};
        });

      // STEP 5: Update Application table status
      await db("applications")
        .where("user_id", db_user.tasttlig_user_id)
        .andWhere("status", 'Pending')
        .update("status", 'APPROVED')
        .returning("*")
        .catch(reason => {
          return {success: false, message: reason};
        });

      // STEP 6: email the user that their application is approved
      await Mailer.sendMail({
        from: process.env.SES_DEFAULT_FROM,
        to: db_user.email,
        subject: `[Tasttlig] Your request for upgradation to Host is accepted`,
        template: "user_upgrade_approve",
        context: {
          first_name: db_user.first_name,
          last_name: db_user.last_name
        }
      });
    } else {
      // status is Failed
      // STEP 1: remove the RESTAURANT_PENDING role
      let user_role_object = role_manager.createRoleObject(db_user.role);
      user_role_object = role_manager.removeRole(
        user_role_object,
        "RESTAURANT_PENDING"
      );

      await db("tasttlig_users")
        .where("tasttlig_user_id", db_user.tasttlig_user_id)
        .update("role", role_manager.createRoleString(user_role_object));

      // STEP 2: Update all documents belongs to this user which is in Pending state become REJECT
      await db("documents")
        .where("user_id", db_user.tasttlig_user_id)
        .andWhere("status", 'Pending')
        .update("status", 'REJECT')
        .returning("*")
        .catch(reason => {
          return {success: false, message: reason};
        });

      // STEP 3: Update Application table status
      await db("applications")
        .where("user_id", db_user.tasttlig_user_id)
        .andWhere("status", 'Pending')
        .update("status", 'REJECT')
        .returning("*")
        .catch(reason => {
          return {success: false, message: reason};
        });

      // STEP 4: notify user their application is reject
      await Mailer.sendMail({
        from: process.env.SES_DEFAULT_FROM,
        to: db_user.email,
        subject: `[Tasttlig] Your request for upgradation to Host is rejected`,
        template: "user_upgrade_reject",
        context: {
          first_name: db_user.first_name,
          last_name: db_user.last_name,
          declineReason
        }
      });
      return {success: true, message: status};
    }
  } catch (e) {
    return {success: false, message: e};
  }
}

const getUserByEmail = async email => {
  return await db("tasttlig_users")
    .where("email", email)
    .first()
    .then(value => {
      if (!value) {
        return {success: false, message: "No user found."};
      }
      return {success: true, user: value};
    })
    .catch(error => {
      return {success: false, message: error};
    });
};

const getUserByEmailWithSubscription = async email => {
  return await db("tasttlig_users")
    .where("email", email)
    .first()
    .leftJoin(
      "user_subscriptions",
      "tasttlig_users.tasttlig_user_id",
      "user_subscriptions.user_id"
    )
    .where("user_subscriptions.subscription_end_datetime", ">", new Date())
    .then(value => {
      if (!value) {
        return {success: false, message: "No user found."};
      }
      return {success: true, user: value};
    })
    .catch(error => {
      return {success: false, message: error};
    });
};

const getUserByPassportId = async passport_id => {
  return await db("tasttlig_users")
    .where("passport_id", passport_id)
    .first()
    .then(value => {
      if (!value) {
        return {success: false, message: "No user found."};
      }
      return {success: true, user: value};
    })
    .catch(error => {
      return {success: false, message: error};
    });
}

const getUserByPassportIdOrEmail = async passport_id_or_email => {
  return await db("tasttlig_users")
    .where("email", passport_id_or_email)
    .orWhere({passport_id: passport_id_or_email})
    .first()
    .then(value => {
      if (!value) {
        return {success: false, message: "No user found."};
      }
      return {success: true, user: value};
    })
    .catch(error => {
      return {success: false, message: error};
    });
}

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
//   } catch (e) {
//     console.log(e);
//   }
// }

const saveHostApplication = async (hostDto, user) => {
  let dbUser = null;
  let plain_password = "";

  if (user) {
    dbUser = await getUserById(user.id);
  }

  if (dbUser == null || !dbUser.success) {
    dbUser = await getUserByPassportIdOrEmail(hostDto.email);
  }

  if (dbUser == null || !dbUser.success) {
    plain_password = generateRandomString(8);
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(plain_password, salt);
    const become_food_provider_user = {
      first_name: hostDto.first_name,
      last_name: hostDto.last_name,
      plain_password: plain_password,
      password: hashedPassword,
      email: hostDto.email,
      phone_number: hostDto.phone_number,
      user_address_line_1: hostDto.residential_address_line_1,
      user_address_line_2: hostDto.residential_address_line_2,
      user_city: hostDto.residential_city,
      user_state: hostDto.residential_state,
      user_postal_code: hostDto.residential_postal_code,
    }
    dbUser = await authenticate_user_service
      .createBecomeFoodProviderUser(become_food_provider_user);

    if (!dbUser.success) {
      return {success: false}
    }

    await sendNewUserEmail(become_food_provider_user);
  }
  hostDto.dbUser = dbUser;
  await updateHostUser(hostDto);

  return await db.transaction(async trx => {
    const has_business = hostDto.has_business === "yes";

    if (has_business) {
      await saveBusinessForUser(hostDto, trx);
    }

    await saveBusinessServices(hostDto, trx);
    await saveHostingInformation(hostDto, trx);
    await savePaymentInformation(hostDto, trx);
    await saveSocialProof(hostDto, trx);
    await saveVenueInformation(hostDto, trx);

    const documents = await saveDocuments(hostDto, trx);

    if (has_business) {
      if (hostDto.business_category === "Food") {
        await saveMenuItems(hostDto, trx);
      } else if (
        hostDto.business_category === "Entertainment" ||
        hostDto.business_category === "MC") {
        await saveSampleLinks(hostDto, trx);
      }
    }

    await sendHostApplicationEmails(dbUser, documents);

    return {success: true};
  });
}

const sendHostApplicationEmails = async (dbUser, documents) => {
  const applier = {
    user_id: dbUser.user.tasttlig_user_id,
    last_name: dbUser.user.last_name,
    first_name: dbUser.user.first_name,
    email: dbUser.user.email,
    documents: documents
  };

  await sendAdminEmailForHosting(applier)
  await sendApplierEmailForHosting(dbUser);
}

const updateHostUser = async (hostDto) => {
  const dbUser = hostDto.dbUser;
  if (hostDto.first_name !== dbUser.user.first_name ||
    hostDto.last_name !== dbUser.user.last_name ||
    formatPhone(hostDto.phone_number) !== dbUser.user.phone
  ) {
    dbUser.user.first_name = hostDto.first_name
    dbUser.user.last_name = hostDto.last_name
    dbUser.user.phone = formatPhone(hostDto.phone_number)
    await updateUserAccount(dbUser.user);
  }
}

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
  saveHostApplication
};
