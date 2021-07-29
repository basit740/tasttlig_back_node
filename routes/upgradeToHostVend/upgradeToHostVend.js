"use strict";

// Libraries
const router = require("express").Router();
const token_service = require("../../services/authentication/token");
const user_profile_service = require("../../services/profile/user_profile");
const authenticate_user_service = require("../../services/authentication/authenticate_user");
const authentication_service = require("../../services/authentication/authenticate_user");
const upgrade_service = require("../../services/upgradeToHostVend/upgradeToHostVend");
const host_service = require("../../services/hosts/hosts");
const festival_service = require("../../services/festival/festival");
const Mailer = require("../../services/email/nodemailer").nodemailer_transporter;



router.get(
    "/host-application/:userId",
    token_service.authenticateToken,
    async (req, res) => {
      try {
        const applications = await host_service.getHostApplicantDetails(
          req.params.userId
        );
  
        return res.send(applications);
      } catch (error) {
        console.log(error);
        res.status(500).send({
          success: false,
          message: error.message,
        });
      }
    }
  );

  router.get(
    "/vendor-application/:userId",
    token_service.authenticateToken,
    async (req, res) => {
      try {
        const applications = await upgrade_service.getVendorApplicantDetails(
          req.params.userId
        );
  
        return res.send(applications);
      } catch (error) {
        console.log(error);
        res.status(500).send({
          success: false,
          message: error.message,
        });
      }
    }
  );

  router.get(
    "/sponsor-application/:userId",
    token_service.authenticateToken,
    async (req, res) => {
      try {
        const applications = await upgrade_service.getSponsorApplicantDetails(
          req.params.userId
        );
  
        return res.send(applications);
      } catch (error) {
        console.log(error);
        res.status(500).send({
          success: false,
          message: error.message,
        });
      }
    }
  );

  router.get(
    "/partner-application/:userId",
    token_service.authenticateToken,
    async (req, res) => {
      try {
        const applications = await upgrade_service.getPartnerApplicantDetails(
          req.params.userId
        );
  
        return res.send(applications);
      } catch (error) {
        console.log(error);
        res.status(500).send({
          success: false,
          message: error.message,
        });
      }
    }
  );

  router.get(
    "/partner-applications/:userId",
    token_service.authenticateToken,
    async (req, res) => {
      try {
        const applications = await upgrade_service.getPartnerApplications(
          req.params.userId
        );
  
        return res.send(applications);
      } catch (error) {
        console.log(error);
        res.status(500).send({
          success: false,
          message: error.message,
        });
      }
    }
  );


  router.get(
    "/all-vendor-applications",
    token_service.authenticateToken,
    async (req, res) => {
      try {
        const applications = await upgrade_service.getAllVendorApplications();
        console.log("response from here:", applications);
        return res.send(applications);
      } catch (error) {
        res.status(500).send({
          success: false,
          message: error.message,
        });
      }
    }
  );

  // fetching vendor applications for specific host
  router.get(
    "/vendor-applications/:hostId",
    token_service.authenticateToken,
    async (req, res) => {
      try {
        const applications = await upgrade_service.getVendorApplications(
          req.params.hostId
        );
        return res.send(applications);
      } catch (error) {
        res.status(500).send({
          success: false,
          message: error.message,
        });
      }
    }
  );

  // fetching sponsor applications for specific host
  router.get(
    "/sponsor-applications/:hostId",
    token_service.authenticateToken,
    async (req, res) => {
      try {
        const applications = await upgrade_service.getSponsorApplications(
          req.params.hostId
        );
        return res.send(applications);
      } catch (error) {
        res.status(500).send({
          success: false,
          message: error.message,
        });
      }
    }
  );
  


  // POST vendor approval from admin
router.post(
    "/vendor-applications/:userId/approve",
    token_service.authenticateToken,
    async (req, res) => {
      try {
        // console.log("here rest");
        const Details = await upgrade_service.getVendorApplicantDetails(
          req.params.userId
        );
  
        // console.log("business details after approval:", businessDetails.application)
  
        const response = await upgrade_service.approveOrDeclineHostVendorApplication(
          req.params.userId,
          "APPROVED",
          "",
          Details
        );
  
        return res.send(response);
      } catch (error) {
        res.status(500).send({
          success: false,
          message: error.message,
        });
      }
    }
  );

// POST vendor approval from timer
router.post(
  "/vendor-application-timer/:festivalId/:ticketPrice/:userId/approve",
  token_service.authenticateToken,
  async (req, res) => {
    try {
      const Details = await upgrade_service.getVendorApplicantDetails(
        req.params.userId
      );
        // get the festival info
      const festival = await festival_service.getFestivalDetails(
        req.params.festivalId
      );
      // get the host info
      const host = await user_profile_service.getUserById(
        festival.details[0].festival_host_admin_id[0]
       );

       // get the client info
      const client = await user_profile_service.getUserById(
        req.params.userId
       );

       console.log("mail for host", host.user.email);
       // send a mail to the host
       await Mailer.sendMail({
        from: process.env.SES_DEFAULT_FROM,
        to: (host.user.email + ""),
        subject: `[Tasttlig] Your have a new vendor applicant`,
        template: "vendor_applicant_notification",
        context: {
          first_name: (host.user.first_name + ""),
          last_name: (host.user.last_name + ""),
          client_first_name: (client.user.first_name + ""),
          client_last_name: (client.user.last_name + ""),
          festival_name: (festival.details[0].festival_name + ""),
        },
      });

      // set a timer to accept applicant 
      setTimeout(() => {upgrade_service.approveOrDeclineVendorApplicationOnFestival(
        req.params.festivalId,
        req.params.ticketPrice,
        req.params.userId,
        "APPROVED",
        "",
        Details)
      
      }, 60 * 60* 1000
      );

    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message,
      });
    }
  }
);

  // POST vendor approval from host
  router.post(
    "/vendor-applications/:festivalId/:ticketPrice/:userId/approve",
    token_service.authenticateToken,
    async (req, res) => {
      try {
        const Details = await upgrade_service.getVendorApplicantDetails(
          req.params.userId
        );
  
        const response = await upgrade_service.approveOrDeclineVendorApplicationOnFestival(
          req.params.festivalId,
          req.params.ticketPrice,
          req.params.userId,
          "APPROVED",
          "",
          Details
        );
  
        return res.send(response);
      } catch (error) {
        res.status(500).send({
          success: false,
          message: error.message,
        });
      }
    }
  );

  
  // POST vendor applicant decline from host
  router.post(
    "/vendor-applications/:festivalId/:ticketPrice/:userId/decline",
    token_service.authenticateToken,
    async (req, res) => {
      try {
        const Details = await upgrade_service.getVendorApplicantDetails(
          req.params.userId
        );
        const response = await upgrade_service.approveOrDeclineVendorApplicationOnFestival(
          req.params.festivalId,
          req.params.ticketPrice,
          req.params.userId,
          "DECLINED",
          "",
          Details
        );
  
        return res.send(response);
      } catch (error) {
        res.status(500).send({
          success: false,
          message: error.message,
        });
      }
    }
  );

  // POST sponsor approval from timer
router.post(
  "/sponsor-application-timer/:festivalId/:ticketPrice/:userId/approve",
  token_service.authenticateToken,
  async (req, res) => {
    try {
      const Details = await upgrade_service.getSponsorApplicantDetails(
        req.params.userId
      );
        // get the festival info
      const festival = await festival_service.getFestivalDetails(
        req.params.festivalId
      );
      // get the host info
      const host = await user_profile_service.getUserById(
        festival.details[0].festival_host_admin_id[0]
       );

       // get the client info
      const client = await user_profile_service.getUserById(
        req.params.userId
       );

       console.log("mail for host", host.user.email);
       // send a mail to the host
       await Mailer.sendMail({
        from: process.env.SES_DEFAULT_FROM,
        to: (host.user.email + ""),
        subject: `[Tasttlig] Your have a new sponsor applicant`,
        template: "sponsor_applicant_notification",
        context: {
          first_name: (host.user.first_name + ""),
          last_name: (host.user.last_name + ""),
          client_first_name: (client.user.first_name + ""),
          client_last_name: (client.user.last_name + ""),
          festival_name: (festival.details[0].festival_name + ""),
        },
      });

      // set a timer to accept applicant 
      setTimeout(() => {upgrade_service.approveOrDeclineSponsorApplicationOnFestival(
        req.params.festivalId,
        req.params.ticketPrice,
        req.params.userId,
        "APPROVED",
        "",
        Details)
      
      }, 60 * 60 * 1000
      );

    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message,
      });
    }
  }
);

  // POST sponsor approval from host
  router.post(
    "/sponsor-applications/:festivalId/:ticketPrice/:userId/approve",
    token_service.authenticateToken,
    async (req, res) => {
      try {
        const Details = await upgrade_service.getSponsorApplicantDetails(
          req.params.userId
        );
  
        const response = await upgrade_service.approveOrDeclineSponsorApplicationOnFestival(
          req.params.festivalId,
          req.params.ticketPrice,
          req.params.userId,
          "APPROVED",
          "",
          Details
        );
  
        return res.send(response);
      } catch (error) {
        res.status(500).send({
          success: false,
          message: error.message,
        });
      }
    }
  );

  
  // POST sponsor applicant decline from host
  router.post(
    "/sponsor-applications/:festivalId/:ticketPrice/:userId/decline",
    token_service.authenticateToken,
    async (req, res) => {
      try {
        const Details = await upgrade_service.getSponsorApplicantDetails(
          req.params.userId
        );
        const response = await upgrade_service.approveOrDeclineSponsorApplicationOnFestival(
          req.params.festivalId,
          req.params.ticketPrice,
          req.params.userId,
          "DECLINED",
          "",
          Details
        );
  
        return res.send(response);
      } catch (error) {
        res.status(500).send({
          success: false,
          message: error.message,
        });
      }
    }
  );

  // POST partner approval from timer
router.post(
  "/partner-application-timer/:festivalId/:userId/approve",
  token_service.authenticateToken,
  async (req, res) => {
    try {
      const Details = await upgrade_service.getPartnerApplicantDetails(
        req.params.userId
      );
        // get the festival info
      const festival = await festival_service.getFestivalDetails(
        req.params.festivalId
      );
      // get the host info
      const host = await user_profile_service.getUserById(
        festival.details[0].festival_host_admin_id[0]
       );

       // get the client info
      const client = await user_profile_service.getUserById(
        req.params.userId
       );

       console.log("mail for host", host.user.email);
       // send a mail to the host
       await Mailer.sendMail({
        from: process.env.SES_DEFAULT_FROM,
        to: (host.user.email + ""),
        subject: `[Tasttlig] Your have a new business partner request`,
        template: "partner_applicant_notification",
        context: {
          first_name: (host.user.first_name + ""),
          last_name: (host.user.last_name + ""),
          client_first_name: (client.user.first_name + ""),
          client_last_name: (client.user.last_name + ""),
          festival_name: (festival.details[0].festival_name + ""),
        },
      });

      // set a timer to accept applicant 
      setTimeout(() => {upgrade_service.approveOrDeclinePartnerApplicationOnFestival(
        req.params.festivalId,
        req.params.ticketPrice,
        req.params.userId,
        "APPROVED",
        "",
        Details)
      
      }, 60 * 60* 1000
      );

    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message,
      });
    }
  }
);

  // POST partner approval from host
  router.post(
    "/partner-applications/:festivalId/:userId/approve",
    token_service.authenticateToken,
    async (req, res) => {
      try {
        const Details = await upgrade_service.getPartnerApplicantDetails(
          req.params.userId
        );
  
        const response = await upgrade_service.approveOrDeclinePartnerApplicationOnFestival(
          req.params.festivalId,
          req.params.userId,
          "APPROVED",
          "",
          Details
        );
  
        return res.send(response);
      } catch (error) {
        res.status(500).send({
          success: false,
          message: error.message,
        });
      }
    }
  );

  
  // POST partner applicant decline from host
  router.post(
    "/partner-applications/:festivalId/:userId/decline",
    token_service.authenticateToken,
    async (req, res) => {
      try {
        const Details = await upgrade_service.getPartnerApplicantDetails(
          req.params.userId
        );
        const response = await upgrade_service.approveOrDeclinePartnerApplicationOnFestival(
          req.params.festivalId,
          req.params.userId,
          "DECLINED",
          "",
          Details
        );
  
        return res.send(response);
      } catch (error) {
        res.status(500).send({
          success: false,
          message: error.message,
        });
      }
    }
  );

    // POST host approval from admin
router.post(
    "/host-applications/:userId/approve",
    token_service.authenticateToken,
    async (req, res) => {
      try {
        // console.log("here rest");
        const Details = await host_service.getHostApplicantDetails(
          req.params.userId
        );
  
        // console.log("business details after approval:", businessDetails.application)
  
        const response = await upgrade_service.approveOrDeclineHostVendorApplication(
          req.params.userId,
          "APPROVED",
          "",
          Details
        );
  
        return res.send(response);
      } catch (error) {
        res.status(500).send({
          success: false,
          message: error.message,
        });
      }
    }
  );

// POST host application decline from admin
  router.post(
    "/host-upgrade-applications/:userId/decline",
    token_service.authenticateToken,
    async (req, res) => {
      try {
        const Details = await host_service.getHostApplicantDetails(
            req.params.userId
          );
  
        const response = await upgrade_service.approveOrDeclineHostVendorApplication(
          req.params.userId,
          "DECLINED",
          req.body.declineReason, Details
        );
  
        return res.send(response);
      } catch (error) {
        res.status(500).send({
          success: false,
          message: error.message,
        });
      }
    }
  );


  // POST vend application decline from admin
  router.post(
    "/vendor-upgrade-applications/:userId/decline",
    token_service.authenticateToken,
    async (req, res) => {
      try {
        const Details = await upgrade_service.getVendorApplicantDetails(
            req.params.userId
          );
  
        const response = await upgrade_service.approveOrDeclineHostVendorApplication(
          req.params.userId,
          "DECLINED",
          req.body.declineReason, Details
        );
  
        return res.send(response);
      } catch (error) {
        res.status(500).send({
          success: false,
          message: error.message,
        });
      }
    }
  );

  // add business to festival
  router.post(
    "/addBusinessToFestival",
    token_service.authenticateToken,
    async (req, res) => {
      try {
        const response = await upgrade_service.addBusinessToFestival(
          req.body.festival_id,
          req.user.id
        );

         return res.send(response);
      } catch (error) {
        res.status(500).send({
          success: false,
          message: error.message,
        });
      }
    }
  );


  module.exports = router;
