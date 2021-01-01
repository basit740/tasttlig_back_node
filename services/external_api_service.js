"use strict";

// Libraries
const axios = require("axios");

// Get Kodidi specials list helper function
const getKodidiSpecialsList = async () => {
  try {
    const response = await axios({
      method: "GET",
      url: `${process.env.KODEDE_API_BASE}/tasttlig-api/specials_list`,
    });

    return { success: true, specialsList: response.data.specialsList };
  } catch (error) {
    return { success: false, message: error };
  }
};

// Save Kodidi specials helper function
const saveKodidiSpecials = async (specials) => {
  try {
    await axios({
      method: "POST",
      data: { specials },
      url: `${process.env.KODEDE_API_BASE}/tasttlig-api/specials`,
    });

    return { success: true };
  } catch (error) {
    return { success: false, message: error };
  }
};

// Get Kodidi specials list from user helper function
const getKodidiUserSpecialsList = async (user_email) => {
  try {
    const response = await axios({
      method: "GET",
      url: `${process.env.KODEDE_API_BASE}/tasttlig-api/specials/${user_email}`,
    });

    return { success: true, specialsList: response.data.userSpecialsList };
  } catch (error) {
    return { success: false, message: error };
  }
};

module.exports = {
  getKodidiSpecialsList,
  saveKodidiSpecials,
  getKodidiUserSpecialsList,
};
