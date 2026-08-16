const express = require("express");

const {
  submitRating,
  updateRating,
  getMyRating
} = require("../controllers/rating.controller");

const {
  authenticate
} = require("../middleware/auth.middleware");

const router = express.Router();

// Submit rating
router.post("/", authenticate, submitRating);

// Update rating
router.put("/:storeId", authenticate, updateRating);

// Get my rating
router.get("/:storeId", authenticate, getMyRating);

module.exports = router;