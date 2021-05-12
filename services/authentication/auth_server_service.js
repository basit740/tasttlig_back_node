// Libraries
const axios = require("axios");
const user_profile_service = require("../profile/user_profile");

// Environment variables
const auth_server_url = process.env.AUTH_SERVER;

// Authenticate user sign up helper function
const authSignup = async (email, password, passport_id = "") => {
  let response = await axios({
    url: `${auth_server_url}/auth/register`,
    method: "POST",
    data: {
      email,
      password,
      passport_id,
    },
  });

  return response.data;
};

// Authenticate user login helper function
const authLogin = async (email, password) => {
  let response = await axios({
    url: `${auth_server_url}/auth/login`,
    method: "POST",
    headers: {
      "access-control-allow-origin": "*",
    },
    data: {
      email,
      password,
    },
  });

  return response.data;
};

// Authenticate user password reset request helper function
const authPasswordResetRequest = async (email) => {
  let response = await axios({
    url: `${auth_server_url}/auth/password-reset-req`,
    method: "POST",
    data: {
      email,
    },
  });

  return response.data;
};

// Authenticate user password reset helper function
const authPasswordReset = async (token, password) => {
  let response = await axios({
    url: `${auth_server_url}/auth/password-reset`,
    method: "POST",
    data: {
      token,
      password,
    },
  });

  return response.data;
};

// Authenticate user role addition helper function
const authAddRole = async (user_id, role_code) => {
  let response = await axios({
    url: `${auth_server_url}/auth/add-role`,
    method: "POST",
    data: {
      user_id,
      role_code,
    },
  });

  return response.data;
};

// Authenticate user role removal helper function
const authRemoveRole = async (user_id, role_code) => {
  let response = await axios({
    url: `${auth_server_url}/auth/remove-role`,
    method: "POST",
    data: {
      user_id,
      role_code,
    },
  });

  return response.data;
};

// Authenticate add points to user helper function
const authAddPoints = async (user_id, point) => {
  let response = await axios({
    url: `${auth_server_url}/auth/add-point`,
    method: "POST",
    data: {
      user_id,
      point,
    },
  });

  return response.data;
};
// Add new product to central server
const createNewProductInCentralServer = async (
  db_user,
  all_product_details,
  images
) => {
  let response = await axios({
    url: `${auth_server_url}/auth/add-product`,
    method: "POST",
    data: {
      db_user,
      all_product_details,
      images,
    },
  });

  return response.data;
};
// Add new experience to central server
const createNewExperienceInCentralServer = async (
  db_user,
  experience_information,
  images
) => {
  let response = await axios({
    url: `${auth_server_url}/auth/add-experience`,
    method: "POST",
    data: {
      db_user,
      experience_information,
      images,
    },
  });

  return response.data;
};
// Add new service to central server
const createNewServiceInCentralServer = async (
  db_user,
  service_information,
  images
) => {
  let response = await axios({
    url: `${auth_server_url}/auth/add-service`,
    method: "POST",
    data: {
      db_user,
      service_information,
      images,
    },
  });

  return response.data;
};

//delete product in central server
const deleteProductInCentralServer = async (email, product_information) => {
  let response = await axios({
    url: `${auth_server_url}/auth/remove-product`,
    method: "POST",
    data: {
      email,
      product_information,
    },
  });

  return response.data;
};
//delete product in central server
const deleteServiceInCentralServer = async (email, service_information) => {
  let response = await axios({
    url: `${auth_server_url}/auth/remove-service`,
    method: "POST",
    data: {
      service_information,
      email,
    },
  });

  return response.data;
};

module.exports = {
  authSignup,
  authLogin,
  authPasswordResetRequest,
  authPasswordReset,
  authAddRole,
  authRemoveRole,
  authAddPoints,
  createNewProductInCentralServer,
  createNewExperienceInCentralServer,
  createNewServiceInCentralServer,
  deleteProductInCentralServer,
  deleteServiceInCentralServer,
};
