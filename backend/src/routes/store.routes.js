const express = require("express");

const {
  getStores,
  createStore
} = require("../controllers/store.controller");

const {
  authenticate
} = require("../middleware/auth.middleware");

const router = express.Router();


// ========================================
// GET ALL STORES
// ========================================

router.get(
  "/",
  authenticate,
  getStores
);


// ========================================
// CREATE STORE
// OWNER ONLY
// ========================================

router.post(
  "/",
  authenticate,
  createStore
);


module.exports = router;