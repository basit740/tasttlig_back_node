"use strict";

// Libraries
const { db } = require("../../db/db-config");
const Mailer = require("../email/nodemailer").nodemailer_transporter;
const festival_service = require("../../services/festival/festival");
const user_profile_service = require("../../services/profile/user_profile");
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
        .where("applications.type", "=", "vendor")
        .groupBy("applications.application_id")
        .groupBy("tasttlig_users.tasttlig_user_id")
        .groupBy("business_details.business_details_id")
        .having("applications.status", "=", "Pending");
  
      return {
        success: true,
        applications,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

// get all applications send to specific host using hostId
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
        .leftJoin(
          "festivals",
          "applications.festival_id",
          "festivals.festival_id"
        )
        .where("applications.type", "=", "vendor")
        .groupBy("applications.application_id")
        .groupBy("tasttlig_users.tasttlig_user_id")
        .groupBy("business_details.business_details_id")
        .groupBy("festivals.festival_id")
        .having("applications.status", "=", "Pending")
        .having("applications.receiver_id", "=", Number(hostId));
  
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
        }
      console.log("updated application status");
  
        return { success: true, message: status };
      } 
    } catch (error) {
      return { success: false, message: error };
    }
  };

  // host approve or decline vendor applicant on a specific festival
  const approveOrDeclineVendorApplicationOnFestival = async (
    festivalId,
    ticketPrice,
    userId,
    status,
    declineReason,
    Details
  ) => {
    try {
    //   console.log(preference);
      console.log("festivalId from approveOrDeclineVendorApplicationOnFestival: " , festivalId);
      console.log("ticketPrice from approveOrDeclineVendorApplicationOnFestival: " , ticketPrice);
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
  
      // get the festival info
      const festival = await festival_service.getFestivalDetails(
        festivalId
      );
      // get the host info
      const host = await user_profile_service.getUserById(
        festival.details[0].festival_host_admin_id[0]
      );

      // get the client info
      const client = await user_profile_service.getUserById(
        userId
      );
  
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
        .catch(() => {
          return { success: false };
        });     

        const application = await db("applications")
        .where("user_id", db_user.tasttlig_user_id)
        .andWhere("status", "Pending")
        .andWhere("type", "vendor")
        .andWhere("festival_id", festivalId)
        .returning("*")
        .catch(() => {
          return { success: false };
        });       
      // If status is approved
      if (status === "APPROVED") {
        console.log("table update pending", !(application.length === 0));
        // make sure the there is an application in the database with this applicant on this festival and is Pending 
        // add a timer to make sure the application has been created for more than 71 hours to avoid bug after demo June 30
        if (!(application.length === 0)){
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
            .catch(() => {
              return { success: false };
            });        

          // send notification mail to host 
          await Mailer.sendMail({
            from: process.env.SES_DEFAULT_FROM,
            to: (host.user.email + ""),
            subject: `[Tasttlig] New vendor applicant accpeted`,
            template: "vendor_applicant_timeout_notification",
            context: {
              first_name: (host.user.first_name + ""),
              last_name: (host.user.last_name + ""),
              client_first_name: (client.user.first_name + ""),
              client_last_name: (client.user.last_name + ""),
              festival_name: (festival.details[0].festival_name + ""),
            },
          });
           // send notification mail to client
          await Mailer.sendMail({
            from: process.env.SES_DEFAULT_FROM,
            to: (client.user.email + ""),
            subject: `[Tasttlig] Vendor application accepted`,
            template: "vendor_applicant_accept_notification",
            context: {
              first_name: (client.user.first_name + ""),
              last_name: (client.user.last_name + ""),
              host_first_name: (host.user.first_name + ""),
              host_last_name: (host.user.last_name + ""),
              festival_name: (festival.details[0].festival_name + ""),
              host_phone: (host.user.phone_number + ""),
            },
          });
        }
    
      console.log("updated application status");
  
        return { success: true, message: status };
      } 
      else {
        // else DECLINE the application
        await db("applications")
            .where("user_id", db_user.tasttlig_user_id)
            .andWhere("status", "Pending")
            .andWhere("type", "vendor")
            .andWhere("festival_id", festivalId)
            .update("status", "DECLINED")
            .returning("*")
            .catch((reason) => {
                return { success: false, message: reason };
            });
        // add ticketPrice to user credit

        // get the current user credit
        let user = await db("tasttlig_users")
        .where("tasttlig_user_id", userId)
        .returning("*")
        .catch(() => {
          return { success: false };
        });     
        // get the sum of tickprice and user credit
        let sum = Number(user[0].credit) + Number(ticketPrice);
        // console.log("credit: ", sum);
        // update the new credit
        await db("tasttlig_users")
          .where("tasttlig_user_id", userId)
          .update("credit", sum)
          .returning("*")
          .catch(() => {
            return { success: false };
          });     

        // deletes the corresponding ticket
        await db("ticket_details")
          .where("ticket_user_id", userId)
          .where("ticket_festival_id", festivalId)
          .where("ticket_type", "Vendor")
          .del()
          .returning("*")
          .catch(() => {
            return { success: false };
        });   

        // send a mail to clent for rejection
        await Mailer.sendMail({
          from: process.env.SES_DEFAULT_FROM,
          to: (client.user.email + ""),
          subject: `[Tasttlig] Vendor application rejected`,
          template: "vendor_applicant_reject_notification",
          context: {
            first_name: (client.user.first_name + ""),
            last_name: (client.user.last_name + ""),
            host_first_name: (host.user.first_name + ""),
            host_last_name: (host.user.last_name + ""),
            festival_name: (festival.details[0].festival_name + ""),
            host_phone: (host.user.phone_number + ""),
          },
        });
      }
    } catch (error) {
      return { success: false, message: error };
    }
  };



  module.exports = {
    getAllVendorApplications,
    getVendorApplications,
    getVendorApplicantDetails,
    approveOrDeclineHostVendorApplication,
    approveOrDeclineVendorApplicationOnFestival,
  };