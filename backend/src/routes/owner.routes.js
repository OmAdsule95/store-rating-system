const express = require("express");

const {
  getOwnerDashboard
} = require("../controllers/owner.controller");

const {
  authenticate,
  authorize
} = require("../middleware/auth.middleware");

const router = express.Router();

router.get(
  "/dashboard",
  authenticate,
  authorize("OWNER"),
  getOwnerDashboard
);

module.exports = router;