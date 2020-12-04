"use strict"

const axios = require("axios");

const getKodidiSpecialsList = async () => {
  try {
    const response = await axios({
      method: "get",
      url: `${process.env.KODEDE_API_BASE}/tasttlig-api/specials_list`
    });
    return {success: true, specialsList: response.data.specialsList};
  } catch (e) {
    return {success: false, message: e};
  }
}

const saveKodidiSpecials = async (specials) => {
  try {
    await axios({
      method: "post",
      data: {specials},
      url: `${process.env.KODEDE_API_BASE}/tasttlig-api/specials`
    });
    return {success: true};
  } catch (e) {
    return {success: false, message: e};
  }
}

const getKodidiUserSpecialsList = async (user_email) => {
  try {
    const url = `${process.env.KODEDE_API_BASE}/tasttlig-api/specials/` + user_email;
    const response = await axios({
      method: "get",
      url: url,
    });
    return {success: true, specialsList: response.data.userSpecialsList};
  } catch (e) {
    return {success: false, message: e};
  }
}

module.exports = {
  getKodidiSpecialsList,
  saveKodidiSpecials,
  getKodidiUserSpecialsList
};
