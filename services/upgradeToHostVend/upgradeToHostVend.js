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
const _ = require("lodash");


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


// Save application information to applications table helper function
const upgradeApplication = async (data) => {
    let applications = [];
    let role_name = "";
    console.log("data", data);
 try{
        await db.transaction(async (trx) => {
            if (data.businessPreference === "Host") {
            applications.push({
                user_id: data.user_id,
                created_at: new Date(),
                updated_at: new Date(),
                reason: "host application",
                type: "host",
                status: "Pending",
            });
            role_name = "HOST_PENDING";
            }
        
            if (data.businessPreference === "Vend") {
                applications.push({
                user_id: data.user_id,
                created_at: new Date(),
                updated_at: new Date(),
                reason: "vendor application",
                type: "vendor",
                status: "Pending",
                });
                role_name = "VENDOR_PENDING";
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
            user_id: data.user_id,
            role_code: new_role_code,
            });

            await trx("business_details")
            .where("business_details_user_id", data.user_id)
            .update("business_preference", data.businessPreference)

            await trx("applications")
            .insert(applications);
            
            }
        );
          return { success: true, details: "Success." };

        } catch (error) {
            console.log("error:", error);
            return { success: false, details: error.message };
        };
  };



  // Get all applications helper function
const getAllVendorApplications = async () => {
    try {
      const applications = await db
        .select("*")
        .from("applications")
        .leftJoin(
          "tasttlig_users",
          "applications.user_id",
          "tasttlig_users.tasttlig_user_id"
        )
        .leftJoin(
          "business_details",
          "applications.user_id",
          "business_details.business_details_user_id"
        )
        // .leftJoin(
        //   "user_subscriptions",
        //   "tasttlig_users.tasttlig_user_id",
        //   "user_subscriptions.user_id"
        // )
        .where("applications.type", "=", "vendor")
        .groupBy("applications.application_id")
        .groupBy("tasttlig_users.tasttlig_user_id")
        // .groupBy("user_subscriptions.user_subscription_id")
        .groupBy("business_details.business_details_id")
        // .having("user_subscriptions.user_subscription_status", "=", "INACTIVE")
        .having("applications.status", "=", "Pending");
  
      return {
        success: true,
        applications,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

// FY: get all applications using hostId
  const getVendorApplications = async (hostId) => {
    try {
      const applications = await db
        .select("*")
        .from("applications")
        .leftJoin(
          "tasttlig_users",
          "applications.user_id",
          "tasttlig_users.tasttlig_user_id"
        )
        .leftJoin(
          "business_details",
          "applications.user_id",
          "business_details.business_details_user_id"
        )
        // .leftJoin(
        //   "user_subscriptions",
        //   "tasttlig_users.tasttlig_user_id",
        //   "user_subscriptions.user_id"
        // )
        .where("applications.type", "=", "vendor")
        .groupBy("applications.application_id")
        .groupBy("tasttlig_users.tasttlig_user_id")
        // .groupBy("user_subscriptions.user_subscription_id")
        .groupBy("business_details.business_details_id")
        // .having("user_subscriptions.user_subscription_status", "=", "INACTIVE")
        .having("applications.status", "=", "Pending")
        .having("receiver_id", "=", Number(hostId));
  
      return {
        success: true,
        applications,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const getVendorApplicantDetails = async (userId) => {
    try {
      console.log(userId);
      let application = await db
        .select(
          "business_details.*",
          "business_details_images.*",
          "tasttlig_users.*"
        )
        .from("business_details")
        .leftJoin(
          "tasttlig_users",
          "tasttlig_users.tasttlig_user_id",
          "business_details.business_details_user_id"
        )
  
        .leftJoin(
          "business_details_images",
          "business_details.business_details_id",
          "business_details_images.business_details_id"
        )
  
        .leftJoin(
          "user_role_lookup",
          "tasttlig_users.tasttlig_user_id",
          "user_role_lookup.user_id"
        )
  
        .groupBy("business_details_images.business_details_image_id")
        .groupBy("tasttlig_users.tasttlig_user_id")
        .groupBy("business_details.business_details_id")
        .groupBy("user_role_lookup.user_role_lookup_id")
        .having("tasttlig_users.tasttlig_user_id", "=", Number(userId))
        //FY: new flow does not require vendor applicant having vendor-inpending role assigned
        //.having("user_role_lookup.role_code", "=", "VSK2")
        .first();
  
      console.log(application);
  
      return {
        success: true,
        application,
      };
    } catch (error) {
      console.log(error);
      return { success: false, error: error.message };
    }
  };



  const approveOrDeclineHostVendorApplication = async (
    userId,
    status,
    declineReason, Details
  ) => {
    try {
      console.log("here DB entry");
    //   console.log(preference);
      console.log("DB user" , userId);
      console.log(Details)
      const db_user_row = await getUserById(userId);
    //   console.log("got db user")
      const db_user = db_user_row.user;
    //   console.log("user details", db_user);
      let preference = Details.application.business_preference;
      console.log('preferense', preference)
      let role = db_user.role;
      
  
      if (!db_user_row.success) {
        return { success: false, message: db_user_row.message };
      }
  
      
  
      // If status is approved
      if (status === "APPROVED") {

        if(preference=='Vend'){
            await db("applications")
            .where("user_id", db_user.tasttlig_user_id)
            .andWhere("status", "Pending")
            .andWhere("type", "vendor")
            .update("status", "APPROVED")
            .returning("*")
            .catch((reason) => {
                return { success: false, message: reason };
            });

            if(role.includes('BUSINESS_MEMBER_PENDING'))
            {
                await db("user_role_lookup")
                .where("user_id", db_user.tasttlig_user_id)
                .andWhere("role_code", "BMP1")
                .update("role_code", "BMA1")
                .catch((reason) => {
                    return { success: false, message: reason };
                });
            }

            if(role.includes('VENDOR_PENDING'))
            {
                await db("user_role_lookup")
                .where("user_id", db_user.tasttlig_user_id)
                .andWhere("role_code", "VSK2")
                .update("role_code", "VSK1")
                .catch((reason) => {
                    return { success: false, message: reason };
                });
            }
        }
        else if(preference=='Host'){
            await db("applications")
            .where("user_id", db_user.tasttlig_user_id)
            .andWhere("status", "Pending")
            .andWhere("type", "host")
            .update("status", "APPROVED")
            .returning("*")
            .catch((reason) => {
                return { success: false, message: reason };
            });

            if(role.includes('BUSINESS_MEMBER_PENDING'))
            {
                await db("user_role_lookup")
                .where("user_id", db_user.tasttlig_user_id)
                .andWhere("role_code", "BMP1")
                .update("role_code", "BMA1")
                .catch((reason) => {
                    return { success: false, message: reason };
                 });
            }

            if(role.includes('HOST_PENDING'))
            {
                await db("user_role_lookup")
                .where("user_id", db_user.tasttlig_user_id)
                .andWhere("role_code", "JUCR")
                .update("role_code", "KJ7D")
                .catch((reason) => {
                    return { success: false, message: reason };
                });
            }
        }
    
      console.log("updated application status");
  
        return { success: true, message: status };
      } else {

        if(preference=='Vend') 
        {
            // Remove the role for this user
            await db("user_role_lookup")
            .where({
                user_id: db_user.tasttlig_user_id,
                role_code: "VSK2",
            })
            .del();
            // STEP 3: Update applications table status
            await db("applications")
            .where("user_id", db_user.tasttlig_user_id)
            .andWhere("status", "Pending")
            .andWhere("type", "vendor")
            .update("status", "REJECT")
            .returning("*")
            .catch((reason) => {
                return { success: false, message: reason };
            });
        }
        if(preference=='Host') 
        {
            // Remove the role for this user
            await db("user_role_lookup")
            .where({
                user_id: db_user.tasttlig_user_id,
                role_code: "JUCR",
            })
            .del();
            // STEP 3: Update applications table status
            await db("applications")
            .where("user_id", db_user.tasttlig_user_id)
            .andWhere("status", "Pending")
            .andWhere("type", "host")
            .update("status", "REJECT")
            .returning("*")
            .catch((reason) => {
                return { success: false, message: reason };
            });
        }
  
        
        return { success: true, message: status };
      }
    } catch (error) {
      return { success: false, message: error };
    }
  };

  // host approve or decline vendor applicant on a specific festival
  const approveOrDeclineVendorApplicationOnFestival = async (
    festivalId,
    userId,
    status,
    declineReason,
    Details
  ) => {
    try {
    //   console.log(preference);
      console.log("festivalId from approveOrDeclineVendorApplicationOnFestival: " , festivalId);
      console.log("userId from approveOrDeclineVendorApplicationOnFestival: " , userId);
      console.log("status from approveOrDeclineVendorApplicationOnFestival: " , status);
      console.log("declineReason from approveOrDeclineVendorApplicationOnFestival: " , declineReason);
      console.log("Details from approveOrDeclineVendorApplicationOnFestival: " , Details);

      const db_user_row = await getUserById(userId);
    //   console.log("got db user")
      const db_user = db_user_row.user;
    //   console.log("user details", db_user);
      let preference = Details.application.business_preference;
      console.log('preferense', preference)
      let role = db_user.role;
      
  
      if (!db_user_row.success) {
        return { success: false, message: db_user_row.message };
      }
  
      // remove vendor from vendor_request_id
      await db("festivals")
            .where("festival_id", festivalId)
            .update({
               vendor_request_id: db.raw(
                 "array_remove(vendor_request_id, ?)",
                 [db_user.tasttlig_user_id]
               ),
               
            })
            .returning("*")
            .catch((reason) => {
              console.log("reason for rejection:", reason)
              return { success: false, message: reason };
            });   
  
      // If status is approved
      if (status === "APPROVED") {
        // update the applications table
        await db("applications")
            .where("user_id", db_user.tasttlig_user_id)
            .andWhere("status", "Pending")
            .andWhere("type", "vendor")
            .andWhere("festival_id", festivalId)
            .update("status", "APPROVED")
            .returning("*")
            .catch((reason) => {
                return { success: false, message: reason };
            });
          // add the user to fesstival
          await db("festivals")
            .where("festival_id", festivalId)
            .update({
               festival_vendor_id: db.raw(
                 "array_append(festival_vendor_id, ?)",
                 [db_user.tasttlig_user_id]
               ),
               
            })
            .returning("*")
            .catch((reason) => {
              console.log("reason for rejection:", reason)
              return { success: false, message: reason };
            });     
        if(preference=='Vend'){
            await db("applications")
            .where("user_id", db_user.tasttlig_user_id)
            .andWhere("status", "Pending")
            .andWhere("type", "vendor")
            .update("status", "APPROVED")
            .returning("*")
            .catch((reason) => {
                return { success: false, message: reason };
            });

            if(role.includes('BUSINESS_MEMBER_PENDING'))
            {
                await db("user_role_lookup")
                .where("user_id", db_user.tasttlig_user_id)
                .andWhere("role_code", "BMP1")
                .update("role_code", "BMA1")
                .catch((reason) => {
                    return { success: false, message: reason };
                });
            }

            if(role.includes('VENDOR_PENDING'))
            {
                await db("user_role_lookup")
                .where("user_id", db_user.tasttlig_user_id)
                .andWhere("role_code", "VSK2")
                .update("role_code", "VSK1")
                .catch((reason) => {
                    return { success: false, message: reason };
                });

          // STEP 6: Email the user that their application is approved
              await Mailer.sendMail({
                from: process.env.SES_DEFAULT_FROM,
                to: db_user.email,
                subject: `[Tasttlig] Your request for upgradation to ${preference} is accepted`,
                template: "user_upgrade_approve",
                context: {
                  first_name: db_user.first_name,
                  last_name: db_user.last_name,
                  role_name: preference,
                },
              });
            }
        }
        else if(preference=='Host'){
            await db("applications")
            .where("user_id", db_user.tasttlig_user_id)
            .andWhere("status", "Pending")
            .andWhere("type", "host")
            .update("status", "APPROVED")
            .returning("*")
            .catch((reason) => {
                return { success: false, message: reason };
            });

            if(role.includes('BUSINESS_MEMBER_PENDING'))
            {
                await db("user_role_lookup")
                .where("user_id", db_user.tasttlig_user_id)
                .andWhere("role_code", "BMP1")
                .update("role_code", "BMA1")
                .catch((reason) => {
                    return { success: false, message: reason };
                 });
            }

            if(role.includes('HOST_PENDING'))
            {
                await db("user_role_lookup")
                .where("user_id", db_user.tasttlig_user_id)
                .andWhere("role_code", "JUCR")
                .update("role_code", "KJ7D")
                .catch((reason) => {
                    return { success: false, message: reason };
                });
            }
        }
    
      console.log("updated application status");
  
        return { success: true, message: status };
      } else {

        if(preference=='Vend') 
        {
            // Remove the role for this user
            await db("user_role_lookup")
            .where({
                user_id: db_user.tasttlig_user_id,
                role_code: "VSK2",
            })
            .del();
            // STEP 3: Update applications table status
            await db("applications")
            .where("user_id", db_user.tasttlig_user_id)
            .andWhere("status", "Pending")
            .andWhere("type", "vendor")
            .update("status", "REJECT")
            .returning("*")
            .catch((reason) => {
                return { success: false, message: reason };
            });


          // STEP 6: Email the user that their application is approved
        // STEP 4: Notify user their application is rejected
          await Mailer.sendMail({
            from: process.env.SES_DEFAULT_FROM,
            to: db_user.email,
            subject: `[Tasttlig] Your request for upgradation to ${preference} is rejected`,
            template: "user_upgrade_reject",
            context: {
              first_name: db_user.first_name,
              last_name: db_user.last_name,
              declineReason,
            },
          });

        }
        if(preference=='Host') 
        {
            // Remove the role for this user
            await db("user_role_lookup")
            .where({
                user_id: db_user.tasttlig_user_id,
                role_code: "JUCR",
            })
            .del();
            // STEP 3: Update applications table status
            await db("applications")
            .where("user_id", db_user.tasttlig_user_id)
            .andWhere("status", "Pending")
            .andWhere("type", "host")
            .update("status", "REJECT")
            .returning("*")
            .catch((reason) => {
                return { success: false, message: reason };
            });
        }
  
        
        return { success: true, message: status };
      }
    } catch (error) {
      return { success: false, message: error };
    }
  };



  module.exports = {
    upgradeApplication,
    getAllVendorApplications,
    getVendorApplications,
    getVendorApplicantDetails,
    approveOrDeclineHostVendorApplication,
    approveOrDeclineVendorApplicationOnFestival,
  };