const express = require("express");

const {
  register,
  login,
  changePassword
} = require("../controllers/auth.controller");

const router = express.Router();


// ==================================================
// REGISTER
// ==================================================

router.post(
  "/register",
  register
);


// ==================================================
// LOGIN
// ==================================================

router.post(
  "/login",
  login
);


// ==================================================
// CHANGE PASSWORD
// ==================================================

router.post(
  "/change-password",
  changePassword
);


module.exports = router;