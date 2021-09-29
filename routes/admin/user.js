"use strict";

// Libraries
const router = require("express").Router();
const token_service = require("../../services/authentication/token");
const authenticate_user_service = require("../../services/authentication/authenticate_user");
const user_profile_service = require("../../services/profile/user_profile");
const { generateRandomString } = require("../../functions/functions");
const role = require("../../models/UserRoles");
const User = require("../../models/User");
const access = require("../../models/AppAccess");

// POST user register
router.post(
  "/admin/add-user",
  token_service.authenticateToken,
  async (req, res) => {
    const {
      first_name,
      last_name,
      email,
      phone_number,
      is_participating_in_festival,
    } = req.body;

    if (!req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access.",
      });
    }

    try {
      const adminUserObject = await user_profile_service.getUserById(
        req.user.id
      );

      if (adminUserObject.success) {
        const adminUser = adminUserObject.user;
        const roles = adminUser.role;

        if (!roles.includes("ADMIN")) {
          return res.status(401).json({
            success: false,
            message: "Unauthorized access.",
          });
        }
      } else {
        return res.status(401).json({
          success: false,
          message: "Unauthorized access.",
        });
      }
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access.",
      });
    }

    if (!email) {
      return res.status(403).json({
        success: false,
        message: "Required parameters are not available in request.",
      });
    }

    try {
      const user = {
        first_name,
        last_name,
        email,
        password: generateRandomString(8),
        phone_number,
        is_participating_in_festival,
      };

      const response = await authenticate_user_service.userRegister(user, true);

      if (response.success) {
        res.status(200).send(response);
      } else {
        return res.status(401).json({
          success: false,
          message: "Email already exists.",
        });
      }
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  }
);

router.get("/admin/users", (req, res) => {
  authenticate_user_service
    .getAllUsers(req.query.page, req.query.searchText)
    .then((users) => {
      res.send(users);
    });
});

router.get("/admin/roles", (req, res) => {
  role.query().then((roles) => {
    res.send(roles);
  });
});

router.get("/admin/accesses", (req, res) => {
  access.query().then((accesses) => {
    res.send(accesses);
  });
});

router.post("/admin/update-role", async (req, res) => {
  const targetUser = await User.query().findById(req.body.user);
  const targetRoles = req.body.role.filter((role) => role != "GUA1");
  await targetUser
    .$relatedQuery("roles")
    .unrelate()
    .where("user_role_lookup.role_code", "!=", "GUA1");

  await targetUser.$relatedQuery("roles").relate(targetRoles);
  res.send({ success: true });
});

router.post("/admin/update-access", async (req, res) => {
  const targetUser = await User.query().findById(req.body.user);
  const targetAccess = req.body.access;

  await targetUser.$relatedQuery("access").unrelate();

  await targetUser.$relatedQuery("access").relate(targetAccess);
  res.send({ success: true });
});

module.exports = router;
