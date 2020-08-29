"use strict";

const db = require("../../db/db-config");
const Mailer = require("../email/nodemailer").nodemailer_transporter;

const SITE_BASE = process.env.SITE_BASE;

const createNewFoodSampleClaim = async (db_user, food_sample_claim_details) => {
  try {
    return { success: true, details: "success" };
  } catch (err) {
    return { success: false, details: err.message };
  }
};

module.exports = {
  createNewFoodSampleClaim
};
