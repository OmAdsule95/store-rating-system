const express = require("express");

const {
  getDashboard,
  createUser,
  createStore,
  getUsers,
  getStores,
  getUserDetails,
  deleteUser
} = require("../controllers/admin.controller");

const {
  authenticate,
  authorize
} = require("../middleware/auth.middleware");

const router = express.Router();

// Admin Dashboard
router.get(
  "/dashboard",
  authenticate,
  authorize("ADMIN"),
  getDashboard
);

// Create User / Admin
router.post(
  "/users",
  authenticate,
  authorize("ADMIN"),
  createUser
);

// Create Store
router.post(
  "/stores",
  authenticate,
  authorize("ADMIN"),
  createStore
);

// Get Users
router.get(
  "/users",
  authenticate,
  authorize("ADMIN"),
  getUsers
);

// Get Stores
router.get(
  "/stores",
  authenticate,
  authorize("ADMIN"),
  getStores
);

// Get User Details
router.get(
  "/users/:id",
  authenticate,
  authorize("ADMIN"),
  getUserDetails
);

// Delete User

router.delete(
  "/users/:id",
  authenticate,
  authorize("ADMIN"),
  deleteUser
);

module.exports = router;