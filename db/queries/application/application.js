"use strict";

// Application table configuration
const environment = process.env.NODE_ENV || "development";
const configuration = require("../../../knexfile")[environment];
const db = require("knex")(configuration);

// Export Applications table
module.exports = {
  getUserapplication: async user_id => {
    try {
      const returning = await db("applications").where("user_id", user_id);
      return { success: true, applications: returning };
    } catch (err) {
      return { success: false, message: "No Application found." };
    }
  },
  getAllapplication: async () => {
    try {
      const returning = await db("applications").where("quantity", ">", 0);
      return { success: true, applications: returning };
    } catch (err) {
      return { success: false, message: "No Application found." };
    }
  },
  createapplication: async (application) => {
    const firstName= application.firstName;
    const lastName= application.lastName;
    const email= application.email;
    const phone= application.phone;
    const city= application.city;
    const businesscity= application.businesscity;
    const state= application.state;
    const country= application.country;
    const postalCode= application.postalCode;
    const registrationNumber= application.registrationNumber;
    const facebook= application.facebook;
    const instagram= application.instagram;
    const yelpReviews= application.yelpReviews;
    const googleReview= application.googleReview;
    const tripAdviserReview= application.tripAdviserReview;
    const instagramReview= application.instagramReview;
    const youtubeReview= application.youtubeReview;
    const mediaRecognition= application.mediaRecognition;
    const hostSelection= application.hostSelection;
    const hostSelectionVideo= application.hostSelectionVideo;
    const Banking= application.Banking;
    const businesstype= application.businesstype;
    const culture= application.culture;
    const culturesToExplore= application.culturesToExplore;
    const Insurance= application.Insurance;
    const businessName= application.businessName;
    const onlineEmail= application.onlineEmail;
    const payPalEmail= application.payPalEmail;
    const stripeAccount= application.stripeAccount;
    const addressline1= application.addressline1;
    const addressline2= application.addressline2;
    const Health= application.Health;
    const insuranceFile= application.insuranceFile;
    const foodHandler= application.foodHandler;
    const bankNumber= application.bankNumber;
    const accountNumber= application.accountNumber;
    const institutionNumber= application.institutionNumber;
    const voidCheque= application.voidCheque;
    try {
      const returning = await db("applications")
        .insert({
            firstName,
            lastName,
            email,
            phone,
            city,
            businesscity,
            state,
            country,
            postalCode,
            registrationNumber,
            facebook,
            instagram,
            yelpReviews,
            googleReview,
            tripAdviserReview,
            instagramReview,
            youtubeReview,
            mediaRecognition,
            hostSelection,
            hostSelectionVideo,
            Banking,
            businesstype,
            culture,
            culturesToExplore,
            Insurance,
            businessName,
            onlineEmail,
            payPalEmail,
            stripeAccount,
            addressline1,
            addressline2,
            Health,
            insuranceFile,
            foodHandler,
            bankNumber,
            accountNumber,
            institutionNumber,
            voidCheque
        })
        .returning("*");
      if (returning) return (response = { success: true});
    } catch (err) {
      return (response = { success: false, data: err });
    }
  },
};
