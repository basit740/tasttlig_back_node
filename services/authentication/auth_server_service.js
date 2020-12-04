const axios = require("axios");
const auth_server_url = process.env.AUTH_SERVER;

async function getAuthUserByEmail(email) {
  let response = await axios({
    url: auth_server_url + "/auth/get-user-by-email/" + email,
    method: 'get',
    headers: {
      'access-control-allow-origin': '*'
    }
  })
  return response.data
}

async function getAuthUserById(auth_user_id) {
  let response = await axios({
    url: auth_server_url + "/auth/get-user-by-id/" + auth_user_id,
    method: 'get',
    headers: {
      'access-control-allow-origin': '*'
    }
  })
  return response.data
}

async function authLogin(email, password) {
  let response = await axios({
    url: auth_server_url + "/auth/login",
    method: 'post',
    headers: {
      'access-control-allow-origin': '*'
    },
    data: {
      email: email,
      password: password
    }
  })
  return response.data
}

async function authSignup(email, password, passport_id = "") {
  let response = await axios({
    url: auth_server_url + "/auth/register",
    method: 'post',
    data: {
      email: email,
      password: password,
      passport_id: passport_id
    }
  })
  return response.data
}

async function authPasswordReset(token, password) {
  let response = await axios({
    url: auth_server_url + "/auth/password-reset",
    method: 'post',
    data: {
      token: token,
      password: password
    }
  })
  return response.data
}

async function authPasswordResetRequest(email) {
  let response = await axios({
    url: auth_server_url + "/auth/password-reset-req",
    method: 'post',
    data: {
      email: email
    }
  })
  return response.data
}

async function authAddRole(userId, role_code) {
  let response = await axios({
    url: auth_server_url + "/auth/add-role",
    method: 'post',
    data: {
      user_id: userId,
      role_code: role_code,
    }
  });
  return response.data
}

async function authRemoveRole(userId, role_code) {
  let response = await axios({
    url: auth_server_url + "/auth/remove-role",
    method: 'post',
    data: {
      user_id: userId,
      role_code: role_code,
    }
  })
  return response.data
}

async function authAddPoints(userId, point) {
  let response = await axios({
    url: auth_server_url + "/auth/add-point",
    method: 'post',
    data: {
      user_id: userId,
      point: point,
    }
  });
  return response.data
}

module.exports = {
  getAuthUserByEmail,
  getAuthUserById,
  authLogin,
  authSignup,
  authPasswordReset,
  authPasswordResetRequest,
  authAddRole,
  authRemoveRole,
  authAddPoints
}